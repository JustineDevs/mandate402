import { createHmac } from "node:crypto";

import type {
  PaymentAttempt,
  ReceiptEvidenceStatus,
  Vendor,
} from "@/lib/domain/types";
import { nowIso } from "@/lib/infrastructure/clock";
import {
  getMorphX402FacilitatorUrl,
  getPrimaryVendorEndpoint,
  getPrimaryVendorStatusEndpoint,
  getVendorStatusToken,
} from "@/lib/infrastructure/env";
import { createId } from "@/lib/infrastructure/id";
import { getPaymentRuntime } from "@/lib/infrastructure/x402-client";

export type DispatchResult =
  | {
      status: "executed_charge_succeeded";
      chargeReference: string;
      receiptEvidence: ReceiptEvidenceStatus;
      finalAmountCents?: number | null;
    }
  | {
      status: "executed_charge_failed";
      chargeReference: string | null;
      receiptEvidence: ReceiptEvidenceStatus;
      finalAmountCents?: number | null;
    }
  | {
      status: "execution_unknown";
      chargeReference: string | null;
      receiptEvidence: ReceiptEvidenceStatus;
      paymentPayloadJson: string;
      paymentRequirementsJson: string;
    };

type DispatchInput = {
  vendor: Vendor;
  amountCents: number;
  paymentIdentifier: string;
  mandateId: string;
};

export type CorrelationResult = {
  status: "executed_charge_succeeded" | "executed_charge_failed";
  chargeReference: string | null;
  receiptEvidence: Exclude<
    ReceiptEvidenceStatus,
    "not_required" | "required_pending"
  >;
  finalAmountCents?: number | null;
};

type FacilitatorVerificationResult =
  | { kind: "unavailable" }
  | { kind: "invalid" }
  | { kind: "valid" };

const VENDOR_REQUEST_TIMEOUT_MS = 8_000;

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([left], [right]) => left.localeCompare(right),
    );
    return `{${entries
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

async function fetchWithTimeout(request: Request) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    VENDOR_REQUEST_TIMEOUT_MS,
  );

  try {
    return await fetch(
      new Request(request, {
        signal: controller.signal,
      }),
    );
  } finally {
    clearTimeout(timeout);
  }
}

function buildFacilitatorAuthHeaders(
  path: string,
  rawBody: string,
): Record<string, string> {
  const accessKey = process.env.MORPH_X402_ACCESS_KEY?.trim();
  const secretKey = process.env.MORPH_X402_SECRET_KEY?.trim();
  if (!accessKey || !secretKey) {
    return {};
  }

  const timestamp = String(Date.now());
  const signMap = {
    "MORPH-ACCESS-KEY": accessKey,
    "MORPH-ACCESS-TIMESTAMP": timestamp,
    "MORPH-ACCESS-METHOD": "POST",
    "MORPH-ACCESS-PATH": path,
    "MORPH-ACCESS-BODY": JSON.parse(rawBody),
  };
  const sign = createHmac("sha256", secretKey)
    .update(stableJson(signMap))
    .digest("base64");

  return {
    "MORPH-ACCESS-KEY": accessKey,
    "MORPH-ACCESS-TIMESTAMP": timestamp,
    "MORPH-ACCESS-SIGN": sign,
  };
}

async function verifyWithFacilitator(
  paymentPayloadJson: string,
  paymentRequirementsJson: string,
): Promise<FacilitatorVerificationResult> {
  const accessKey = process.env.MORPH_X402_ACCESS_KEY?.trim();
  const secretKey = process.env.MORPH_X402_SECRET_KEY?.trim();
  const baseUrl = getMorphX402FacilitatorUrl();
  if (!baseUrl || !accessKey || !secretKey) {
    return { kind: "unavailable" };
  }

  const verifyUrl = new URL(
    "verify",
    `${baseUrl.replace(/\/$/, "")}/`,
  ).toString();
  const rawBody = JSON.stringify({
    paymentPayload: JSON.parse(paymentPayloadJson),
    paymentRequirements: JSON.parse(paymentRequirementsJson),
  });

  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...buildFacilitatorAuthHeaders(new URL(verifyUrl).pathname, rawBody),
    },
    body: rawBody,
  });

  if (!response.ok) {
    return { kind: "unavailable" };
  }

  const body = (await response.json()) as {
    isValid?: boolean;
    invalidReason?: string;
  };

  if (body.isValid === false) {
    return { kind: "invalid" };
  }

  if (body.isValid === true) {
    return { kind: "valid" };
  }

  return { kind: "unavailable" };
}

async function postToVendor(
  endpoint: string,
  { vendor, amountCents, paymentIdentifier, mandateId }: DispatchInput,
): Promise<DispatchResult> {
  const { client, httpClient } = getPaymentRuntime();
  let paymentRequired: ReturnType<
    typeof httpClient.getPaymentRequiredResponse
  > | null = null;
  let paymentPayload: Awaited<
    ReturnType<typeof client.createPaymentPayload>
  > | null = null;

  try {
    const request = new Request(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-payment-identifier": paymentIdentifier,
        "x-mandate-id": mandateId,
        "x-mandate402-amount-cents": String(amountCents),
        "x-vendor-id": vendor.id,
      },
      body: JSON.stringify({
        amountCents,
      }),
    });
    const firstResponse = await fetchWithTimeout(request.clone());
    if (firstResponse.status !== 402) {
      const body = (await firstResponse.json().catch(() => null)) as {
        chargeReference?: string;
        receiptEvidence?: ReceiptEvidenceStatus;
        finalAmountCents?: number | null;
      } | null;

      if (!firstResponse.ok) {
        return {
          status: "executed_charge_failed",
          chargeReference: null,
          receiptEvidence: body?.receiptEvidence ?? "missing_timeout",
          finalAmountCents: body?.finalAmountCents ?? null,
        };
      }

      return {
        status: "executed_charge_succeeded",
        chargeReference:
          body?.chargeReference ??
          `${vendor.id}_${amountCents}_${createId("charge")}`,
        receiptEvidence: body?.receiptEvidence ?? "required_pending",
        finalAmountCents: body?.finalAmountCents ?? null,
      };
    }

    paymentRequired = httpClient.getPaymentRequiredResponse((name) =>
      firstResponse.headers.get(name),
    );
    paymentPayload = await client.createPaymentPayload(paymentRequired);
    const paymentHeaders =
      httpClient.encodePaymentSignatureHeader(paymentPayload);
    const secondRequest = request.clone();
    for (const [key, value] of Object.entries(paymentHeaders)) {
      secondRequest.headers.set(key, value);
    }

    const response = await fetchWithTimeout(secondRequest);
    await httpClient.processPaymentResult(
      paymentPayload,
      (name) => response.headers.get(name),
      response.status,
    );
    const body = (await response.json().catch(() => null)) as {
      chargeReference?: string;
      receiptEvidence?: ReceiptEvidenceStatus;
      finalAmountCents?: number | null;
    } | null;

    if (!response.ok) {
      return {
        status: "executed_charge_failed",
        chargeReference: body?.chargeReference ?? null,
        receiptEvidence: body?.receiptEvidence ?? "missing_timeout",
        finalAmountCents: body?.finalAmountCents ?? null,
      };
    }

    return {
      status: "executed_charge_succeeded",
      chargeReference:
        body?.chargeReference ??
        `${vendor.id}_${amountCents}_${createId("charge")}`,
      receiptEvidence: body?.receiptEvidence ?? "required_pending",
      finalAmountCents: body?.finalAmountCents ?? null,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      if (paymentRequired && paymentPayload) {
        return {
          status: "execution_unknown",
          chargeReference: null,
          receiptEvidence: "required_pending",
          paymentPayloadJson: JSON.stringify(paymentPayload),
          paymentRequirementsJson: JSON.stringify(paymentRequired),
        };
      }
      // Timed out before a 402 / signed payload existed — vendor outcome is indeterminate.
      return {
        status: "execution_unknown",
        chargeReference: null,
        receiptEvidence: "required_pending",
        paymentPayloadJson: "",
        paymentRequirementsJson: "",
      };
    }

    return {
      status: "executed_charge_failed",
      chargeReference: null,
      receiptEvidence: "missing_timeout",
    };
  }
}

async function runPrimaryVendorAdapter(
  input: DispatchInput,
): Promise<DispatchResult> {
  const endpoint = getPrimaryVendorEndpoint(input.vendor.id);
  if (!endpoint) {
    throw new Error(
      `Primary vendor endpoint is not configured for ${input.vendor.id}.`,
    );
  }

  return postToVendor(endpoint, input);
}

async function runFallbackVendorAdapter(
  input: DispatchInput,
): Promise<DispatchResult> {
  throw new Error(
    `Fallback vendor execution is disabled for live runtime (${input.vendor.id}).`,
  );
}

async function readVendorStatus(
  endpoint: string,
  paymentIdentifier: string,
  chargeReference: string | null,
): Promise<CorrelationResult> {
  const statusToken = getVendorStatusToken();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-payment-identifier": paymentIdentifier,
      ...(statusToken ? { authorization: `Bearer ${statusToken}` } : {}),
    },
    body: JSON.stringify({
      chargeReference,
    }),
  });

  if (!response.ok) {
    throw new Error(`Status correlation failed with ${response.status}.`);
  }

  const body = (await response.json()) as {
    status: "executed_charge_succeeded" | "executed_charge_failed";
    chargeReference: string | null;
    receiptEvidence: ReceiptEvidenceStatus;
    finalAmountCents?: number | null;
  };

  if (body.receiptEvidence === "required_pending") {
    throw new Error(
      "Vendor status correlation is still pending receipt evidence.",
    );
  }

  if (
    body.status !== "executed_charge_succeeded" &&
    body.status !== "executed_charge_failed"
  ) {
    throw new Error(
      "Vendor status correlation returned an unexpected payload.",
    );
  }

  if (body.receiptEvidence === "not_required") {
    throw new Error(
      "Vendor status correlation returned an unexpected payload.",
    );
  }

  const normalized: CorrelationResult = {
    status: body.status,
    chargeReference: body.chargeReference,
    receiptEvidence:
      body.receiptEvidence as CorrelationResult["receiptEvidence"],
    ...(body.finalAmountCents !== undefined
      ? { finalAmountCents: body.finalAmountCents }
      : {}),
  };

  return normalized;
}

export async function dispatchAttempt(input: DispatchInput) {
  if (input.vendor.mode === "fallback-only") {
    return runFallbackVendorAdapter(input);
  }

  return runPrimaryVendorAdapter(input);
}

export async function correlateAttemptStatus(input: {
  vendor: Vendor;
  paymentIdentifier: string;
  chargeReference: string | null;
  paymentPayloadJson?: string | null;
  paymentRequirementsJson?: string | null;
}): Promise<CorrelationResult> {
  let facilitatorVerification: FacilitatorVerificationResult = {
    kind: "unavailable",
  };

  if (input.paymentPayloadJson && input.paymentRequirementsJson) {
    facilitatorVerification = await verifyWithFacilitator(
      input.paymentPayloadJson,
      input.paymentRequirementsJson,
    );
    if (facilitatorVerification.kind === "invalid") {
      return {
        status: "executed_charge_failed",
        chargeReference: input.chargeReference,
        receiptEvidence: "missing_timeout",
      };
    }
  }

  const endpoint =
    input.vendor.mode === "fallback-only"
      ? undefined
      : getPrimaryVendorStatusEndpoint(input.vendor.id);

  if (!endpoint) {
    throw new Error("Vendor status endpoint is not configured.");
  }

  const vendorStatus = await readVendorStatus(
    endpoint,
    input.paymentIdentifier,
    input.chargeReference,
  );

  if (facilitatorVerification.kind === "valid") {
    return {
      status: "executed_charge_succeeded",
      chargeReference: vendorStatus.chargeReference ?? input.chargeReference,
      receiptEvidence: vendorStatus.receiptEvidence,
      finalAmountCents: vendorStatus.finalAmountCents ?? null,
    };
  }

  return vendorStatus;
}

export function materializeAttempt(
  mandateId: string,
  vendorId: string,
  operatorId: string,
  amountCents: number,
  paymentIdentifier = createId("pid"),
): PaymentAttempt {
  const now = nowIso();
  return {
    id: createId("att"),
    mandateId,
    vendorId,
    amountCents,
    operatorId,
    status: "created",
    financialOutcome: "created",
    receiptEvidence: "not_required",
    blockedReason: null,
    chargeReference: null,
    paymentIdentifier,
    createdAt: now,
    updatedAt: now,
  };
}
