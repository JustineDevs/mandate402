import { afterEach, describe, expect, it, vi } from "vitest";

describe("production persistence guard", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("rejects sqlite persistence in production mode", async () => {
    vi.stubEnv("APP_ENV", "production");

    const store = await import("@/lib/infrastructure/store");

    await expect(store.readStore()).rejects.toThrow(
      "Production mode requires postgres persistence. SQLite is demo-only.",
    );
  });

  it("rejects postgres mode without a database url", async () => {
    vi.stubEnv("APP_ENV", "demo");
    vi.stubEnv("MANDATE402_PERSISTENCE_MODE", "postgres");

    const store = await import("@/lib/infrastructure/store");

    await expect(store.readStore()).rejects.toThrow(
      "Postgres persistence mode requires MANDATE402_DATABASE_URL or DATABASE_URL.",
    );
  });
});
