import { afterEach, describe, expect, it, vi } from "vitest";

describe("morph anchor production guard", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("rejects demo fallback anchoring in production mode", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("MORPH_RPC_URL", "");
    vi.stubEnv("MORPH_PRIVATE_KEY", "");
    vi.stubEnv("MANDATE_REGISTRY_ADDRESS", "");
    vi.resetModules();

    const env = await import("@/lib/infrastructure/env");

    expect(() => env.assertProductionMorphAnchoringConfig()).toThrow(
      "Morph anchoring is not fully configured for production mode.",
    );
  });
});
