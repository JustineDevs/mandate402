import {
  ConflictError,
  InvalidStateError,
  NotFoundError,
} from "@/lib/domain/errors";
import { ensureAttemptTransition } from "@/lib/domain/state-machines";
import type {
  AuditEntry,
  DomainEvent,
  PaymentAttempt,
  ReceiptEvidenceStatus,
  StoreData,
  WorkerTask,
} from "@/lib/domain/types";
import { nowIso } from "@/lib/infrastructure/clock";
import { createId } from "@/lib/infrastructure/id";
import { withStoreLock } from "@/lib/infrastructure/store";
import {
  correlateAttemptStatus,
  dispatchAttempt,
} from "@/lib/modules/payments";
import { vendorRegistry } from "@/lib/vendor-registry";

const WORKER_LEASE_MS = 30_000;
const RECONCILIATION_RETRY_DELAY_MS = 30_000;
const MAX_RECONCILIATION_ATTEMPTS = 3;

export type WorkerProcessSummary = {
  processed: number;
  completed: number;
  unresolved: number;
  failed: number;
  requeued: number;
};

type DispatchResult =
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

function enqueueWorkerTask(
  data: StoreData,
  input: {
    kind: WorkerTask["kind"];
    mandateId: string;
    attemptId: string;
    operatorId?: string | null;
    correlationId?: string | null;
    availableAt?: string;
  },
) {
  const now = nowIso();
  const existing = data.workerTasks.find(
    (task) =>
      task.kind === input.kind &&
      task.attemptId === input.attemptId &&
      (task.status === "queued" || task.status === "leased"),
  );
  if (existing) {
    return existing;
  }

  const task: WorkerTask = {
    id: createId("task"),
    kind: input.kind,
    attemptId: input.attemptId,
    mandateId: input.mandateId,
    operatorId: input.operatorId ?? null,
    correlationId: input.correlationId ?? null,
    leaseOwner: null,
    leaseExpiresAt: null,
    availableAt: input.availableAt ?? now,
    status: "queued",
    attemptCount: 0,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null,
  };
  data.workerTasks.unshift(task);
  data.domainEvents.unshift(
    makeDomainEvent({
      entityType: "worker_task",
      entityId: task.id,
      eventType: "worker_task_enqueued",
      metadata: {
        kind: task.kind,
        attemptId: task.attemptId,
        operatorId: task.operatorId,
      },
    }),
  );
  return task;
}

async function leaseNextWorkerTask(
  kind: WorkerTask["kind"],
  workerName: string,
) {
  return withStoreLock(async (data) => {
    const now = nowIso();
    const task = data.workerTasks
      .filter((entry) => entry.kind === kind)
      .filter(
        (entry) =>
          (entry.status === "queued" ||
            (entry.status === "leased" &&
              entry.leaseExpiresAt !== null &&
              Date.parse(entry.leaseExpiresAt) <= Date.now())) &&
          Date.parse(entry.availableAt) <= Date.now(),
      )
      .sort(
        (left, right) =>
          Date.parse(left.createdAt) - Date.parse(right.createdAt),
      )[0];

    if (!task) {
      return null;
    }

    task.status = "leased";
    task.leaseOwner = workerName;
    task.leaseExpiresAt = new Date(Date.now() + WORKER_LEASE_MS).toISOString();
    task.updatedAt = now;
    task.startedAt ??= now;
    task.attemptCount += 1;

    const attempt = data.attempts.find((entry) => entry.id === task.attemptId);
    if (!attempt) {
      throw new InvalidStateError(
        `Worker task ${task.id} references missing attempt ${task.attemptId}.`,
        "worker_task_missing_attempt",
      );
    }

    return {
      taskId: task.id,
      kind: task.kind,
      attemptId: task.attemptId,
      mandateId: task.mandateId,
      attemptCount: task.attemptCount,
      vendorId: attempt.vendorId,
      operatorId: task.operatorId ?? attempt.operatorId,
      correlationId: task.correlationId,
      amountCents: attempt.amountCents,
      paymentIdentifier: attempt.paymentIdentifier,
    };
  });
}

async function completeWorkerTask(
  taskId: string,
  metadata?: Record<string, string | number | boolean | null>,
) {
  return withStoreLock(async (data) => {
    const task = data.workerTasks.find((entry) => entry.id === taskId);
    if (!task) {
      throw new NotFoundError(`Worker task ${taskId} not found.`);
    }

    task.status = "completed";
    task.leaseOwner = null;
    task.leaseExpiresAt = null;
    task.lastError = null;
    task.updatedAt = nowIso();
    task.completedAt = nowIso();

    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "worker_task",
        entityId: task.id,
        eventType: "worker_task_completed",
        metadata,
      }),
    );

    return task;
  });
}

async function failWorkerTask(taskId: string, error: Error) {
  return withStoreLock(async (data) => {
    const task = data.workerTasks.find((entry) => entry.id === taskId);
    if (!task) {
      throw new NotFoundError(`Worker task ${taskId} not found.`);
    }

    task.status = "failed";
    task.leaseOwner = null;
    task.leaseExpiresAt = null;
    task.lastError = error.message;
    task.updatedAt = nowIso();
    task.completedAt = nowIso();

    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "worker_task",
        entityId: task.id,
        eventType: "worker_task_failed",
        metadata: {
          error: error.message,
          kind: task.kind,
        },
      }),
    );

    return task;
  });
}

async function requeueWorkerTask(
  taskId: string,
  error: Error,
  delayMs: number,
) {
  return withStoreLock(async (data) => {
    const task = data.workerTasks.find((entry) => entry.id === taskId);
    if (!task) {
      throw new NotFoundError(`Worker task ${taskId} not found.`);
    }

    task.status = "queued";
    task.leaseOwner = null;
    task.leaseExpiresAt = null;
    task.lastError = error.message;
    task.availableAt = new Date(Date.now() + delayMs).toISOString();
    task.updatedAt = nowIso();

    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "worker_task",
        entityId: task.id,
        eventType: "worker_task_requeued",
        metadata: {
          error: error.message,
          delayMs,
          kind: task.kind,
        },
      }),
    );

    return task;
  });
}

async function applyDispatchResult(
  taskId: string,
  claimed: {
    attemptId: string;
    mandateId: string;
    amountCents: number;
    paymentIdentifier: string;
    correlationId: string | null;
  },
  result: DispatchResult,
): Promise<PaymentAttempt> {
  const attempt = await withStoreLock(async (data) => {
    const mandate = data.mandates.find(
      (entry) => entry.id === claimed.mandateId,
    );
    const attempt = data.attempts.find(
      (entry) => entry.id === claimed.attemptId,
    );

    if (!mandate || !attempt) {
      throw new InvalidStateError(
        "Claimed execution attempt no longer exists.",
        "claimed_attempt_missing",
      );
    }

    ensureAttemptTransition(attempt.status, result.status);
    attempt.status = result.status;
    attempt.financialOutcome = result.status;
    attempt.chargeReference = result.chargeReference;
    attempt.receiptEvidence = result.receiptEvidence;
    attempt.updatedAt = nowIso();

    if (result.status === "executed_charge_succeeded") {
      mandate.reservedCents -= claimed.amountCents;
      mandate.consumedCents += claimed.amountCents;
      mandate.status = "issued_active";
    } else if (result.status === "executed_charge_failed") {
      mandate.reservedCents -= claimed.amountCents;
      mandate.status = "issued_active";
    }

    if (result.status === "execution_unknown") {
      data.auditEntries.unshift(
        makeAudit(
          mandate.id,
          "attempt_reconciliation_started",
          "Attempt entered execution_unknown and is awaiting worker correlation.",
          attempt.id,
        ),
      );
      const reconcileTask = enqueueWorkerTask(data, {
        kind: "reconcile_attempt",
        mandateId: mandate.id,
        attemptId: attempt.id,
        operatorId: attempt.operatorId,
        correlationId: claimed.correlationId,
        availableAt: nowIso(),
      });
      data.domainEvents.unshift(
        makeDomainEvent({
          entityType: "payment_attempt",
          entityId: attempt.id,
          eventType: "attempt_reconciliation_started",
          metadata: {
            paymentIdentifier: attempt.paymentIdentifier,
            workerTaskId: reconcileTask.id,
          },
        }),
      );
    }

    mandate.updatedAt = nowIso();
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
          metadata: {
            financialOutcome: result.status,
          },
        }),
      );
    }

    return structuredClone(attempt);
  });

  await completeWorkerTask(taskId, {
    resultStatus: result.status,
    attemptId: attempt.id,
  });
  return attempt;
}

async function releaseDispatchTask(
  taskId: string,
  claimed: { attemptId: string; mandateId: string; amountCents: number },
  error: Error,
): Promise<PaymentAttempt> {
  const attempt = await withStoreLock(async (data) => {
    const mandate = data.mandates.find(
      (entry) => entry.id === claimed.mandateId,
    );
    const attempt = data.attempts.find(
      (entry) => entry.id === claimed.attemptId,
    );

    if (!mandate || !attempt) {
      throw new InvalidStateError(
        "Claimed execution attempt no longer exists.",
        "claimed_attempt_missing",
      );
    }

    ensureAttemptTransition(attempt.status, "cancelled_released");
    attempt.status = "cancelled_released";
    attempt.financialOutcome = "cancelled_released";
    attempt.receiptEvidence = "not_required";
    attempt.blockedReason = "execution_worker_failed";
    attempt.updatedAt = nowIso();
    mandate.reservedCents = Math.max(
      0,
      mandate.reservedCents - claimed.amountCents,
    );
    mandate.status = "issued_active";
    mandate.updatedAt = nowIso();

    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "attempt_blocked",
        `Execution worker released the queued attempt: ${error.message}`,
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "attempt_worker_failed",
        metadata: {
          reason: error.message,
        },
      }),
    );

    return structuredClone(attempt);
  });

  await failWorkerTask(taskId, error);
  return attempt;
}

async function applyReconciliationResult(
  taskId: string,
  claimed: { attemptId: string; mandateId: string; amountCents: number },
  result: {
    status: "executed_charge_succeeded" | "executed_charge_failed";
    chargeReference: string | null;
    receiptEvidence: Exclude<
      ReceiptEvidenceStatus,
      "not_required" | "required_pending"
    >;
  },
): Promise<PaymentAttempt> {
  const attempt = await withStoreLock(async (data) => {
    const mandate = data.mandates.find(
      (entry) => entry.id === claimed.mandateId,
    );
    const attempt = data.attempts.find(
      (entry) => entry.id === claimed.attemptId,
    );

    if (!mandate || !attempt) {
      throw new InvalidStateError(
        "Claimed reconciliation attempt no longer exists.",
        "claimed_reconciliation_attempt_missing",
      );
    }

    if (attempt.status !== "execution_unknown") {
      throw new ConflictError(
        "Only execution_unknown attempts can be reconciled by the worker.",
        "attempt_not_reconcilable",
      );
    }

    ensureAttemptTransition(attempt.status, result.status);
    attempt.status = result.status;
    attempt.financialOutcome = result.status;
    attempt.receiptEvidence = result.receiptEvidence;
    attempt.chargeReference = result.chargeReference ?? attempt.chargeReference;
    attempt.updatedAt = nowIso();

    if (result.status === "executed_charge_succeeded") {
      mandate.consumedCents += claimed.amountCents;
    }

    mandate.reservedCents = Math.max(
      0,
      mandate.reservedCents - claimed.amountCents,
    );
    mandate.status = "issued_active";
    mandate.updatedAt = nowIso();

    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "receipt_updated",
        `Receipt evidence reconciled to ${result.receiptEvidence}.`,
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "receipt_updated",
        metadata: {
          receiptEvidence: result.receiptEvidence,
        },
      }),
    );
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "financial_outcome",
        `Financial outcome reconciled to ${result.status}.`,
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "financial_outcome",
        metadata: {
          financialOutcome: result.status,
        },
      }),
    );
    data.auditEntries.unshift(
      makeAudit(
        mandate.id,
        "attempt_reconciled",
        "Unknown attempt reconciled by worker.",
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "attempt_reconciled",
        metadata: {
          financialOutcome: result.status,
        },
      }),
    );

    return structuredClone(attempt);
  });

  await completeWorkerTask(taskId, {
    resultStatus: result.status,
    attemptId: attempt.id,
  });
  return attempt;
}

export async function processNextQueuedAttempt(
  workerName = "execution-worker",
) {
  const claimed = await leaseNextWorkerTask("dispatch_attempt", workerName);
  if (!claimed) {
    return null;
  }

  await withStoreLock(async (data) => {
    const attempt = data.attempts.find(
      (entry) => entry.id === claimed.attemptId,
    );
    if (!attempt) {
      throw new InvalidStateError(
        "Claimed execution attempt no longer exists.",
        "claimed_attempt_missing",
      );
    }

    ensureAttemptTransition(attempt.status, "dispatching");
    attempt.status = "dispatching";
    attempt.financialOutcome = "dispatching";
    attempt.updatedAt = nowIso();

    data.auditEntries.unshift(
      makeAudit(
        claimed.mandateId,
        "attempt_dispatched",
        "Execution worker claimed the queued attempt for vendor dispatch.",
        attempt.id,
      ),
    );
    data.domainEvents.unshift(
      makeDomainEvent({
        entityType: "payment_attempt",
        entityId: attempt.id,
        eventType: "attempt_dispatched",
        metadata: {
          vendorId: attempt.vendorId,
          workerTaskId: claimed.taskId,
        },
      }),
    );

    return structuredClone(attempt);
  });

  const vendor = vendorRegistry.find((entry) => entry.id === claimed.vendorId);
  if (!vendor) {
    return releaseDispatchTask(
      claimed.taskId,
      claimed,
      new Error(`Vendor ${claimed.vendorId} is not registered.`),
    );
  }

  try {
    const result = await dispatchAttempt({
      vendor,
      amountCents: claimed.amountCents,
      paymentIdentifier: claimed.paymentIdentifier,
      mandateId: claimed.mandateId,
    });

    return applyDispatchResult(claimed.taskId, claimed, result);
  } catch (error) {
    return releaseDispatchTask(
      claimed.taskId,
      claimed,
      error instanceof Error
        ? error
        : new Error("Unknown execution worker failure."),
    );
  }
}

export async function ensureReconciliationQueued(input: {
  mandateId: string;
  attemptId: string;
  correlationId?: string | null;
}) {
  return withStoreLock(async (data) => {
    const attempt = data.attempts.find((entry) => entry.id === input.attemptId);
    const mandate = data.mandates.find((entry) => entry.id === input.mandateId);
    if (!attempt || !mandate) {
      throw new NotFoundError("Attempt not found.");
    }
    if (attempt.mandateId !== mandate.id) {
      throw new NotFoundError("Attempt not found.");
    }
    if (attempt.status !== "execution_unknown") {
      throw new ConflictError(
        "Only execution_unknown attempts can be queued for reconciliation.",
        "attempt_not_reconcilable",
      );
    }
    const task = enqueueWorkerTask(data, {
      kind: "reconcile_attempt",
      mandateId: mandate.id,
      attemptId: attempt.id,
      operatorId: attempt.operatorId,
      correlationId: input.correlationId,
    });
    return {
      attempt: structuredClone(attempt),
      task: structuredClone(task),
    };
  });
}

export async function processExecutionQueue(
  limit = 10,
  workerName = "execution-worker",
) {
  let processed = 0;
  let completed = 0;
  let unresolved = 0;
  let failed = 0;
  const requeued = 0;

  while (processed < limit) {
    const attempt = await processNextQueuedAttempt(workerName);
    if (!attempt) {
      break;
    }

    processed += 1;
    if (attempt.status === "execution_unknown") {
      unresolved += 1;
    } else if (attempt.status === "cancelled_released") {
      failed += 1;
    } else {
      completed += 1;
    }
  }

  return {
    processed,
    completed,
    unresolved,
    failed,
    requeued,
  } satisfies WorkerProcessSummary;
}

export async function processNextReconciliation(
  workerName = "reconciliation-worker",
) {
  const claimed = await leaseNextWorkerTask("reconcile_attempt", workerName);
  if (!claimed) {
    return null;
  }

  const attempt = await withStoreLock(async (data) => {
    const attempt = data.attempts.find(
      (entry) => entry.id === claimed.attemptId,
    );
    if (!attempt) {
      throw new InvalidStateError(
        "Claimed reconciliation attempt no longer exists.",
        "claimed_reconciliation_attempt_missing",
      );
    }
    return structuredClone(attempt);
  });

  const vendor = vendorRegistry.find((entry) => entry.id === claimed.vendorId);
  if (!vendor) {
    await failWorkerTask(
      claimed.taskId,
      new Error(`Vendor ${claimed.vendorId} is not registered.`),
    );
    return null;
  }

  try {
    const result = await correlateAttemptStatus({
      vendor,
      paymentIdentifier: claimed.paymentIdentifier,
      chargeReference: attempt.chargeReference,
    });
    return applyReconciliationResult(claimed.taskId, claimed, result);
  } catch (error) {
    const workerError =
      error instanceof Error
        ? error
        : new Error("Unknown reconciliation worker failure.");
    if (claimed.attemptCount < MAX_RECONCILIATION_ATTEMPTS) {
      await requeueWorkerTask(
        claimed.taskId,
        workerError,
        RECONCILIATION_RETRY_DELAY_MS,
      );
      return null;
    }
    await failWorkerTask(claimed.taskId, workerError);
    return null;
  }
}

export async function processReconciliationQueue(
  limit = 10,
  workerName = "reconciliation-worker",
) {
  let processed = 0;
  let completed = 0;
  let unresolved = 0;
  let failed = 0;
  let requeued = 0;

  while (processed < limit) {
    const before = await withStoreLock(async (data) => {
      return data.workerTasks.filter(
        (task) => task.kind === "reconcile_attempt" && task.status === "queued",
      ).length;
    });
    const attempt = await processNextReconciliation(workerName);
    const after = await withStoreLock(async (data) => {
      return data.workerTasks.filter(
        (task) => task.kind === "reconcile_attempt" && task.status === "queued",
      ).length;
    });
    if (!attempt && before === 0) {
      break;
    }
    if (!attempt && before > after) {
      requeued += 1;
      processed += 1;
      continue;
    }
    if (!attempt && before === after) {
      failed += 1;
      processed += 1;
      continue;
    }
    processed += 1;
    if (!attempt) {
      failed += 1;
      continue;
    }
    if (attempt.status === "execution_unknown") {
      unresolved += 1;
    } else {
      completed += 1;
    }
  }

  return {
    processed,
    completed,
    unresolved,
    failed,
    requeued,
  } satisfies WorkerProcessSummary;
}
