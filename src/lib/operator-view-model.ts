import type { DashboardData } from "@/lib/dashboard-data";
import type {
  Mandate,
  PaymentAttempt,
  ReceiptEvidenceStatus,
  Vendor,
} from "@/lib/domain/types";
import type { CategoryLane } from "@/lib/types";

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function financialTone(status: PaymentAttempt["financialOutcome"]) {
  if (status === "executed_charge_succeeded") {
    return "success";
  }
  if (status === "policy_denied" || status === "executed_charge_failed") {
    return "danger";
  }
  return "warning";
}

export function receiptTone(status: ReceiptEvidenceStatus) {
  if (status === "received_valid") {
    return "success";
  }
  if (status === "received_invalid" || status === "missing_timeout") {
    return "danger";
  }
  return "warning";
}

export function mandateTone(status: Mandate["status"]) {
  if (status === "issued_active") {
    return "success";
  }
  if (status === "revoked" || status === "expired") {
    return "danger";
  }
  return "warning";
}

export function vendorStatusTone(status: Vendor["status"]) {
  if (status === "available") {
    return "success";
  }
  if (status === "blocked") {
    return "danger";
  }
  return "warning";
}

export function laneForAttempt(attempt: PaymentAttempt): CategoryLane {
  if (attempt.status === "policy_denied") {
    return "governance";
  }
  if (attempt.status === "execution_unknown") {
    return "compliance";
  }
  return "payments";
}

export function summarizeReceipt(attempt: PaymentAttempt) {
  if (attempt.status === "policy_denied") {
    return "No receipt is expected because the attempt never left the policy gate.";
  }
  if (attempt.receiptEvidence === "received_valid") {
    return "Receipt evidence is attached and consistent with the financial result.";
  }
  if (attempt.receiptEvidence === "missing_timeout") {
    return "The charge result is known, but receipt proof did not arrive within the review window.";
  }
  if (attempt.receiptEvidence === "received_invalid") {
    return "A receipt arrived but failed validation and needs operator review.";
  }
  return "Receipt proof is still pending while the operator loop waits for evidence.";
}

export function buildRevokedMandates(data: DashboardData) {
  return data.mandates.filter(
    (mandate) => mandate.status === "revoked" || mandate.status === "expired",
  );
}
