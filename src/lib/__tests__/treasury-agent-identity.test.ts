import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildAgentTreasuryGovernancePlan,
  enforceTreasuryExecution,
} from "@/lib/blockchain/treasury";
import type { Agent } from "@/lib/domain/types";

const writeContract = vi.fn();
const waitForTransactionReceipt = vi.fn();

function configureTreasuryEnv() {
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
}

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent_research_alpha",
    name: "Research Alpha",
    status: "active",
    onchainAddress: null,
    walletProvider: null,
    providerWalletId: null,
    chainId: null,
    createdByOperatorId: null,
    verifiedAt: null,
    rotatedAt: null,
    createdAt: "2026-05-30T00:00:00.000Z",
    updatedAt: "2026-05-30T00:00:00.000Z",
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("treasury agent identity", () => {
  it("fails closed when treasury is enabled and agent identity is missing", async () => {
    configureTreasuryEnv();

    await expect(
      enforceTreasuryExecution({
        agent: makeAgent(),
        amountCents: 100,
      }),
    ).rejects.toMatchObject({ code: "missing_agent_onchain_address" });
  });

  it("uses the persisted verified agent address for treasury execution", async () => {
    configureTreasuryEnv();
    writeContract.mockResolvedValueOnce("0xtx");
    waitForTransactionReceipt.mockResolvedValueOnce({});

    const result = await enforceTreasuryExecution({
      agent: makeAgent({
        onchainAddress: "0x5555555555555555555555555555555555555555",
        walletProvider: "privy",
        providerWalletId: "privy-wallet-1",
        chainId: 2910,
        createdByOperatorId: "operator_fixture",
        verifiedAt: "2026-05-30T00:00:00.000Z",
      }),
      amountCents: 123,
      clients: {
        walletClient: { writeContract },
        publicClient: { waitForTransactionReceipt },
      },
    });

    expect(result).toMatchObject({ enforced: true, txHash: "0xtx" });
    expect(writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "executeX402Payment",
        args: expect.arrayContaining([
          "0x5555555555555555555555555555555555555555",
        ]),
      }),
    );
  });

  it("prepares governance calls for the same persisted agent address", async () => {
    configureTreasuryEnv();

    const plan = buildAgentTreasuryGovernancePlan({
      agent: makeAgent({
        onchainAddress: "0x5555555555555555555555555555555555555555",
        walletProvider: "privy",
        providerWalletId: "privy-wallet-1",
        chainId: 2910,
        createdByOperatorId: "operator_fixture",
        verifiedAt: "2026-05-30T00:00:00.000Z",
      }),
      maxUsdSpendPerWindow: 10_000_000n,
      windowDurationSeconds: 3600n,
      pythPriceFeedId:
        "0xeaa020c61cc479712813461ce153894b96a6c00b21ed0cfc2798d1f9a9e9c94a",
      killSwitchEnabled: false,
    });

    expect(plan).toMatchObject({
      ready: true,
      agentAddress: "0x5555555555555555555555555555555555555555",
      setMandate: { functionName: "setMandate" },
      setApprovedFacilitator: { functionName: "setApprovedFacilitator" },
      setKillSwitch: { functionName: "setKillSwitch" },
    });
  });
});
