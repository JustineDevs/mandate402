import { UnauthorizedError } from "@/lib/domain/errors";
import { getSupabaseRuntimeConfig } from "@/lib/infrastructure/env";
import {
  ensureOperatorProfileRecord,
  getOperatorProfile,
  getSupabaseRole,
  getSupabaseServerClient,
} from "@/lib/infrastructure/supabase-server";

export type OperatorContext = {
  operatorId: string;
  role: "operator" | "platform_admin";
};

export class AuthError extends UnauthorizedError {
  constructor(message = "Unauthorized operator request.") {
    super(message);
    this.name = "AuthError";
  }
}

function readPresentedToken(request?: Request) {
  if (!request) {
    return undefined;
  }

  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    return bearer.slice("Bearer ".length);
  }

  return undefined;
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
  assertProductionAuthReady();

  if (!presented) {
    throw new AuthError();
  }

  const client = getSupabaseServerClient();
  const { data, error } = await client.auth.getUser(presented);
  if (error || !data.user) {
    throw new AuthError();
  }

  let profile = await getOperatorProfile(presented, data.user.id);
  if (!profile) {
    await ensureOperatorProfileRecord(data.user);
    profile = await getOperatorProfile(presented, data.user.id);
  }
  if (profile?.status === "disabled") {
    throw new AuthError("Operator profile is disabled.");
  }

  const role =
    (profile?.role === "platform_admin" || profile?.role === "operator"
      ? profile.role
      : null) ?? getSupabaseRole(data.user);
  if (!role) {
    throw new AuthError("Operator role is not authorized.");
  }

  return {
    operatorId: data.user.id,
    role,
  } satisfies OperatorContext;
}
