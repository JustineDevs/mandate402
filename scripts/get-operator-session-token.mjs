import { createClient } from "@supabase/supabase-js";

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

async function main() {
  const url = readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const email = readRequiredEnv("MANDATE402_OPERATOR_EMAIL");
  const password = readRequiredEnv("MANDATE402_OPERATOR_PASSWORD");

  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    throw new Error(
      error?.message || "Unable to mint an operator access token.",
    );
  }

  process.stdout.write(data.session.access_token);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
