export const DEFAULT_MORPH_MAINNET_RPC_URL =
  "https://rpc-quicknode.morph.network";
export const DEFAULT_MORPH_MAINNET_CHAIN_ID = 2818;
export const DEFAULT_MORPH_EXPLORER_URL = "https://explorer.morph.network";
export const DEFAULT_MORPH_X402_FACILITATOR_URL =
  "https://morph-rails.morph.network/x402";

export type AppEnv = "test" | "production";
export type PersistenceMode = "sqlite" | "postgres";
export type SupabaseWeb3Chain = "ethereum";

function isPlaceholderAppHost(value: string) {
  const placeholderHost = "your-app.example.com";

  try {
    const withScheme = value.includes("://") ? value : `https://${value}`;
    const hostname = new URL(withScheme).hostname.toLowerCase();
    return hostname === placeholderHost;
  } catch {
    return value.toLowerCase() === placeholderHost;
  }
}

function readOptionalEnv(value: string | undefined) {
  const normalized = value?.trim();
  if (
    !normalized ||
    normalized === "replace-me" ||
    normalized === "0xreplace_me" ||
    normalized === "your-project.supabase.co" ||
    isPlaceholderAppHost(normalized)
  ) {
    return undefined;
  }
  return normalized;
}

function isLoopbackUrl(value: string) {
  try {
    const parsed = new URL(value.includes("://") ? value : `https://${value}`);
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
    );
  } catch {
    return false;
  }
}

function isProductionLikeRuntime() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.APP_ENV?.trim().toLowerCase() === "production"
  );
}

function assertNotProductionLoopbackUrl(value: string, label: string) {
  if (isProductionLikeRuntime() && isLoopbackUrl(value)) {
    throw new Error(
      `${label} must not point at localhost in production. Configure the deployed application origin instead.`,
    );
  }
}

export function isTestRuntime() {
  return process.env.VITEST === "true" || process.env.NODE_ENV === "test";
}

export function getAppEnv(): AppEnv {
  if (typeof window !== "undefined") {
    throw new Error(
      "APP_ENV is server-only. Browser chrome reads environment from GET /api/console/runtime.",
    );
  }

  const value = process.env.APP_ENV?.trim().toLowerCase();

  if (!value) {
    if (isTestRuntime()) {
      return "test";
    }

    throw new Error("APP_ENV must be explicitly set.");
  }

  if (value === "test" || value === "production") {
    return value;
  }

  throw new Error(`Unsupported APP_ENV: ${process.env.APP_ENV}`);
}

export function isProductionEnv() {
  return getAppEnv() === "production";
}

/** True when primary vendors may point at localhost (Next dev / explicit opt-in). */
export function isLocalVendorRehearsalAllowed() {
  if (
    process.env.MANDATE402_ALLOW_LOCAL_VENDORS?.trim().toLowerCase() === "true"
  ) {
    return true;
  }

  return process.env.NODE_ENV === "development";
}

/** True when the app is running on a deployed production host (e.g. Vercel). */
export function isDeployedProductionRuntime() {
  return isProductionEnv() && process.env.VERCEL === "1";
}

export function getPersistenceMode(): PersistenceMode {
  const value = process.env.MANDATE402_PERSISTENCE_MODE?.trim().toLowerCase();
  if (!value) {
    return isProductionEnv() ? "postgres" : "sqlite";
  }

  if (value === "sqlite" || value === "postgres") {
    return value;
  }

  throw new Error(
    `Unsupported MANDATE402_PERSISTENCE_MODE: ${process.env.MANDATE402_PERSISTENCE_MODE}`,
  );
}

export function getDatabaseUrl() {
  return process.env.MANDATE402_DATABASE_URL ?? process.env.DATABASE_URL;
}

export function getDatabaseDirectUrl() {
  return (
    process.env.MANDATE402_DATABASE_DIRECT_URL ??
    process.env.DATABASE_DIRECT_URL ??
    getDatabaseUrl()
  );
}

export function getWorkerToken() {
  const token = process.env.MANDATE402_WORKER_TOKEN?.trim();
  return token || undefined;
}

export function getWorkerControlApiUrl() {
  return (
    readOptionalEnv(process.env.MANDATE402_CONTROL_API_URL) ??
    readOptionalEnv(process.env.MANDATE402_WORKER_CONTROL_URL)
  );
}

export type WorkerQueueRuntimeConfig = {
  maxRetries: number;
  retryDelaySeconds: number;
  dlqConfigured: boolean;
};

export function getWorkerQueueRuntimeConfig(): WorkerQueueRuntimeConfig {
  const maxRetries = Number.parseInt(
    process.env.MANDATE402_WORKER_MAX_RETRIES ?? "3",
    10,
  );
  const retryDelaySeconds = Number.parseInt(
    process.env.MANDATE402_WORKER_RETRY_DELAY_SECONDS ?? "30",
    10,
  );

  return {
    maxRetries: Number.isFinite(maxRetries) ? maxRetries : 3,
    retryDelaySeconds: Number.isFinite(retryDelaySeconds)
      ? retryDelaySeconds
      : 30,
    dlqConfigured: readBooleanEnv(
      process.env.MANDATE402_WORKER_DLQ_CONFIGURED,
      isTestRuntime(),
    ),
  };
}

export function getSupabaseRuntimeConfig() {
  const url = readOptionalEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  );
  const anonKey = readOptionalEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
  );

  if (!url || !anonKey) {
    if (!isProductionEnv()) {
      return {
        url: url ?? "http://localhost:54321",
        anonKey: anonKey ?? "local-dev-mock-key",
      };
    }
  }

  return {
    url,
    anonKey,
  };
}

function readBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }

  throw new Error(`Unsupported boolean env value: ${value}`);
}

export function getMandate402SiteUrl() {
  const siteUrl = readOptionalEnv(
    process.env.MANDATE402_SITE_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.SITE_URL,
  );

  const normalized = siteUrl?.replace(/\/$/, "") || undefined;
  if (normalized) {
    assertNotProductionLoopbackUrl(normalized, "MANDATE402_SITE_URL");
  }

  return normalized;
}

export function getSupabaseAuthRedirectUrl(path = "/operator") {
  const explicit =
    process.env.NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL ??
    process.env.MANDATE402_SUPABASE_AUTH_REDIRECT_URL;
  const explicitValue = explicit?.trim();
  if (explicitValue) {
    try {
      const explicitUrl = new URL(explicitValue);
      const supabaseUrl = readOptionalEnv(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
      );

      if (
        supabaseUrl &&
        explicitUrl.origin === new URL(supabaseUrl).origin &&
        explicitUrl.pathname.startsWith("/auth/v1/")
      ) {
        // This is a Supabase auth endpoint, not the application callback route.
        // Ignore it and fall back to the application site URL.
      } else {
        assertNotProductionLoopbackUrl(
          explicitUrl.toString(),
          "Supabase auth redirect URL",
        );
        return explicitUrl.toString();
      }
    } catch {
      assertNotProductionLoopbackUrl(
        explicitValue,
        "Supabase auth redirect URL",
      );
      return explicitValue;
    }
  }

  const siteUrl = getMandate402SiteUrl();
  if (!siteUrl) {
    return undefined;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getSupabaseAuthUiConfig() {
  const web3ChainValue =
    process.env.NEXT_PUBLIC_SUPABASE_WEB3_CHAIN?.trim().toLowerCase() ??
    "ethereum";
  if (web3ChainValue !== "ethereum") {
    throw new Error(
      `Unsupported NEXT_PUBLIC_SUPABASE_WEB3_CHAIN: ${process.env.NEXT_PUBLIC_SUPABASE_WEB3_CHAIN}`,
    );
  }

  return {
    enableEmailPassword: readBooleanEnv(
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_ENABLE_EMAIL,
      true,
    ),
    enableGoogleOAuth: readBooleanEnv(
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_ENABLE_GOOGLE,
      false,
    ),
    enableWeb3: readBooleanEnv(
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_ENABLE_WEB3,
      false,
    ),
    redirectUrl: getSupabaseAuthRedirectUrl(),
    siteUrl: getMandate402SiteUrl(),
    web3Chain: web3ChainValue as SupabaseWeb3Chain,
    web3Statement:
      process.env.NEXT_PUBLIC_SUPABASE_WEB3_STATEMENT?.trim() ||
      "I authorize Mandate402 to open the protected operator workspace.",
  };
}

export function getPrivyRuntimeConfig() {
  const appId = readOptionalEnv(process.env.NEXT_PUBLIC_PRIVY_APP_ID);
  const clientId = readOptionalEnv(process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID);

  return {
    appId,
    clientId,
    enabled: Boolean(appId),
  };
}

export function getBiconomyRuntimeConfig() {
  const apiKey = readOptionalEnv(process.env.NEXT_PUBLIC_BICONOMY_API_KEY);
  const chainIdValue = readOptionalEnv(
    process.env.NEXT_PUBLIC_BICONOMY_DEFAULT_CHAIN_ID ??
      process.env.MORPH_CHAIN_ID,
  );
  const rawNexusImplementation = readOptionalEnv(
    process.env.NEXT_PUBLIC_BICONOMY_NEXUS_IMPLEMENTATION_ADDRESS,
  );
  const nexusImplementationAddress =
    rawNexusImplementation && /^0x[a-fA-F0-9]{40}$/.test(rawNexusImplementation)
      ? (rawNexusImplementation as `0x${string}`)
      : ("0x000000004F43C49e93C970E84001853a70923B03" as const);

  return {
    apiKey,
    supertransactionApiBaseUrl:
      readOptionalEnv(process.env.NEXT_PUBLIC_BICONOMY_API_BASE_URL) ??
      "https://api.biconomy.io",
    meeNodeUrlOverride: readOptionalEnv(
      process.env.NEXT_PUBLIC_BICONOMY_MEE_URL,
    ),
    useStagingNetwork: readBooleanEnv(
      process.env.NEXT_PUBLIC_BICONOMY_STAGING,
      false,
    ),
    defaultChainId: Number(chainIdValue ?? DEFAULT_MORPH_MAINNET_CHAIN_ID),
    nexusImplementationAddress,
  };
}

export function getMorphRuntimeConfig() {
  const chainIdValue =
    process.env.MORPH_CHAIN_ID ??
    (isTestRuntime() ? String(DEFAULT_MORPH_MAINNET_CHAIN_ID) : undefined);

  const rpcUrl =
    process.env.MORPH_RPC_URL ??
    (isTestRuntime() ? DEFAULT_MORPH_MAINNET_RPC_URL : undefined);

  return {
    rpcUrl,
    privateKey: readOptionalEnv(process.env.MORPH_PRIVATE_KEY),
    contractAddress: readOptionalEnv(process.env.MANDATE_REGISTRY_ADDRESS) as
      | `0x${string}`
      | undefined,
    chainId: Number(chainIdValue),
  };
}

export function assertProductionMorphAnchoringConfig() {
  const config = getMorphRuntimeConfig();
  const missingConfig =
    !config.rpcUrl ||
    !config.privateKey ||
    !config.contractAddress ||
    !Number.isFinite(config.chainId) ||
    config.chainId <= 0;

  if (missingConfig && isProductionEnv()) {
    throw new Error(
      "Morph anchoring is not fully configured for production mode.",
    );
  }

  return {
    config,
    missingConfig,
  };
}

export function getMorphExplorerUrl() {
  const explorerUrl =
    process.env.MORPH_EXPLORER_URL ??
    (isTestRuntime() ? DEFAULT_MORPH_EXPLORER_URL : undefined);
  return explorerUrl ?? "";
}

export function getMorphX402FacilitatorUrl() {
  return (
    process.env.MORPH_X402_FACILITATOR_URL ??
    (isTestRuntime() ? DEFAULT_MORPH_X402_FACILITATOR_URL : undefined) ??
    ""
  );
}

export function getPrimaryVendorEndpoint(vendorId: string) {
  const mapping: Record<string, string | undefined> = {
    "morph-market-data": readOptionalEnv(process.env.PRIMARY_X402_VENDOR_A_URL),
    "morph-research-net": readOptionalEnv(
      process.env.PRIMARY_X402_VENDOR_B_URL,
    ),
  };

  return mapping[vendorId];
}

export function getFallbackVendorEndpoint() {
  return undefined;
}

function appendStatusPath(endpoint: string | undefined) {
  if (!endpoint) {
    return undefined;
  }

  return `${endpoint.replace(/\/$/, "")}/status`;
}

export function getPrimaryVendorStatusEndpoint(vendorId: string) {
  const mapping: Record<string, string | undefined> = {
    "morph-market-data": appendStatusPath(
      readOptionalEnv(process.env.PRIMARY_X402_VENDOR_A_URL),
    ),
    "morph-research-net": appendStatusPath(
      readOptionalEnv(process.env.PRIMARY_X402_VENDOR_B_URL),
    ),
  };

  return mapping[vendorId];
}

export function getFallbackVendorStatusEndpoint() {
  return undefined;
}

export function getVendorStatusToken() {
  const token = process.env.MANDATE402_STATUS_TOKEN?.trim();
  return token || undefined;
}

export type VendorRuntimeEndpointSummary = {
  id: string;
  endpoint: string | undefined;
  statusEndpoint: string | undefined;
  configured: boolean;
  localOnly: boolean;
};

function isLocalEndpoint(endpoint: string | undefined) {
  if (!endpoint) {
    return false;
  }

  return /127\.0\.0\.1|localhost/i.test(endpoint);
}

export function getVendorRuntimeEndpointSummary(): VendorRuntimeEndpointSummary[] {
  return [
    {
      id: "morph-market-data",
      endpoint: getPrimaryVendorEndpoint("morph-market-data"),
      statusEndpoint: getPrimaryVendorStatusEndpoint("morph-market-data"),
      configured: Boolean(getPrimaryVendorEndpoint("morph-market-data")),
      localOnly: isLocalEndpoint(getPrimaryVendorEndpoint("morph-market-data")),
    },
    {
      id: "morph-research-net",
      endpoint: getPrimaryVendorEndpoint("morph-research-net"),
      statusEndpoint: getPrimaryVendorStatusEndpoint("morph-research-net"),
      configured: Boolean(getPrimaryVendorEndpoint("morph-research-net")),
      localOnly: isLocalEndpoint(
        getPrimaryVendorEndpoint("morph-research-net"),
      ),
    },
  ];
}
