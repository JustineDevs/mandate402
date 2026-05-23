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
    }
  | {
      status: "executed_charge_failed";
      chargeReference: string | null;
      receiptEvidence: ReceiptEvidenceStatus;
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

type CorrelationResult = {
  status: "executed_charge_succeeded" | "executed_charge_failed";
  chargeReference: string | null;
  receiptEvidence: Exclude<
    ReceiptEvidenceStatus,
    "not_required" | "required_pending"
  >;
  finalAmountCents?: number | null;
};

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
    .update(JSON.stringify(signMap))
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
): Promise<CorrelationResult | null> {
  const accessKey = process.env.MORPH_X402_ACCESS_KEY?.trim();
  const secretKey = process.env.MORPH_X402_SECRET_KEY?.trim();
  const baseUrl = getMorphX402FacilitatorUrl();
  if (!baseUrl || !accessKey || !secretKey) {
    return null;
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
    return null;
  }

  const body = (await response.json()) as {
    isValid?: boolean;
    invalidReason?: string;
  };

  if (body.isValid === false) {
    return {
      status: "executed_charge_failed",
      chargeReference: null,
      receiptEvidence: "missing_timeout",
    };
  }

  return null;
}

async function postToVendor(
  endpoint: string,
  { vendor, amountCents, paymentIdentifier, mandateId }: DispatchInput,
): Promise<DispatchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
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
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-payment-identifier": paymentIdentifier,
        "x-mandate-id": mandateId,
        "x-vendor-id": vendor.id,
      },
      body: JSON.stringify({
        amountCents,
      }),
    });
    const firstResponse = await fetch(request.clone());
    if (firstResponse.status !== 402) {
      const body = (await firstResponse.json().catch(() => null)) as {
        chargeReference?: string;
        receiptEvidence?: ReceiptEvidenceStatus;
      } | null;

      if (!firstResponse.ok) {
        return {
          status: "executed_charge_failed",
          chargeReference: null,
          receiptEvidence: body?.receiptEvidence ?? "missing_timeout",
        };
      }

      return {
        status: "executed_charge_succeeded",
        chargeReference:
          body?.chargeReference ??
          `${vendor.id}_${amountCents}_${createId("charge")}`,
        receiptEvidence: body?.receiptEvidence ?? "required_pending",
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

    const response = await fetch(secondRequest);
    await httpClient.processPaymentResult(
      paymentPayload,
      (name) => response.headers.get(name),
      response.status,
    );
    const body = (await response.json().catch(() => null)) as {
      chargeReference?: string;
      receiptEvidence?: ReceiptEvidenceStatus;
    } | null;

    if (!response.ok) {
      return {
        status: "executed_charge_failed",
        chargeReference: body?.chargeReference ?? null,
        receiptEvidence: body?.receiptEvidence ?? "missing_timeout",
      };
    }

    return {
      status: "executed_charge_succeeded",
      chargeReference:
        body?.chargeReference ??
        `${vendor.id}_${amountCents}_${createId("charge")}`,
      receiptEvidence: body?.receiptEvidence ?? "required_pending",
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
  } finally {
    clearTimeout(timeout);
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

  const body = (await response.json()) as CorrelationResult;
  return body;
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
}) {
  if (input.paymentPayloadJson && input.paymentRequirementsJson) {
    const facilitatorResult = await verifyWithFacilitator(
      input.paymentPayloadJson,
      input.paymentRequirementsJson,
    );
    if (facilitatorResult) {
      return facilitatorResult;
    }
  }

  const endpoint =
    input.vendor.mode === "fallback-only"
      ? undefined
      : getPrimaryVendorStatusEndpoint(input.vendor.id);

  if (!endpoint) {
    throw new Error("Vendor status endpoint is not configured.");
  }

  return readVendorStatus(
    endpoint,
    input.paymentIdentifier,
    input.chargeReference,
  );
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
