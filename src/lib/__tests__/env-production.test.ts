import { afterEach, describe, expect, it, vi } from "vitest";

describe("production environment guards", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("requires APP_ENV to be explicit when NODE_ENV is production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "");

    const env = await import("@/lib/infrastructure/env");

    expect(() => env.getAppEnv()).toThrow(
      "APP_ENV must be explicitly set in production.",
    );
  });

  it("requires an explicit MORPH_RPC_URL in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("MORPH_RPC_URL", "");

    const env = await import("@/lib/infrastructure/env");
    const config = env.getMorphRuntimeConfig();

    expect(config.rpcUrl).toBe("");
  });

  it("rejects invalid production chain id for Morph anchoring", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("MORPH_RPC_URL", "https://rpc.example");
    vi.stubEnv(
      "MORPH_PRIVATE_KEY",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    );
    vi.stubEnv(
      "MANDATE_REGISTRY_ADDRESS",
      "0x1111111111111111111111111111111111111111",
    );
    vi.stubEnv("MORPH_CHAIN_ID", "not-a-number");

    const env = await import("@/lib/infrastructure/env");

    expect(() => env.assertProductionMorphAnchoringConfig()).toThrow(
      "Morph anchoring is not fully configured for production mode.",
    );
  });
});
