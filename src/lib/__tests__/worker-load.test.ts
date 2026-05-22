import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTestStoreData,
  resetStoreForTests,
} from "@/lib/infrastructure/store";
import { resetPaymentFetchForTests } from "@/lib/infrastructure/x402-client";
import { processExecutionQueue } from "@/lib/modules/execution-worker";
import { listAttempts, listMandates, runAttempt } from "@/lib/modules/mandates";

vi.mock("@/lib/modules/morph-anchor", () => ({
  issueMandateAnchor: vi.fn().mockResolvedValue("0xtest_issue_anchor"),
  revokeMandateAnchor: vi.fn().mockResolvedValue("0xtest_revoke_anchor"),
}));

beforeEach(async () => {
  await resetStoreForTests(createTestStoreData());
  vi.stubEnv(
    "MORPH_PRIVATE_KEY",
    "0x1111111111111111111111111111111111111111111111111111111111111111",
  );
  vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  resetPaymentFetchForTests();
});

describe("worker queue load", () => {
  it("drains a repeatable execution backlog without duplicate identifiers", async () => {
    const data = createTestStoreData();
    const mandateTemplate = data.mandates[0];
    data.mandates = Array.from({ length: 3 }, (_value, index) => ({
      ...mandateTemplate,
      id: `mdt_load_${index}`,
      name: `Load Mandate ${index}`,
      consumedCents: 0,
      reservedCents: 0,
    }));
    data.attempts = [];
    data.workerTasks = [];
    data.auditEntries = [];
    data.domainEvents = [];
    await resetStoreForTests(data);
    const mandates = await listMandates();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "executed_charge_succeeded",
          chargeReference: "charge_load_test",
          receiptEvidence: "received_valid",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    for (let index = 0; index < 3; index += 1) {
      const attempt = await runAttempt({
        mandateId: mandates[index].id,
        vendorId: "morph-market-data",
        amountCents: 100,
        operatorId: "operator_fixture",
        paymentIdentifier: `pid_load_${index}`,
      });
      expect(attempt.status).toBe("dispatch_queued");
    }

    await expect(processExecutionQueue(3)).resolves.toMatchObject({
      processed: 3,
      completed: 3,
      failed: 0,
      unresolved: 0,
    });

    const attempts = await listAttempts();
    const loadAttempts = attempts.filter((attempt) =>
      attempt.paymentIdentifier.startsWith("pid_load_"),
    );
    expect(loadAttempts).toHaveLength(3);
    expect(
      new Set(loadAttempts.map((attempt) => attempt.paymentIdentifier)).size,
    ).toBe(3);
    expect(
      loadAttempts.every(
        (attempt) => attempt.status === "executed_charge_succeeded",
      ),
    ).toBe(true);
  });
});
