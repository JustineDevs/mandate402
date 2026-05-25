import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTestStoreData,
  readStore,
  resetStoreForTests,
} from "@/lib/infrastructure/store";
import {
  processExecutionQueue,
  processReconciliationQueue,
} from "@/lib/modules/execution-worker";
import { listAttempts, listMandates, runAttempt } from "@/lib/modules/mandates";

vi.mock("@/lib/modules/morph-anchor", () => ({
  issueMandateAnchor: vi.fn().mockResolvedValue("0xtest_issue_anchor"),
  revokeMandateAnchor: vi.fn().mockResolvedValue("0xtest_revoke_anchor"),
}));

describe("execution worker", () => {
  beforeEach(async () => {
    await resetStoreForTests(createTestStoreData());
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("releases a queued attempt when dispatch cannot start", async () => {
    const [mandate] = await listMandates();

    const queuedAttempt = await runAttempt({
      mandateId: mandate.id,
      vendorId: "morph-market-data",
      amountCents: 1300,
      operatorId: "operator_fixture",
      paymentIdentifier: "pid_worker_missing_endpoint",
    });

    expect(queuedAttempt.status).toBe("dispatch_queued");

    const workerResult = await processExecutionQueue();
    expect(workerResult).toEqual({
      processed: 1,
      completed: 0,
      unresolved: 0,
      failed: 1,
      requeued: 0,
    });

    const attempts = await listAttempts();
    const processedAttempt = attempts.find(
      (attempt) => attempt.id === queuedAttempt.id,
    );
    const refreshedMandates = await listMandates();

    expect(processedAttempt?.status).toBe("cancelled_released");
    expect(processedAttempt?.blockedReason).toBe("execution_worker_failed");
    expect(refreshedMandates[0].reservedCents).toBe(0);
    expect(refreshedMandates[0].status).toBe("issued_active");
  });

  it("requeues reconciliation when status correlation fails before retry exhaustion", async () => {
    const data = createTestStoreData();
    const now = new Date().toISOString();

    data.attempts.unshift({
      id: "att_reconcile_retry",
      mandateId: "mdt_fixture_001",
      vendorId: "morph-market-data",
      amountCents: 1200,
      operatorId: "operator_fixture",
      status: "execution_unknown",
      financialOutcome: "execution_unknown",
      receiptEvidence: "required_pending",
      blockedReason: null,
      chargeReference: "charge_retry_1",
      paymentIdentifier: "pid_reconcile_retry",
      createdAt: now,
      updatedAt: now,
    });
    data.workerTasks.unshift({
      id: "task_reconcile_retry",
      kind: "reconcile_attempt",
      attemptId: "att_reconcile_retry",
      mandateId: "mdt_fixture_001",
      operatorId: "operator_fixture",
      correlationId: "corr_retry",
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
    });

    await resetStoreForTests(data);
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("status endpoint unavailable"),
    );

    const result = await processReconciliationQueue(1);
    expect(result).toEqual({
      processed: 1,
      completed: 0,
      unresolved: 0,
      failed: 0,
      requeued: 1,
    });

    const refreshed = await readStore();
    const task = refreshed.workerTasks.find(
      (entry) => entry.id === "task_reconcile_retry",
    );
    expect(task).toMatchObject({
      status: "queued",
      attemptCount: 1,
      lastError: "status endpoint unavailable",
    });
  });

  it("fails reconciliation after the 15-minute escalation window", async () => {
    const data = createTestStoreData();
    const staleTime = "2000-01-01T00:00:00.000Z";

    data.attempts.unshift({
      id: "att_reconcile_fail",
      mandateId: "mdt_fixture_001",
      vendorId: "morph-market-data",
      amountCents: 1200,
      operatorId: "operator_fixture",
      status: "execution_unknown",
      financialOutcome: "execution_unknown",
      receiptEvidence: "required_pending",
      blockedReason: null,
      chargeReference: "charge_fail_1",
      paymentIdentifier: "pid_reconcile_fail",
      createdAt: staleTime,
      updatedAt: staleTime,
    });
    data.workerTasks.unshift({
      id: "task_reconcile_fail",
      kind: "reconcile_attempt",
      attemptId: "att_reconcile_fail",
      mandateId: "mdt_fixture_001",
      operatorId: "operator_fixture",
      correlationId: "corr_fail",
      leaseOwner: null,
      leaseExpiresAt: null,
      availableAt: staleTime,
      status: "queued",
      attemptCount: 9,
      lastError: null,
      createdAt: staleTime,
      updatedAt: staleTime,
      startedAt: null,
      completedAt: null,
    });

    await resetStoreForTests(data);
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("status endpoint unavailable"),
    );

    const result = await processReconciliationQueue(1);
    expect(result).toEqual({
      processed: 1,
      completed: 0,
      unresolved: 0,
      failed: 1,
      requeued: 0,
    });

    const refreshed = await readStore();
    const task = refreshed.workerTasks.find(
      (entry) => entry.id === "task_reconcile_fail",
    );
    expect(task).toMatchObject({
      status: "failed",
      attemptCount: 10,
      lastError:
        "Reconciliation exceeded the 15-minute escalation window: status endpoint unavailable",
    });
  });

  it("uses the final reconciled amount when vendor status provides it", async () => {
    const data = createTestStoreData();
    const now = new Date().toISOString();
    const mandate = data.mandates.find(
      (entry) => entry.id === "mdt_fixture_001",
    );
    if (!mandate) {
      throw new Error("Expected seeded mandate.");
    }

    mandate.status = "issued_reserved";
    mandate.reservedCents = 1200;

    data.attempts.unshift({
      id: "att_reconcile_amount",
      mandateId: "mdt_fixture_001",
      vendorId: "morph-market-data",
      amountCents: 1200,
      operatorId: "operator_fixture",
      status: "execution_unknown",
      financialOutcome: "execution_unknown",
      receiptEvidence: "required_pending",
      blockedReason: null,
      chargeReference: "charge_amount_1",
      paymentIdentifier: "pid_reconcile_amount",
      createdAt: now,
      updatedAt: now,
    });
    data.workerTasks.unshift({
      id: "task_reconcile_amount",
      kind: "reconcile_attempt",
      attemptId: "att_reconcile_amount",
      mandateId: "mdt_fixture_001",
      operatorId: "operator_fixture",
      correlationId: "corr_amount",
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
    });

    await resetStoreForTests(data);
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: "executed_charge_succeeded",
          chargeReference: "charge_amount_1",
          receiptEvidence: "received_valid",
          finalAmountCents: 700,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await processReconciliationQueue(1);
    expect(result).toEqual({
      processed: 1,
      completed: 1,
      unresolved: 0,
      failed: 0,
      requeued: 0,
    });

    const refreshedMandates = await listMandates();
    expect(refreshedMandates[0].reservedCents).toBe(0);
    expect(refreshedMandates[0].consumedCents).toBe(1900);
    expect(refreshedMandates[0].status).toBe("issued_active");
  });

  it("uses facilitator verification before vendor status when artifacts are present", async () => {
    const data = createTestStoreData();
    const now = new Date().toISOString();
    const mandate = data.mandates.find(
      (entry) => entry.id === "mdt_fixture_001",
    );
    if (!mandate) {
      throw new Error("Expected seeded mandate.");
    }

    mandate.status = "issued_reserved";
    mandate.reservedCents = 1200;

    data.attempts.unshift({
      id: "att_reconcile_facilitator",
      mandateId: "mdt_fixture_001",
      vendorId: "morph-market-data",
      amountCents: 1200,
      operatorId: "operator_fixture",
      status: "execution_unknown",
      financialOutcome: "execution_unknown",
      receiptEvidence: "required_pending",
      blockedReason: null,
      chargeReference: "charge_facilitator_1",
      paymentIdentifier: "pid_reconcile_facilitator",
      createdAt: now,
      updatedAt: now,
    });
    data.domainEvents.unshift({
      id: "evt_reconcile_facilitator",
      entityType: "payment_attempt",
      entityId: "att_reconcile_facilitator",
      eventType: "attempt_reconciliation_started",
      correlationId: "corr_facilitator",
      occurredAt: now,
      metadata: {
        paymentIdentifier: "pid_reconcile_facilitator",
        workerTaskId: "task_reconcile_facilitator",
        paymentPayloadJson: JSON.stringify({ signed: "payload" }),
        paymentRequirementsJson: JSON.stringify({ accepts: ["exact"] }),
      },
    });
    data.workerTasks.unshift({
      id: "task_reconcile_facilitator",
      kind: "reconcile_attempt",
      attemptId: "att_reconcile_facilitator",
      mandateId: "mdt_fixture_001",
      operatorId: "operator_fixture",
      correlationId: "corr_facilitator",
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
    });

    await resetStoreForTests(data);
    vi.stubEnv(
      "MORPH_X402_FACILITATOR_URL",
      "https://facilitator.example/x402",
    );
    vi.stubEnv("MORPH_X402_ACCESS_KEY", "test-access");
    vi.stubEnv("MORPH_X402_SECRET_KEY", "test-secret");
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ isValid: false }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await processReconciliationQueue(1);
    expect(result).toEqual({
      processed: 1,
      completed: 1,
      unresolved: 0,
      failed: 0,
      requeued: 0,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const attempts = await listAttempts();
    const processedAttempt = attempts.find(
      (attempt) => attempt.id === "att_reconcile_facilitator",
    );
    const refreshedMandates = await listMandates();
    expect(processedAttempt?.status).toBe("executed_charge_failed");
    expect(refreshedMandates[0].reservedCents).toBe(0);
    expect(refreshedMandates[0].status).toBe("issued_active");
  });

  it("keeps facilitator-confirmed charge success even if vendor status reports failed", async () => {
    const data = createTestStoreData();
    const now = new Date().toISOString();
    const mandate = data.mandates.find(
      (entry) => entry.id === "mdt_fixture_001",
    );
    if (!mandate) {
      throw new Error("Expected seeded mandate.");
    }

    mandate.status = "issued_reserved";
    mandate.reservedCents = 1200;

    data.attempts.unshift({
      id: "att_reconcile_facilitator_success",
      mandateId: "mdt_fixture_001",
      vendorId: "morph-market-data",
      amountCents: 1200,
      operatorId: "operator_fixture",
      status: "execution_unknown",
      financialOutcome: "execution_unknown",
      receiptEvidence: "required_pending",
      blockedReason: null,
      chargeReference: "charge_facilitator_success_1",
      paymentIdentifier: "pid_reconcile_facilitator_success",
      createdAt: now,
      updatedAt: now,
    });
    data.domainEvents.unshift({
      id: "evt_reconcile_facilitator_success",
      entityType: "payment_attempt",
      entityId: "att_reconcile_facilitator_success",
      eventType: "attempt_reconciliation_started",
      correlationId: "corr_facilitator_success",
      occurredAt: now,
      metadata: {
        paymentIdentifier: "pid_reconcile_facilitator_success",
        workerTaskId: "task_reconcile_facilitator_success",
        paymentPayloadJson: JSON.stringify({ signed: "payload" }),
        paymentRequirementsJson: JSON.stringify({ accepts: ["exact"] }),
      },
    });
    data.workerTasks.unshift({
      id: "task_reconcile_facilitator_success",
      kind: "reconcile_attempt",
      attemptId: "att_reconcile_facilitator_success",
      mandateId: "mdt_fixture_001",
      operatorId: "operator_fixture",
      correlationId: "corr_facilitator_success",
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
    });

    await resetStoreForTests(data);
    vi.stubEnv(
      "MORPH_X402_FACILITATOR_URL",
      "https://facilitator.example/x402",
    );
    vi.stubEnv("MORPH_X402_ACCESS_KEY", "test-access");
    vi.stubEnv("MORPH_X402_SECRET_KEY", "test-secret");
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ isValid: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "executed_charge_failed",
            chargeReference: "charge_facilitator_success_1",
            receiptEvidence: "missing_timeout",
            finalAmountCents: 600,
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    const result = await processReconciliationQueue(1);
    expect(result).toEqual({
      processed: 1,
      completed: 1,
      unresolved: 0,
      failed: 0,
      requeued: 0,
    });

    const attempts = await listAttempts();
    const processedAttempt = attempts.find(
      (attempt) => attempt.id === "att_reconcile_facilitator_success",
    );
    const refreshedMandates = await listMandates();

    expect(processedAttempt?.status).toBe("executed_charge_succeeded");
    expect(processedAttempt?.receiptEvidence).toBe("missing_timeout");
    expect(refreshedMandates[0].reservedCents).toBe(0);
    expect(refreshedMandates[0].consumedCents).toBe(1800);
  });

  it("releases a queued attempt without vendor dispatch if the mandate was revoked before dispatch", async () => {
    const [mandate] = await listMandates();

    const queuedAttempt = await runAttempt({
      mandateId: mandate.id,
      vendorId: "morph-market-data",
      amountCents: 1300,
      operatorId: "operator_fixture",
      paymentIdentifier: "pid_worker_revoked_before_dispatch",
    });

    const data = await readStore();
    const targetMandate = data.mandates.find(
      (entry) => entry.id === mandate.id,
    );
    if (!targetMandate) {
      throw new Error("Expected seeded mandate.");
    }
    targetMandate.status = "revoked";
    targetMandate.updatedAt = new Date().toISOString();
    await resetStoreForTests(data);

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const workerResult = await processExecutionQueue();

    expect(workerResult).toEqual({
      processed: 1,
      completed: 0,
      unresolved: 0,
      failed: 1,
      requeued: 0,
    });
    expect(fetchSpy).not.toHaveBeenCalled();

    const attempts = await listAttempts();
    const processedAttempt = attempts.find(
      (attempt) => attempt.id === queuedAttempt.id,
    );
    const refreshedMandates = await listMandates();

    expect(processedAttempt?.status).toBe("cancelled_released");
    expect(processedAttempt?.blockedReason).toBe(
      "mandate_revoked_before_dispatch",
    );
    expect(refreshedMandates[0].reservedCents).toBe(0);
  });

  it("releases a queued attempt without vendor dispatch if the mandate expired before dispatch", async () => {
    const [mandate] = await listMandates();

    const queuedAttempt = await runAttempt({
      mandateId: mandate.id,
      vendorId: "morph-market-data",
      amountCents: 1300,
      operatorId: "operator_fixture",
      paymentIdentifier: "pid_worker_expired_before_dispatch",
    });

    const data = await readStore();
    const targetMandate = data.mandates.find(
      (entry) => entry.id === mandate.id,
    );
    if (!targetMandate) {
      throw new Error("Expected seeded mandate.");
    }
    targetMandate.status = "expired";
    targetMandate.expiresAt = "2000-01-01T00:00:00.000Z";
    targetMandate.updatedAt = new Date().toISOString();
    await resetStoreForTests(data);

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const workerResult = await processExecutionQueue();

    expect(workerResult).toEqual({
      processed: 1,
      completed: 0,
      unresolved: 0,
      failed: 1,
      requeued: 0,
    });
    expect(fetchSpy).not.toHaveBeenCalled();

    const attempts = await listAttempts();
    const processedAttempt = attempts.find(
      (attempt) => attempt.id === queuedAttempt.id,
    );
    const refreshedMandates = await listMandates();

    expect(processedAttempt?.status).toBe("cancelled_released");
    expect(processedAttempt?.blockedReason).toBe(
      "mandate_expired_before_dispatch",
    );
    expect(refreshedMandates[0].reservedCents).toBe(0);
  });
});
