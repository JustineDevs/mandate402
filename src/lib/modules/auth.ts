import {
  DEMO_OPERATOR_TOKEN,
  getOperatorToken,
  getSupabaseRuntimeConfig,
  isProductionEnv,
} from "@/lib/infrastructure/env";
import {
  getSupabaseRole,
  getSupabaseServerClient,
} from "@/lib/infrastructure/supabase-server";

export type OperatorContext = {
  operatorId: string;
  role: "operator" | "platform_admin";
};

export class AuthError extends Error {
  constructor(message = "Unauthorized operator request.") {
    super(message);
    this.name = "AuthError";
  }
}

function readPresentedToken(request?: Request) {
  if (!request) {
    return DEMO_OPERATOR_TOKEN;
  }

  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    return bearer.slice("Bearer ".length);
  }

  return request.headers.get("x-operator-token");
}

function assertProductionAuthReady() {
  const supabase = getSupabaseRuntimeConfig();
  if (!supabase.url || !supabase.anonKey) {
    throw new AuthError(
      "Production auth is not configured. Supabase auth settings are required.",
    );
  }
}

export async function requireOperator(request?: Request) {
  const presented = readPresentedToken(request);

  if (isProductionEnv()) {
    assertProductionAuthReady();

    if (!presented) {
      throw new AuthError();
    }

    const client = getSupabaseServerClient();
    const { data, error } = await client.auth.getUser(presented);
    if (error || !data.user) {
      throw new AuthError();
    }

    const role = getSupabaseRole(data.user);
    if (!role) {
      throw new AuthError("Operator role is not authorized.");
    }

    return {
      operatorId: data.user.id,
      role,
    } satisfies OperatorContext;
  }

  const expected = getOperatorToken();

  if (!presented || presented !== expected) {
    throw new AuthError();
  }

  return {
    operatorId:
      expected === DEMO_OPERATOR_TOKEN ? "operator_demo" : "operator_live",
    role: "operator",
  } satisfies OperatorContext;
}
