import { type User, createClient } from "@supabase/supabase-js";

import { getSupabaseRuntimeConfig } from "@/lib/infrastructure/env";

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

export function getSupabaseServerClient() {
  if (supabaseServerClient !== null) {
    return supabaseServerClient;
  }

  supabaseServerClient = createSupabaseServerClient();
  return supabaseServerClient as ReturnType<typeof createClient>;
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
}
