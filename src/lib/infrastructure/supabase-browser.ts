import { AuthError, createClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";

import {
  getSupabaseAuthRedirectUrl,
  getSupabaseAuthUiConfig,
  getSupabaseRuntimeConfig,
} from "@/lib/infrastructure/env";

/** EIP-1193 provider shape used by `@supabase/auth-js` Web3 sign-in. */
type BrowserEthereumProvider = {
  request: (args: {
    method: string;
    params?: readonly unknown[] | unknown;
  }) => Promise<unknown>;
};

export type BrowserWalletSnapshot = {
  address: string;
  chainId: number;
  chainNamespace: "eip155";
};

function getBrowserAuthRedirectUrl(path = "/operator") {
  if (typeof window !== "undefined" && window.location?.origin) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${window.location.origin}${normalizedPath}`;
  }

  return getSupabaseAuthRedirectUrl(path);
}

function inferPrimaryAuthProvider(user: User) {
  const provider =
    typeof user.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : Array.isArray(user.identities) && user.identities[0]?.provider
        ? user.identities[0].provider
        : null;

  return provider;
}

export async function ensureOperatorProfileFromSession(session: Session) {
  const client = getSupabaseBrowserClient();
  const user = session.user;
  const now = new Date().toISOString();
  const payload = {
    auth_user_id: user.id,
    role:
      user.app_metadata?.role === "platform_admin"
        ? "platform_admin"
        : "operator",
    status:
      typeof user.app_metadata?.status === "string" &&
      user.app_metadata.status.trim()
        ? user.app_metadata.status
        : "active",
    email: user.email ?? null,
    full_name:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null,
    primary_auth_provider: inferPrimaryAuthProvider(user),
    last_sign_in_at: user.last_sign_in_at ?? now,
    updated_at: now,
  };

  const { error } = await client
    .from("operator_profiles")
    .upsert(payload as never, {
      onConflict: "auth_user_id",
      ignoreDuplicates: false,
    });

  if (error) {
    throw new Error(
      error.message || "Unable to provision the operator profile.",
    );
  }
}

function resolveBrowserEthereumWallet(): BrowserEthereumProvider | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const globalWindow = window as Window & { ethereum?: unknown };
  const raw = globalWindow.ethereum;
  if (!raw) {
    return undefined;
  }

  const asProvider = (value: unknown): BrowserEthereumProvider | undefined => {
    if (
      typeof value === "object" &&
      value !== null &&
      "request" in value &&
      typeof (value as BrowserEthereumProvider).request === "function"
    ) {
      return value as BrowserEthereumProvider;
    }
    return undefined;
  };

  const single = asProvider(raw);
  if (single) {
    return single;
  }

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      const next = asProvider(entry);
      if (next) {
        return next;
      }
    }
  }

  return undefined;
}

export async function readBrowserEthereumWalletSnapshot(): Promise<BrowserWalletSnapshot> {
  const wallet = resolveBrowserEthereumWallet();
  if (!wallet) {
    throw new Error(
      "No Ethereum wallet found. Install MetaMask, Rabby, or another EIP-1193 wallet and allow it on this site.",
    );
  }

  const accounts = await wallet.request({
    method: "eth_requestAccounts",
  });
  if (!Array.isArray(accounts) || typeof accounts[0] !== "string") {
    throw new Error("The wallet did not return an address.");
  }

  const chainHex = await wallet.request({
    method: "eth_chainId",
  });
  if (typeof chainHex !== "string") {
    throw new Error("The wallet did not return a chain id.");
  }

  return {
    address: accounts[0],
    chainId: Number.parseInt(chainHex, 16),
    chainNamespace: "eip155",
  };
}

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

export async function signInOperatorWithEmailPassword(input: {
  email: string;
  password: string;
}) {
  return getSupabaseBrowserClient().auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
}

export async function signUpOperatorWithEmailPassword(input: {
  email: string;
  password: string;
  fullName?: string;
}) {
  const config = getSupabaseAuthUiConfig();
  const redirectTo = getBrowserAuthRedirectUrl("/operator");
  const fullName = input.fullName?.trim();

  const options: {
    emailRedirectTo?: string;
    data?: Record<string, string>;
  } = {};
  if (redirectTo) {
    options.emailRedirectTo = redirectTo;
  }
  if (fullName) {
    options.data = { full_name: fullName };
  }

  return getSupabaseBrowserClient().auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options,
  });
}

export async function signInOperatorWithGoogle() {
  const config = getSupabaseAuthUiConfig();
  if (!config.enableGoogleOAuth) {
    throw new Error("Google sign-in is not enabled for this environment.");
  }

  return getSupabaseBrowserClient().auth.signInWithOAuth({
    provider: "google",
    options: getBrowserAuthRedirectUrl("/operator")
      ? {
          redirectTo: getBrowserAuthRedirectUrl("/operator"),
        }
      : undefined,
  });
}

export async function signInOperatorWithWeb3() {
  const config = getSupabaseAuthUiConfig();
  if (!config.enableWeb3) {
    throw new Error("Web3 sign-in is not enabled for this environment.");
  }

  const wallet = resolveBrowserEthereumWallet();
  if (!wallet) {
    return {
      data: { session: null, user: null },
      error: new AuthError(
        "No Ethereum wallet found. Install MetaMask, Rabby, or another EIP-1193 wallet, use a normal desktop browser (not an in-app WebView), allow the extension on this site, then try again.",
      ),
    };
  }

  return getSupabaseBrowserClient().auth.signInWithWeb3({
    chain: config.web3Chain,
    statement: config.web3Statement,
    wallet: wallet as never,
  });
}
