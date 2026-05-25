import { afterEach, describe, expect, it, vi } from "vitest";

describe("production environment guards", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("requires APP_ENV to be explicit when NODE_ENV is production", async () => {
    vi.stubEnv("VITEST", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "");

    const env = await import("@/lib/infrastructure/env");

    expect(() => env.getAppEnv()).toThrow("APP_ENV must be explicitly set.");
  });

  it("requires an explicit MORPH_RPC_URL in production mode", async () => {
    vi.stubEnv("VITEST", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("MORPH_RPC_URL", "");

    const env = await import("@/lib/infrastructure/env");
    const config = env.getMorphRuntimeConfig();

    expect(config.rpcUrl).toBe("");
  });

  it("rejects invalid production chain id for Morph anchoring", async () => {
    vi.stubEnv("VITEST", "");
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

  it("loads provider-aware Supabase auth UI config from env", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_AUTH_ENABLE_EMAIL", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_AUTH_ENABLE_GOOGLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_AUTH_ENABLE_WEB3", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_WEB3_CHAIN", "ethereum");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_WEB3_STATEMENT",
      "I authorize Mandate402 to open the protected operator workspace.",
    );
    vi.stubEnv("MANDATE402_SITE_URL", "https://mandate402.example.com");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL",
      "https://mandate402.example.com/operator",
    );

    const env = await import("@/lib/infrastructure/env");
    const config = env.getSupabaseAuthUiConfig();

    expect(config).toMatchObject({
      enableEmailPassword: true,
      enableGoogleOAuth: true,
      enableWeb3: true,
      web3Chain: "ethereum",
      redirectUrl: "https://mandate402.example.com/operator",
      siteUrl: "https://mandate402.example.com",
    });
  });
});
