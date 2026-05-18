import { afterEach, describe, expect, it, vi } from "vitest";

import { DEMO_OPERATOR_TOKEN } from "@/lib/infrastructure/env";
import { AuthError, requireOperator } from "@/lib/modules/auth";

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

  it("accepts the configured demo token", async () => {
    await expect(
      requireOperator(
        makeRequest({
          "x-operator-token": DEMO_OPERATOR_TOKEN,
        }),
      ),
    ).resolves.toEqual({
      operatorId: "operator_demo",
      role: "operator",
    });
  });

  it("rejects missing credentials", async () => {
    await expect(requireOperator(makeRequest({}))).rejects.toThrow(AuthError);
  });

  it("rejects demo token auth in production mode", async () => {
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
          "x-operator-token": DEMO_OPERATOR_TOKEN,
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
  });
});
