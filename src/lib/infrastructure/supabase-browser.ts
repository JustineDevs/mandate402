import { createClient } from "@supabase/supabase-js";

import { getSupabaseRuntimeConfig } from "@/lib/infrastructure/env";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const config = getSupabaseRuntimeConfig();
  if (!config.url || !config.anonKey) {
    throw new Error(
      "Supabase browser auth is not configured. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.",
    );
  }

  browserClient = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
