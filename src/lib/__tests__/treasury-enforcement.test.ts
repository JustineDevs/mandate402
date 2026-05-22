import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTestStoreData,
  resetStoreForTests,
} from "@/lib/infrastructure/store";

describe("treasury execution runtime", () => {
  beforeEach(async () => {
    await resetStoreForTests(createTestStoreData());
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("enables treasury execution mode when all runtime inputs are present", async () => {
    vi.stubEnv(
      "MANDATE402_TREASURY_ADDRESS",
      "0x2222222222222222222222222222222222222222",
    );
    vi.stubEnv(
      "MANDATE402_PYTH_ORACLE_ADDRESS",
      "0x3333333333333333333333333333333333333333",
    );
    vi.stubEnv(
      "MANDATE402_PYTH_ETH_USD_FEED_ID",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
    vi.stubEnv(
      "MANDATE402_PYTH_USDC_USD_FEED_ID",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    );
    vi.stubEnv(
      "MANDATE402_TREASURY_SETTLEMENT_TOKEN_ADDRESS",
      "0x4444444444444444444444444444444444444444",
    );
    vi.stubEnv(
      "MANDATE402_TREASURY_FACILITATOR_ADDRESS",
      "0x5555555555555555555555555555555555555555",
    );

    const { getTreasuryExecutionRuntimeConfig } = await import(
      "@/lib/blockchain/treasury"
    );

    expect(getTreasuryExecutionRuntimeConfig()).toMatchObject({
      mode: "enabled",
      settlementTokenAddress: "0x4444444444444444444444444444444444444444",
      facilitatorAddress: "0x5555555555555555555555555555555555555555",
      settlementTokenDecimals: 6,
    });
  }, 30_000);

  it("blocks an attempt before dispatch when treasury enforcement rejects it", async () => {
    vi.doMock("@/lib/blockchain/treasury", () => {
      class MockTreasuryEnforcementError extends Error {
        code: string;

        constructor(
          message = "Treasury enforcement rejected the payment attempt.",
          code = "treasury_guard_denied",
        ) {
          super(message);
          this.name = "TreasuryEnforcementError";
          this.code = code;
        }
      }

      return {
        TreasuryEnforcementError: MockTreasuryEnforcementError,
        enforceTreasuryExecution: vi
          .fn()
          .mockRejectedValue(
            new MockTreasuryEnforcementError(
              "Treasury denied execution.",
              "treasury_guard_denied",
            ),
          ),
      };
    });

    const { listMandates, runAttempt, listAuditEntries } = await import(
      "@/lib/modules/mandates"
    );

    const [mandate] = await listMandates();
    const attempt = await runAttempt({
      mandateId: mandate.id,
      vendorId: "morph-market-data",
      amountCents: 1200,
      operatorId: "operator_fixture",
      paymentIdentifier: "pid_treasury_blocked",
    });

    expect(attempt.status).toBe("policy_denied");
    expect(attempt.blockedReason).toBe("treasury_guard_denied");

    const audits = await listAuditEntries();
    expect(
      audits.some(
        (entry) =>
          entry.attemptId === attempt.id &&
          entry.message.includes("treasury_guard_denied"),
      ),
    ).toBe(true);
  });
});
