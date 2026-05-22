import { afterEach, describe, expect, it, vi } from "vitest";

function makeRequest(headers: Record<string, string>) {
  return new Request("http://localhost/api/test", {
    headers,
  });
}

describe("requireOperator", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("accepts a valid Supabase-backed operator token", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.doMock("@/lib/infrastructure/supabase-server", () => ({
      getSupabaseRole: () => "operator",
      getSupabaseServerClient: () => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "operator_fixture",
                app_metadata: { role: "operator" },
              },
            },
            error: null,
          }),
        },
      }),
    }));
    vi.resetModules();

    const { requireOperator } = await import("@/lib/modules/auth");

    await expect(
      requireOperator(
        makeRequest({
          authorization: "Bearer valid-token",
        }),
      ),
    ).resolves.toEqual({
      operatorId: "operator_fixture",
      role: "operator",
    });
  });

  it("rejects missing credentials", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.resetModules();

    const { requireOperator } = await import("@/lib/modules/auth");

    await expect(requireOperator(makeRequest({}))).rejects.toThrow(
      "Unauthorized operator request.",
    );
  });

  it("rejects invalid token auth in production mode", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.doMock("@/lib/infrastructure/supabase-server", () => ({
      getSupabaseRole: () => null,
      getSupabaseServerClient: () => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error("unauthorized"),
          }),
        },
      }),
    }));
    vi.resetModules();

    const { requireOperator: requireOperatorProd, AuthError: AuthErrorProd } =
      await import("@/lib/modules/auth");

    await expect(
      requireOperatorProd(
        makeRequest({
          authorization: "Bearer invalid-token",
        }),
      ),
    ).rejects.toThrow(AuthErrorProd);
  });

  it("ignores user_metadata roles for production authorization", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.doMock("@/lib/infrastructure/supabase-server", async () => {
      const actual = await vi.importActual<
        typeof import("@/lib/infrastructure/supabase-server")
      >("@/lib/infrastructure/supabase-server");

      return {
        ...actual,
        getSupabaseServerClient: () => ({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: {
                user: {
                  id: "user_1",
                  app_metadata: {},
                  user_metadata: { role: "platform_admin" },
                },
              },
              error: null,
            }),
          },
        }),
      };
    });
    vi.resetModules();

    const { requireOperator: requireOperatorProd, AuthError: AuthErrorProd } =
      await import("@/lib/modules/auth");

    await expect(
      requireOperatorProd(
        makeRequest({
          authorization: "Bearer real-token",
        }),
      ),
    ).rejects.toThrow(AuthErrorProd);
  }, 30_000);
});
