import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTestStoreData,
  resetStoreForTests,
} from "@/lib/infrastructure/store";
import { processExecutionQueue } from "@/lib/modules/execution-worker";
import { listAttempts, listMandates, runAttempt } from "@/lib/modules/mandates";

vi.mock("@/lib/modules/morph-anchor", () => ({
  issueMandateAnchor: vi.fn().mockResolvedValue("0xtest_issue_anchor"),
  revokeMandateAnchor: vi.fn().mockResolvedValue("0xtest_revoke_anchor"),
}));

describe("execution worker", () => {
  beforeEach(async () => {
    await resetStoreForTests(createTestStoreData());
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
});
