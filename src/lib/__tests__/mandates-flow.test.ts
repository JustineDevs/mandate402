import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTestStoreData,
  resetStoreForTests,
} from "@/lib/infrastructure/store";
import { resetPaymentFetchForTests } from "@/lib/infrastructure/x402-client";
import {
  ensureReconciliationQueued,
  processExecutionQueue,
  processReconciliationQueue,
} from "@/lib/modules/execution-worker";
import {
  createMandate as createMandateRecord,
  listAttempts,
  listAuditEntries,
  listMandates,
  runAttempt,
} from "@/lib/modules/mandates";

vi.mock("@/lib/modules/morph-anchor", () => ({
  issueMandateAnchor: vi.fn().mockResolvedValue("0xtest_issue_anchor"),
  revokeMandateAnchor: vi.fn().mockResolvedValue("0xtest_revoke_anchor"),
}));

beforeEach(async () => {
  await resetStoreForTests(createTestStoreData());
});

const TEST_PRIVATE_KEY =
  "0x1111111111111111111111111111111111111111111111111111111111111111";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  resetPaymentFetchForTests();
});

describe("mandate flow", () => {
  it("uses canonical agent data and normalizes approved vendors on mandate creation", async () => {
    vi.stubEnv("MORPH_PRIVATE_KEY", TEST_PRIVATE_KEY);

    const created = await createMandateRecord({
      name: "  Canonical Mandate  ",
      agentId: "agent_research_alpha",
      agentName: "Spoofed Agent Name",
      budgetCapCents: 2500,
      expiresAt: "3026-01-01T00:00:00.000Z",
      approvedVendorIds: [
        "morph-market-data",
        "morph-market-data",
        "morph-research-net",
      ],
      requiresReceiptCapability: true,
    });

    expect(created.name).toBe("Canonical Mandate");
    expect(created.agentName).toBe("Research Alpha");
    expect(created.approvedVendorIds).toEqual([
      "morph-market-data",
      "morph-research-net",
    ]);
  });

  it("rejects unregistered approved vendors on mandate creation", async () => {
    vi.stubEnv("MORPH_PRIVATE_KEY", TEST_PRIVATE_KEY);

    await expect(
      createMandateRecord({
        name: "Bad Vendor Mandate",
        agentId: "agent_research_alpha",
        budgetCapCents: 2500,
        expiresAt: "3026-01-01T00:00:00.000Z",
        approvedVendorIds: ["rogue-vendor"],
        requiresReceiptCapability: true,
      }),
    ).rejects.toThrow("Approved vendor rogue-vendor is not registered.");
  });

  it("does not mark execution_unknown as reconciled before correlation", async () => {
    vi.stubEnv("MORPH_PRIVATE_KEY", TEST_PRIVATE_KEY);
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          const error = new Error("Timed out");
          error.name = "AbortError";
          reject(error);
        }) as Promise<Response>,
    );

    const [mandate] = await listMandates();
    const attempt = await runAttempt({
      mandateId: mandate.id,
      vendorId: "morph-market-data",
      amountCents: 1300,
      operatorId: "operator_fixture",
      paymentIdentifier: "pid_unknown",
    });

    expect(attempt.status).toBe("dispatch_queued");

    const workerResult = await processExecutionQueue();
    expect(workerResult).toMatchObject({
      processed: 1,
      unresolved: 1,
    });

    const audits = await listAuditEntries();
    const related = audits.filter((entry) => entry.attemptId === attempt.id);

    expect(
      related.some((entry) => entry.type === "attempt_reconciliation_started"),
    ).toBe(true);
    expect(related.some((entry) => entry.type === "attempt_reconciled")).toBe(
      false,
    );
  });

  it("reconciles unknown attempts from correlated vendor truth", async () => {
    vi.stubEnv("MORPH_PRIVATE_KEY", TEST_PRIVATE_KEY);
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            const error = new Error("Timed out");
            error.name = "AbortError";
            reject(error);
          }) as Promise<Response>,
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "executed_charge_succeeded",
            chargeReference: "charge_corr_1",
            receiptEvidence: "received_valid",
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      );

    const [mandate] = await listMandates();
    const attempt = await runAttempt({
      mandateId: mandate.id,
      vendorId: "morph-market-data",
      amountCents: 1300,
      operatorId: "operator_fixture",
      paymentIdentifier: "pid_corr",
    });

    await expect(processExecutionQueue()).resolves.toMatchObject({
      processed: 1,
      unresolved: 1,
    });

    const queued = await ensureReconciliationQueued({
      mandateId: mandate.id,
      attemptId: attempt.id,
    });
    expect(queued.task.kind).toBe("reconcile_attempt");

    await expect(processReconciliationQueue()).resolves.toMatchObject({
      processed: 1,
      completed: 1,
    });

    const refreshedAttempts = await listAttempts();
    const reconciled = refreshedAttempts.find(
      (entry) => entry.id === attempt.id,
    );

    expect(reconciled?.status).toBe("executed_charge_succeeded");
    expect(reconciled?.receiptEvidence).toBe("received_valid");

    const refreshedMandates = await listMandates();
    expect(refreshedMandates[0].reservedCents).toBe(0);
    expect(refreshedMandates[0].consumedCents).toBe(2500);
  });

  it("rejects non-positive attempt amounts", async () => {
    const [mandate] = await listMandates();

    await expect(
      runAttempt({
        mandateId: mandate.id,
        vendorId: "morph-market-data",
        amountCents: 0,
        operatorId: "operator_fixture",
      }),
    ).rejects.toThrow(
      "Attempt amount must be a positive integer amount in cents.",
    );
  });

  it("blocks approved attempts when enabled treasury enforcement lacks verified agent identity", async () => {
    vi.stubEnv(
      "MANDATE402_TREASURY_ADDRESS",
      "0x1111111111111111111111111111111111111111",
    );
    vi.stubEnv(
      "MANDATE402_PYTH_ORACLE_ADDRESS",
      "0x2222222222222222222222222222222222222222",
    );
    vi.stubEnv(
      "MANDATE402_PYTH_ETH_USD_FEED_ID",
      "0xff61491a931112ddf1bd8147cd1b641375f79f582bb9473d47a502f86ef44195",
    );
    vi.stubEnv(
      "MANDATE402_PYTH_USDC_USD_FEED_ID",
      "0xeaa020c61cc479712813461ce153894b96a6c00b21ed0cfc2798d1f9a9e9c94a",
    );
    vi.stubEnv(
      "MANDATE402_TREASURY_SETTLEMENT_TOKEN_ADDRESS",
      "0x3333333333333333333333333333333333333333",
    );
    vi.stubEnv(
      "MANDATE402_TREASURY_FACILITATOR_ADDRESS",
      "0x4444444444444444444444444444444444444444",
    );
    vi.stubEnv("MANDATE402_TREASURY_SETTLEMENT_TOKEN_DECIMALS", "6");

    const [mandate] = await listMandates();
    const attempt = await runAttempt({
      mandateId: mandate.id,
      vendorId: "morph-market-data",
      amountCents: 1300,
      operatorId: "operator_fixture",
      paymentIdentifier: "pid_treasury_missing_agent_identity",
    });

    expect(attempt).toMatchObject({
      status: "policy_denied",
      blockedReason: "missing_agent_onchain_address",
    });
  });
});
