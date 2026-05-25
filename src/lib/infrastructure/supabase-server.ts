import { type User, createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

import {
  getDatabaseDirectUrl,
  getDatabaseUrl,
  getSupabaseRuntimeConfig,
} from "@/lib/infrastructure/env";

function isHostnameWithinDomain(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function usesSupabaseManagedHost(connectionString: string) {
  try {
    const host = new URL(connectionString).hostname.toLowerCase();
    return (
      isHostnameWithinDomain(host, "supabase.co") ||
      isHostnameWithinDomain(host, "pooler.supabase.com")
    );
  } catch {
    return false;
  }
}

function createSupabaseServerClient() {
  const config = getSupabaseRuntimeConfig();
  if (!config.url || !config.anonKey) {
    throw new Error(
      "Supabase auth is not configured. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.",
    );
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

let supabaseServerClient: ReturnType<typeof createSupabaseServerClient> | null =
  null;
let operatorProfilePool: Pool | null = null;

export function getSupabaseServerClient() {
  if (supabaseServerClient !== null) {
    return supabaseServerClient;
  }

  supabaseServerClient = createSupabaseServerClient();
  return supabaseServerClient as ReturnType<typeof createClient>;
}

function buildOperatorProfilePool() {
  const connectionString = getDatabaseDirectUrl() ?? getDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      "Operator profile bootstrap requires MANDATE402_DATABASE_DIRECT_URL, DATABASE_DIRECT_URL, MANDATE402_DATABASE_URL, or DATABASE_URL.",
    );
  }

  const useSupabaseSsl = usesSupabaseManagedHost(connectionString);

  return new Pool({
    connectionString,
    max: 2,
    idleTimeoutMillis: 10_000,
    allowExitOnIdle: true,
    ssl: useSupabaseSsl ? { rejectUnauthorized: false } : undefined,
  });
}

function getOperatorProfilePool() {
  if (operatorProfilePool) {
    return operatorProfilePool;
  }

  operatorProfilePool = buildOperatorProfilePool();
  return operatorProfilePool;
}

export function createSupabaseRequestClient(accessToken?: string) {
  const config = getSupabaseRuntimeConfig();
  if (!config.url || !config.anonKey) {
    throw new Error(
      "Supabase auth is not configured. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.",
    );
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export type OperatorProfileRecord = {
  auth_user_id: string;
  role: string;
  status: string;
  primary_auth_provider: string | null;
  email: string | null;
  full_name: string | null;
  wallet_address: string | null;
};

export async function getOperatorProfile(accessToken: string, userId: string) {
  const client = createSupabaseRequestClient(accessToken);
  const { data, error } = await client
    .from("operator_profiles")
    .select(
      "auth_user_id, role, status, primary_auth_provider, email, full_name, wallet_address",
    )
    .eq("auth_user_id", userId)
    .maybeSingle<OperatorProfileRecord>();

  if (error) {
    return null;
  }

  return data;
}

function inferPrimaryProvider(user: User) {
  if (typeof user.app_metadata?.provider === "string") {
    return user.app_metadata.provider;
  }

  if (Array.isArray(user.identities) && user.identities[0]?.provider) {
    return user.identities[0].provider;
  }

  return null;
}

export async function ensureOperatorProfileRecord(user: User) {
  const pool = getOperatorProfilePool();
  const role =
    user.app_metadata?.role === "platform_admin"
      ? "platform_admin"
      : "operator";
  const status =
    typeof user.app_metadata?.status === "string" &&
    user.app_metadata.status.trim()
      ? user.app_metadata.status
      : "active";
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;
  const now = new Date().toISOString();

  await pool.query(
    `
      INSERT INTO operator_profiles (
        auth_user_id,
        role,
        status,
        email,
        full_name,
        primary_auth_provider,
        onboarding_state,
        last_sign_in_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'needs_treasury_connection', $7, $8)
      ON CONFLICT (auth_user_id) DO UPDATE
      SET role = EXCLUDED.role,
          status = EXCLUDED.status,
          email = EXCLUDED.email,
          full_name = COALESCE(EXCLUDED.full_name, operator_profiles.full_name),
          primary_auth_provider = COALESCE(
            EXCLUDED.primary_auth_provider,
            operator_profiles.primary_auth_provider
          ),
          last_sign_in_at = EXCLUDED.last_sign_in_at,
          updated_at = EXCLUDED.updated_at
    `,
    [
      user.id,
      role,
      status,
      user.email ?? null,
      fullName,
      inferPrimaryProvider(user),
      user.last_sign_in_at ?? now,
      now,
    ],
  );
}

export function getSupabaseRole(user: User) {
  const candidate = user.app_metadata?.role ?? user.app_metadata?.roles?.[0];

  if (candidate === "platform_admin" || candidate === "operator") {
    return candidate;
  }

  return null;
}

export function resetSupabaseServerClientForTests() {
  supabaseServerClient = null;
  operatorProfilePool = null;
}
