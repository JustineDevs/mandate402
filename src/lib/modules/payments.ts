import type {
  PaymentAttempt,
  ReceiptEvidenceStatus,
  Vendor,
} from "@/lib/domain/types";
import { nowIso } from "@/lib/infrastructure/clock";
import {
  getFallbackVendorEndpoint,
  getFallbackVendorStatusEndpoint,
  getPrimaryVendorEndpoint,
  getPrimaryVendorStatusEndpoint,
} from "@/lib/infrastructure/env";
import {
  fallbackGateAllowsWrapper,
  readFallbackGate,
} from "@/lib/infrastructure/fallback-gate";
import { createId } from "@/lib/infrastructure/id";
import { getPaymentFetch } from "@/lib/infrastructure/x402-client";

export type DispatchResult =
  | {
      status: "executed_charge_succeeded";
      chargeReference: string;
      receiptEvidence: ReceiptEvidenceStatus;
    }
  | {
      status: "executed_charge_failed";
      chargeReference: null;
      receiptEvidence: ReceiptEvidenceStatus;
    }
  | {
      status: "execution_unknown";
      chargeReference: string | null;
      receiptEvidence: ReceiptEvidenceStatus;
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
};

async function postToVendor(
  endpoint: string,
  { vendor, amountCents, paymentIdentifier, mandateId }: DispatchInput,
): Promise<DispatchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  const fetchWithPayment = getPaymentFetch();

  try {
    const response = await fetchWithPayment(endpoint, {
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

    const body = (await response.json().catch(() => null)) as {
      chargeReference?: string;
      receiptEvidence?: ReceiptEvidenceStatus;
    } | null;

    if (!response.ok) {
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
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: "execution_unknown",
        chargeReference: null,
        receiptEvidence: "required_pending",
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
    return {
      status: "executed_charge_failed",
      chargeReference: null,
      receiptEvidence: "missing_timeout",
    };
  }

  return postToVendor(endpoint, input);
}

async function runFallbackVendorAdapter(
  input: DispatchInput,
): Promise<DispatchResult> {
  const gate = await readFallbackGate();
  if (!fallbackGateAllowsWrapper(gate)) {
    return {
      status: "executed_charge_failed",
      chargeReference: null,
      receiptEvidence: "missing_timeout",
    };
  }

  const endpoint = getFallbackVendorEndpoint();
  if (!endpoint) {
    return {
      status: "executed_charge_failed",
      chargeReference: null,
      receiptEvidence: "missing_timeout",
    };
  }

  return postToVendor(endpoint, input);
}

async function readVendorStatus(
  endpoint: string,
  paymentIdentifier: string,
  chargeReference: string | null,
): Promise<CorrelationResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-payment-identifier": paymentIdentifier,
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
}) {
  const endpoint =
    input.vendor.mode === "fallback-only"
      ? getFallbackVendorStatusEndpoint()
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
