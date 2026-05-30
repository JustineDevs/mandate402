import type { StatusTone } from "@/components/status-pill";
import type {
  FallbackGate,
  MandateStatus,
  PaymentAttemptStatus,
  ReceiptEvidenceStatus,
  VendorMode,
  VendorStatus,
} from "@/lib/domain/types";

const TOKEN_LABELS: Record<string, string> = {
  // Runtime / system
  ok: "Healthy",
  degraded: "Degraded",
  unknown: "Unknown",
  ready: "Ready",
  pending: "Pending",
  disabled: "Disabled",
  active: "Active",
  revoked: "Revoked",
  complete: "Complete",
  incomplete: "Incomplete",
  verified: "Verified",
  linked_manual_review: "Linked (review)",
  sync_failed: "Sync failed",
  n_a: "Not available",
  "n/a": "Not available",

  // Onboarding
  needs_treasury_connection: "Wallet not linked",
  needs_treasury_link: "Wallet not linked",
  treasury_connection_required: "Wallet not linked",

  // Fallback gate
  primary_only: "Primary vendors only",
  fallback_not_yet_allowed: "Fallback not allowed",
  fallback_approved: "Fallback approved",
  fallback_activated: "Fallback active",

  // Mandate
  draft: "Draft",
  issued_active: "Active",
  issued_reserved: "Reserved",
  revoking: "Revoking",
  expired: "Expired",

  // Payment / receipt
  created: "Created",
  auth_validated: "Auth validated",
  policy_denied: "Policy denied",
  reserved: "Reserved",
  dispatch_queued: "Dispatch queued",
  dispatching: "Dispatching",
  execution_unknown: "Charge unknown",
  executed_charge_succeeded: "Charge succeeded",
  executed_charge_failed: "Charge failed",
  cancelled_released: "Cancelled",
  not_required: "Not required",
  required_pending: "Pending",
  received_valid: "Received",
  received_invalid: "Invalid",
  missing_timeout: "Missing (timeout)",

  // Vendor
  available: "Available",
  blocked: "Blocked",
  primary: "Primary",
  "fallback-only": "Fallback only",
  fallback_only: "Fallback only",

  // Wallet / treasury
  privy: "Provider wallet",
  external: "External wallet",
  turnkey: "Managed signer",
  embedded_7702: "Embedded (7702)",
  external_fusion: "External",
  managed_signer: "Managed signer",
  operator: "Operator",
  platform_admin: "Platform admin",
};

function humanizeToken(raw: string): string {
  const normalized = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (!normalized) {
    return "Unknown";
  }
  if (TOKEN_LABELS[normalized]) {
    return TOKEN_LABELS[normalized];
  }
  return normalized
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatOperatorToken(
  raw: string | null | undefined,
  fallback = "Unknown",
): string {
  if (raw == null || raw.trim() === "") {
    return fallback;
  }
  return humanizeToken(raw);
}

export function formatOnboardingState(raw: string | null | undefined): string {
  if (!raw || raw === "complete") {
    return raw === "complete" ? "Complete" : formatOperatorToken(raw);
  }
  return formatOperatorToken(raw);
}

export function onboardingStateTone(
  raw: string | null | undefined,
): StatusTone {
  if (raw === "complete") {
    return "success";
  }
  if (!raw) {
    return "neutral";
  }
  return "warning";
}

export function formatFallbackGateStatus(
  status: FallbackGate["decision_status"] | string,
): string {
  return formatOperatorToken(status);
}

export function fallbackGateTone(
  status: FallbackGate["decision_status"] | string,
): StatusTone {
  if (status === "primary_only") {
    return "success";
  }
  if (status === "fallback_approved" || status === "fallback_activated") {
    return "warning";
  }
  return "neutral";
}

export function runtimeStatusTone(raw: string): StatusTone {
  return raw === "ok" ? "success" : "warning";
}

export function formatMandateStatus(status: MandateStatus | string): string {
  return formatOperatorToken(status);
}

export function formatPaymentStatus(
  status: PaymentAttemptStatus | string,
): string {
  return formatOperatorToken(status);
}

export function formatReceiptEvidence(
  status: ReceiptEvidenceStatus | string,
): string {
  return formatOperatorToken(status);
}

export function formatVendorStatus(status: VendorStatus | string): string {
  return formatOperatorToken(status);
}

export function formatVendorMode(mode: VendorMode | string): string {
  return formatOperatorToken(mode);
}

export function formatWalletProvider(raw: string | null | undefined): string {
  if (!raw) {
    return "Not linked";
  }
  return formatOperatorToken(raw);
}

export function formatTreasuryMode(raw: string | null | undefined): string {
  if (!raw) {
    return "Not linked";
  }
  return formatOperatorToken(raw);
}

export function formatOperatorRole(raw: string): string {
  return formatOperatorToken(raw);
}

export function formatFinancialOutcome(status: string): string {
  return formatOperatorToken(status);
}

export function formatAuditEventType(type: string): string {
  return formatOperatorToken(type);
}

export function formatBlockedReason(raw: string | null | undefined): string {
  if (!raw) {
    return "Policy denied";
  }
  return formatOperatorToken(raw);
}
