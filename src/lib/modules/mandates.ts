import {
  TreasuryEnforcementError,
  enforceTreasuryExecution,
} from "@/lib/blockchain/treasury";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/domain/errors";
import {
  ensureAttemptTransition,
  ensureMandateTransition,
} from "@/lib/domain/state-machines";
import { isFutureIsoTimestamp } from "@/lib/domain/time";
import type {
  AuditEntry,
  DomainEvent,
  Mandate,
  WorkerTask,
} from "@/lib/domain/types";
import { nowIso } from "@/lib/infrastructure/clock";
import { createId } from "@/lib/infrastructure/id";
import { readStore, withStoreLock } from "@/lib/infrastructure/store";
import {
  issueMandateAnchor,
  revokeMandateAnchor,
} from "@/lib/modules/morph-anchor";
import {
  correlateAttemptStatus,
  materializeAttempt,
} from "@/lib/modules/payments";
import { evaluatePolicy } from "@/lib/modules/policy";
import { vendorRegistry } from "@/lib/vendor-registry";

export type CreateMandateInput = {
  name: string;
  agentId: string;
  agentName?: string;
  budgetCapCents: number;
  expiresAt: string;
  approvedVendorIds: string[];
  requiresReceiptCapability: boolean;
  correlationId?: string | null;
};

function requireNonBlank(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) {
    throw new ValidationError(`${label} must not be blank.`);
  }

  return normalized;
}

function requirePositiveCents(value: number, label: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(
      `${label} must be a positive integer amount in cents.`,
    );
  }
}

function normalizeApprovedVendorIds(vendorIds: string[]) {
  const normalizedVendorIds = vendorIds.map((vendorId) =>
    requireNonBlank(vendorId, "Approved vendor id"),
  );
  const uniqueVendorIds = [...new Set(normalizedVendorIds)];

  if (uniqueVendorIds.length === 0) {
    throw new ValidationError("At least one approved vendor is required.");
  }

  for (const vendorId of uniqueVendorIds) {
    if (!vendorRegistry.some((vendor) => vendor.id === vendorId)) {
      throw new ValidationError(
        `Approved vendor ${vendorId} is not registered.`,
      );
    }
  }

  return uniqueVendorIds;
}

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

function makeWorkerTask(input: {
  kind: WorkerTask["kind"];
  mandateId: string;
  attemptId: string;
  operatorId: string;
  correlationId?: string | null;
}): WorkerTask {
  const now = nowIso();
  return {
    id: createId("task"),
    kind: input.kind,
    attemptId: input.attemptId,
    mandateId: input.mandateId,
    operatorId: input.operatorId,
    correlationId: input.correlationId ?? null,
    leaseOwner: null,
    leaseExpiresAt: null,
    availableAt: now,
    status: "queued",
    attemptCount: 0,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null,
  };
}

export async function listMandates() {
  const data = await readStore();
  return data.mandates;
}

export async function listAgents() {
  const data = await readStore();
  return data.agents;
}

export async function listAttempts() {
  const data = await readStore();
  return data.attempts;
}

export async function listAuditEntries() {
  const data = await readStore();
  return data.auditEntries;
}

export async function listDomainEvents() {
  const data = await readStore();
  return data.domainEvents;
}

export async function createMandate(input: CreateMandateInput) {
  return withStoreLock(async (data) => {
    const name = requireNonBlank(input.name, "Mandate name");
    requirePositiveCents(input.budgetCapCents, "Mandate budget");

    if (!isFutureIsoTimestamp(input.expiresAt)) {
      throw new ValidationError(
        "Mandate expiry must be a future ISO timestamp.",
      );
    }

    const agent = data.agents.find((entry) => entry.id === input.agentId);
    if (!agent || agent.status !== "active") {
      throw new ValidationError("Agent must exist and be active.");
    }

    const now = nowIso();
    const mandateId = createId("mdt");
    const morphIssueTxId = await issueMandateAnchor(mandateId);
    const mandate: Mandate = {
      id: mandateId,
      name,
      agentId: input.agentId,
      agentName: agent.name,
      status: "draft",
      budgetCapCents: input.budgetCapCents,
      reservedCents: 0,
      consumedCents: 0,
      requiresReceiptCapability: input.requiresReceiptCapability,
      approvedVendorIds: normalizeApprovedVendorIds(input.approvedVendorIds),
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
      throw new NotFoundError("Mandate not found.");
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
    requirePositiveCents(input.amountCents, "Attempt amount");
    const vendorId = requireNonBlank(input.vendorId, "Vendor id");
    const operatorId = requireNonBlank(input.operatorId, "Operator id");

    if (input.paymentIdentifier) {
      requireNonBlank(input.paymentIdentifier, "Payment identifier");
    }

    const mandate = data.mandates.find((entry) => entry.id === input.mandateId);
    if (!mandate) {
      throw new NotFoundError("Mandate not found.");
    }

    if (input.paymentIdentifier) {
      const existingAttempt = data.attempts.find(
        (entry) => entry.paymentIdentifier === input.paymentIdentifier,
      );
      if (existingAttempt) {
        if (
          existingAttempt.mandateId !== input.mandateId ||
          existingAttempt.vendorId !== vendorId ||
          existingAttempt.amountCents !== input.amountCents ||
          existingAttempt.operatorId !== operatorId
        ) {
          throw new ConflictError(
            "Payment identifier conflict: identifier already used for a different attempt.",
            "payment_identifier_conflict",
          );
        }
        return existingAttempt;
      }
    }

    const vendor = vendorRegistry.find((entry) => entry.id === vendorId);
    if (!vendor) {
      throw new NotFoundError("Vendor not found.");
    }
    const attempt = materializeAttempt(
      mandate.id,
      vendorId,
      operatorId,
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

    try {
      const treasury = await enforceTreasuryExecution({
        agentId: mandate.agentId,
        amountCents: input.amountCents,
      });

      if (treasury.enforced) {
        data.auditEntries.unshift(
          makeAudit(
            mandate.id,
            "policy_approved",
            `Treasury enforcement approved the attempt (${treasury.txHash}).`,
            attempt.id,
          ),
        );
        data.domainEvents.unshift(
          makeDomainEvent({
            entityType: "payment_attempt",
            entityId: attempt.id,
            eventType: "treasury_enforced",
            correlationId: input.correlationId,
            metadata: {
              txHash: treasury.txHash ?? null,
              mandateId: mandate.id,
            },
          }),
        );
      }
    } catch (error) {
      if (error instanceof TreasuryEnforcementError) {
        ensureAttemptTransition(attempt.status, "policy_denied");
        attempt.status = "policy_denied";
        attempt.financialOutcome = "policy_denied";
        attempt.blockedReason = error.code;
        attempt.updatedAt = nowIso();
        data.attempts.unshift(attempt);
        data.auditEntries.unshift(
          makeAudit(
            mandate.id,
            "attempt_blocked",
            `Payment blocked before dispatch: ${error.code}.`,
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
              reason: error.code,
              mandateId: mandate.id,
            },
          }),
        );
        return attempt;
      }

      throw error;
    }

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

    ensureAttemptTransition(attempt.status, "dispatch_queued");
    attempt.status = "dispatch_queued";
    attempt.financialOutcome = "dispatch_queued";
    attempt.updatedAt = nowIso();
    mandate.updatedAt = nowIso();
    data.attempts.unshift(attempt);
    const executionTask = makeWorkerTask({
      kind: "dispatch_attempt",
      mandateId: mandate.id,
      attemptId: attempt.id,
      operatorId: attempt.operatorId,
      correlationId: input.correlationId,
    });
    data.workerTasks.unshift(executionTask);
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "attempt_queued",
        "Attempt queued for execution worker dispatch.",
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "attempt_queued",
        correlationId: input.correlationId,
        metadata: {
          vendorId: attempt.vendorId,
          paymentIdentifier: attempt.paymentIdentifier,
          workerTaskId: executionTask.id,
        },
      }),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "worker_task",
        entityId: executionTask.id,
        eventType: "worker_task_enqueued",
        correlationId: input.correlationId,
        metadata: {
          kind: executionTask.kind,
          attemptId: attempt.id,
        },
      }),
    );
    return attempt;
  });
}
