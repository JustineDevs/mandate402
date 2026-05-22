import { afterEach, describe, expect, it, vi } from "vitest";

describe("blockchain runtime health", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("reports degraded test health without forcing an RPC probe", async () => {
    vi.stubEnv("APP_ENV", "test");
    vi.stubEnv("MORPH_PRIVATE_KEY", "");
    vi.stubEnv("MANDATE_REGISTRY_ADDRESS", "");
    vi.stubEnv("MANDATE402_TREASURY_ADDRESS", "");
    vi.doMock("@/lib/blockchain/clients", () => ({
      getMorphPublicClient: vi.fn(),
      hasMorphSigner: () => false,
    }));

    const { getBlockchainRuntimeHealth } = await import(
      "@/lib/blockchain/health"
    );

    const health = await getBlockchainRuntimeHealth();

    expect(health.status).toBe("degraded");
    expect(health.network.key).toBe("morph-mainnet");
    expect(health.rpcProbeAttempted).toBe(false);
    expect(health.rpcReachable).toBeNull();
    expect(health.signerReady).toBe(false);
    expect(health.anchoringReady).toBe(false);
    expect(health.treasuryEnforcementMode).toBe("not_configured");
  }, 30_000);

  it("reports ready production health when RPC and contracts are configured", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("MORPH_RPC_URL", "https://rpc.example");
    vi.stubEnv("MORPH_EXPLORER_URL", "https://explorer.example");
    vi.stubEnv(
      "MORPH_PRIVATE_KEY",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    );
    vi.stubEnv(
      "MANDATE_REGISTRY_ADDRESS",
      "0x1111111111111111111111111111111111111111",
    );
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
    vi.stubEnv("MORPH_CHAIN_ID", "2818");

    vi.doMock("@/lib/blockchain/clients", () => ({
      getMorphPublicClient: () => ({
        getChainId: vi.fn().mockResolvedValue(2818),
        getBlockNumber: vi.fn().mockResolvedValue(123456n),
      }),
      hasMorphSigner: () => true,
    }));

    const { getBlockchainRuntimeHealth } = await import(
      "@/lib/blockchain/health"
    );

    const health = await getBlockchainRuntimeHealth();

    expect(health.status).toBe("ready");
    expect(health.rpcProbeAttempted).toBe(true);
    expect(health.rpcReachable).toBe(true);
    expect(health.chainIdMatches).toBe(true);
    expect(health.lastObservedBlock).toBe("123456");
    expect(health.anchoringReady).toBe(true);
    expect(health.treasuryPrepared).toBe(true);
    expect(health.treasuryEnforcementMode).toBe("enabled");
    expect(health.treasuryAgentMappings).toEqual({
      mapped: [],
      unmapped: [],
    });
  });
});
