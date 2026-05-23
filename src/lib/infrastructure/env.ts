export const DEMO_OPERATOR_TOKEN = "mandate402-demo-token";
export const DEFAULT_MORPH_MAINNET_RPC_URL =
  "https://rpc-quicknode.morph.network";
export const DEFAULT_MORPH_MAINNET_CHAIN_ID = 2818;
export const DEFAULT_MORPH_EXPLORER_URL = "https://explorer.morph.network";
export const DEFAULT_MORPH_X402_FACILITATOR_URL =
  "https://morph-rails.morph.network/x402";

export type AppEnv = "test" | "production";
export type PersistenceMode = "sqlite" | "postgres";

export function isTestRuntime() {
  return process.env.VITEST === "true" || process.env.NODE_ENV === "test";
}

export function getAppEnv(): AppEnv {
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

export function getPersistenceMode(): PersistenceMode {
  const value = process.env.MANDATE402_PERSISTENCE_MODE?.trim().toLowerCase();
  if (!value) {
    return isTestRuntime() ? "sqlite" : "postgres";
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

export function getOperatorToken() {
  return process.env.MANDATE402_OPERATOR_TOKEN ?? DEMO_OPERATOR_TOKEN;
}

export function getSupabaseRuntimeConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY,
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
    privateKey: process.env.MORPH_PRIVATE_KEY,
    contractAddress: process.env.MANDATE_REGISTRY_ADDRESS as
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
    "morph-market-data": process.env.PRIMARY_X402_VENDOR_A_URL,
    "morph-research-net": process.env.PRIMARY_X402_VENDOR_B_URL,
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
      process.env.PRIMARY_X402_VENDOR_A_URL,
    ),
    "morph-research-net": appendStatusPath(
      process.env.PRIMARY_X402_VENDOR_B_URL,
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
