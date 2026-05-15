import type {
  Mandate,
  MandateStatus,
  PaymentAttemptStatus,
} from "@/lib/domain/types";

const allowedMandateTransitions: Record<MandateStatus, MandateStatus[]> = {
  draft: ["issued_active"],
  issued_active: ["issued_reserved", "revoking", "expired"],
  issued_reserved: ["issued_active", "revoking", "expired"],
  revoking: ["revoked"],
  revoked: [],
  expired: [],
};

const allowedAttemptTransitions: Record<
  PaymentAttemptStatus,
  PaymentAttemptStatus[]
> = {
  created: ["auth_validated", "policy_denied"],
  auth_validated: ["policy_denied", "reserved"],
  policy_denied: [],
  reserved: ["cancelled_released", "dispatching"],
  dispatching: [
    "executed_charge_failed",
    "executed_charge_succeeded",
    "execution_unknown",
  ],
  execution_unknown: ["executed_charge_failed", "executed_charge_succeeded"],
  executed_charge_succeeded: [],
  executed_charge_failed: [],
  cancelled_released: [],
};

export function canTransitionMandate(from: MandateStatus, to: MandateStatus) {
  return allowedMandateTransitions[from].includes(to);
}

export function canTransitionAttempt(
  from: PaymentAttemptStatus,
  to: PaymentAttemptStatus,
) {
  return allowedAttemptTransitions[from].includes(to);
}

export function ensureMandateTransition(
  from: MandateStatus,
  to: MandateStatus,
) {
  if (!canTransitionMandate(from, to)) {
    throw new Error(`Invalid mandate transition: ${from} -> ${to}`);
  }
}

export function ensureAttemptTransition(
  from: PaymentAttemptStatus,
  to: PaymentAttemptStatus,
) {
  if (!canTransitionAttempt(from, to)) {
    throw new Error(`Invalid payment attempt transition: ${from} -> ${to}`);
  }
}

export function mandateCanReserve(mandate: Mandate) {
  return mandate.status === "issued_active" && mandate.reservedCents === 0;
}

export function availableBudgetCents(mandate: Mandate) {
  return mandate.budgetCapCents - mandate.consumedCents - mandate.reservedCents;
}
