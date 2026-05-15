import {
  ensureAttemptTransition,
  ensureMandateTransition,
} from "@/lib/domain/state-machines";
import { isFutureIsoTimestamp } from "@/lib/domain/time";
import type { AuditEntry, DomainEvent, Mandate } from "@/lib/domain/types";
import { nowIso } from "@/lib/infrastructure/clock";
import { createId } from "@/lib/infrastructure/id";
import { withStoreLock } from "@/lib/infrastructure/store";
import {
  issueMandateAnchor,
  revokeMandateAnchor,
} from "@/lib/modules/morph-anchor";
import {
  correlateAttemptStatus,
  dispatchAttempt,
  materializeAttempt,
} from "@/lib/modules/payments";
import { evaluatePolicy } from "@/lib/modules/policy";
import { vendorRegistry } from "@/lib/vendor-registry";

export type CreateMandateInput = {
  name: string;
  agentId: string;
  agentName: string;
  budgetCapCents: number;
  expiresAt: string;
  approvedVendorIds: string[];
  requiresReceiptCapability: boolean;
  correlationId?: string | null;
};

function makeAudit(
  mandateId: string,
  type: AuditEntry["type"],
  message: string,
  attemptId: string | null = null,
): AuditEntry {
  return {
    id: createId("audit"),
    mandateId,
    attemptId,
    type,
    message,
    createdAt: nowIso(),
  };
}

function makeDomainEvent(input: {
  entityType: DomainEvent["entityType"];
  entityId: string;
  eventType: string;
  correlationId?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}): DomainEvent {
  return {
    id: createId("evt"),
    entityType: input.entityType,
    entityId: input.entityId,
    eventType: input.eventType,
    correlationId: input.correlationId ?? null,
    occurredAt: nowIso(),
    metadata: input.metadata ?? {},
  };
}

export async function listMandates() {
  return withStoreLock(async (data) => data.mandates);
}

export async function listAgents() {
  return withStoreLock(async (data) => data.agents);
}

export async function listAttempts() {
  return withStoreLock(async (data) => data.attempts);
}

export async function listAuditEntries() {
  return withStoreLock(async (data) => data.auditEntries);
}

export async function listDomainEvents() {
  return withStoreLock(async (data) => data.domainEvents);
}

export async function createMandate(input: CreateMandateInput) {
  return withStoreLock(async (data) => {
    if (!isFutureIsoTimestamp(input.expiresAt)) {
      throw new Error("Mandate expiry must be a future ISO timestamp.");
    }

    const agent = data.agents.find((entry) => entry.id === input.agentId);
    if (!agent || agent.status !== "active") {
      throw new Error("Agent must exist and be active.");
    }

    const now = nowIso();
    const mandateId = createId("mdt");
    const morphIssueTxId = await issueMandateAnchor(mandateId);
    const mandate: Mandate = {
      id: mandateId,
      name: input.name,
      agentId: input.agentId,
      agentName: input.agentName,
      status: "draft",
      budgetCapCents: input.budgetCapCents,
      reservedCents: 0,
      consumedCents: 0,
      requiresReceiptCapability: input.requiresReceiptCapability,
      approvedVendorIds: input.approvedVendorIds,
      morphIssueTxId,
      morphRevokeTxId: null,
      expiresAt: input.expiresAt,
      createdAt: now,
      updatedAt: now,
    };
    ensureMandateTransition(mandate.status, "issued_active");
    mandate.status = "issued_active";
    data.mandates.unshift(mandate);
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "mandate_issued",
        `Mandate issued and anchored on Morph (${morphIssueTxId}).`,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "mandate",
        entityId: mandate.id,
        eventType: "mandate_issued",
        correlationId: input.correlationId,
        metadata: {
          agentId: mandate.agentId,
          morphIssueTxId,
          status: mandate.status,
        },
      }),
    );
    return mandate;
  });
}

export async function revokeMandate(mandateId: string) {
  return withStoreLock(async (data) => {
    const mandate = data.mandates.find((entry) => entry.id === mandateId);
    if (!mandate) {
      throw new Error("Mandate not found.");
    }
    ensureMandateTransition(mandate.status, "revoking");
    mandate.status = "revoking";
    mandate.updatedAt = nowIso();
    mandate.morphRevokeTxId = await revokeMandateAnchor(mandate.id);
    ensureMandateTransition(mandate.status, "revoked");
    mandate.status = "revoked";
    mandate.updatedAt = nowIso();
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "mandate_revoked",
        `Mandate revoked and anchored on Morph (${mandate.morphRevokeTxId}).`,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "mandate",
        entityId: mandate.id,
        eventType: "mandate_revoked",
        metadata: {
          morphRevokeTxId: mandate.morphRevokeTxId,
          status: mandate.status,
        },
      }),
    );
    return mandate;
  });
}

export async function runAttempt(input: {
  mandateId: string;
  vendorId: string;
  amountCents: number;
  operatorId: string;
  paymentIdentifier?: string;
  correlationId?: string | null;
}) {
  return withStoreLock(async (data) => {
    const mandate = data.mandates.find((entry) => entry.id === input.mandateId);
    if (!mandate) {
      throw new Error("Mandate not found.");
    }

    if (input.paymentIdentifier) {
      const existingAttempt = data.attempts.find(
        (entry) => entry.paymentIdentifier === input.paymentIdentifier,
      );
      if (existingAttempt) {
        if (
          existingAttempt.mandateId !== input.mandateId ||
          existingAttempt.vendorId !== input.vendorId ||
          existingAttempt.amountCents !== input.amountCents ||
          existingAttempt.operatorId !== input.operatorId
        ) {
          throw new Error(
            "Payment identifier conflict: identifier already used for a different attempt.",
          );
        }
        return existingAttempt;
      }
    }

    const vendor = vendorRegistry.find((entry) => entry.id === input.vendorId);
    if (!vendor) {
      throw new Error("Vendor not found.");
    }
    const attempt = materializeAttempt(
      mandate.id,
      input.vendorId,
      input.operatorId,
      input.amountCents,
      input.paymentIdentifier,
    );

    ensureAttemptTransition(attempt.status, "auth_validated");
    attempt.status = "auth_validated";
    attempt.financialOutcome = "auth_validated";
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "auth_validated",
        "Operator authentication accepted.",
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "auth_validated",
        correlationId: input.correlationId,
        metadata: {
          mandateId: mandate.id,
          paymentIdentifier: attempt.paymentIdentifier,
        },
      }),
    );

    const policyResult = evaluatePolicy({
      mandate,
      vendor,
      amountCents: input.amountCents,
    });

    if (
      !policyResult.ok &&
      policyResult.reason === "mandate_not_active" &&
      mandate.status === "issued_active" &&
      Date.parse(mandate.expiresAt) <= Date.now()
    ) {
      ensureMandateTransition(mandate.status, "expired");
      mandate.status = "expired";
      mandate.updatedAt = nowIso();
      data.auditEntries.unshift(
        makeAudit(
          mandate.id,
          "mandate_expired",
          "Mandate expired before execution.",
        ),
      );
      data.domainEvents.unshift(
        makeDomainEvent({
          entityType: "mandate",
          entityId: mandate.id,
          eventType: "mandate_expired",
          correlationId: input.correlationId,
          metadata: {
            status: mandate.status,
          },
        }),
      );
    }

    if (!policyResult.ok) {
      ensureAttemptTransition(attempt.status, "policy_denied");
      attempt.status = "policy_denied";
      attempt.financialOutcome = "policy_denied";
      attempt.blockedReason = policyResult.reason;
      attempt.updatedAt = nowIso();
      data.attempts.unshift(attempt);
      data.auditEntries.unshift(
        makeAudit(
          mandate.id,
          "attempt_blocked",
          `Payment blocked before dispatch: ${policyResult.reason}.`,
          attempt.id,
        ),
      );
      data.domainEvents.unshift(
        makeDomainEvent({
          entityType: "payment_attempt",
          entityId: attempt.id,
          eventType: "policy_denied",
          correlationId: input.correlationId,
          metadata: {
            reason: policyResult.reason,
            mandateId: mandate.id,
          },
        }),
      );
      return attempt;
    }

    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "policy_approved",
        "Policy approved the attempt.",
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "policy_approved",
        correlationId: input.correlationId,
        metadata: {
          mandateId: mandate.id,
        },
      }),
    );

    ensureAttemptTransition(attempt.status, "reserved");
    attempt.status = "reserved";
    attempt.financialOutcome = "reserved";
    attempt.receiptEvidence = mandate.requiresReceiptCapability
      ? "required_pending"
      : "not_required";
    attempt.updatedAt = nowIso();
    mandate.reservedCents += input.amountCents;
    mandate.status = "issued_reserved";
    mandate.updatedAt = nowIso();
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "attempt_reserved",
        "Spend reserved for approved attempt.",
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "attempt_reserved",
        correlationId: input.correlationId,
        metadata: {
          amountCents: attempt.amountCents,
        },
      }),
    );

    ensureAttemptTransition(attempt.status, "dispatching");
    attempt.status = "dispatching";
    attempt.financialOutcome = "dispatching";
    attempt.updatedAt = nowIso();
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "attempt_dispatched",
        "Attempt dispatched to vendor adapter.",
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "attempt_dispatched",
        correlationId: input.correlationId,
        metadata: {
          vendorId: attempt.vendorId,
        },
      }),
    );

    const result = await dispatchAttempt({
      vendor,
      amountCents: input.amountCents,
      paymentIdentifier: attempt.paymentIdentifier,
      mandateId: mandate.id,
    });
    ensureAttemptTransition(attempt.status, result.status);
    attempt.status = result.status;
    attempt.financialOutcome = result.status;
    attempt.chargeReference = result.chargeReference;
    attempt.receiptEvidence = result.receiptEvidence;
    attempt.updatedAt = nowIso();

    if (result.status === "executed_charge_succeeded") {
      mandate.reservedCents -= input.amountCents;
      mandate.consumedCents += input.amountCents;
    } else if (result.status === "executed_charge_failed") {
      mandate.reservedCents -= input.amountCents;
    }

    if (result.status === "execution_unknown") {
      data.auditEntries.unshift(
        makeAudit(
          mandate.id,
          "attempt_reconciliation_started",
          "Attempt entered execution_unknown and is awaiting correlation.",
          attempt.id,
        ),
      );
      data.domainEvents.unshift(
        makeDomainEvent({
          entityType: "payment_attempt",
          entityId: attempt.id,
          eventType: "attempt_reconciliation_started",
          correlationId: input.correlationId,
          metadata: {
            paymentIdentifier: attempt.paymentIdentifier,
          },
        }),
      );
    } else {
      mandate.status = "issued_active";
    }

    mandate.updatedAt = nowIso();
    data.attempts.unshift(attempt);
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "receipt_updated",
        `Receipt evidence state: ${attempt.receiptEvidence}.`,
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "receipt_updated",
        correlationId: input.correlationId,
        metadata: {
          receiptEvidence: attempt.receiptEvidence,
        },
      }),
    );
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "financial_outcome",
        `Financial outcome: ${result.status}.`,
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "financial_outcome",
        correlationId: input.correlationId,
        metadata: {
          financialOutcome: result.status,
        },
      }),
    );
    if (result.status !== "execution_unknown") {
      data.auditEntries.unshift(
        makeAudit(
          mandate.id,
          "attempt_reconciled",
          `Attempt resolved with financial outcome ${result.status}.`,
          attempt.id,
        ),
      );
      data.domainEvents.unshift(
        makeDomainEvent({
          entityType: "payment_attempt",
          entityId: attempt.id,
          eventType: "attempt_reconciled",
          correlationId: input.correlationId,
          metadata: {
            financialOutcome: result.status,
          },
        }),
      );
    }
    return attempt;
  });
}

export async function reconcileAttempt(input: {
  mandateId: string;
  attemptId: string;
  correlationId?: string | null;
}) {
  return withStoreLock(async (data) => {
    const mandate = data.mandates.find((entry) => entry.id === input.mandateId);
    const attempt = data.attempts.find((entry) => entry.id === input.attemptId);

    if (!mandate || !attempt) {
      throw new Error("Attempt not found.");
    }

    if (attempt.mandateId !== mandate.id) {
      throw new Error("Attempt does not belong to the selected mandate.");
    }

    if (attempt.status !== "execution_unknown") {
      throw new Error("Only execution_unknown attempts can be reconciled.");
    }

    const vendor = vendorRegistry.find(
      (entry) => entry.id === attempt.vendorId,
    );
    if (!vendor) {
      throw new Error("Vendor not found for reconciliation.");
    }

    const correlated = await correlateAttemptStatus({
      vendor,
      paymentIdentifier: attempt.paymentIdentifier,
      chargeReference: attempt.chargeReference,
    });

    ensureAttemptTransition(attempt.status, correlated.status);
    attempt.status = correlated.status;
    attempt.financialOutcome = correlated.status;
    attempt.receiptEvidence = correlated.receiptEvidence;
    attempt.chargeReference =
      correlated.chargeReference ?? attempt.chargeReference;
    attempt.updatedAt = nowIso();

    if (correlated.status === "executed_charge_succeeded") {
      mandate.consumedCents += attempt.amountCents;
    }

    mandate.reservedCents -= attempt.amountCents;
    mandate.status = "issued_active";
    mandate.updatedAt = nowIso();

    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "receipt_updated",
        `Receipt evidence reconciled to ${correlated.receiptEvidence}.`,
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "receipt_updated",
        correlationId: input.correlationId,
        metadata: {
          receiptEvidence: correlated.receiptEvidence,
        },
      }),
    );
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "financial_outcome",
        `Financial outcome reconciled to ${correlated.status}.`,
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "financial_outcome",
        correlationId: input.correlationId,
        metadata: {
          financialOutcome: correlated.status,
        },
      }),
    );
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "attempt_reconciled",
        "Unknown attempt reconciled.",
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "attempt_reconciled",
        correlationId: input.correlationId,
        metadata: {
          financialOutcome: correlated.status,
        },
      }),
    );

    return attempt;
  });
}
