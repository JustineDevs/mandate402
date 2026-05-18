export const DEMO_OPERATOR_TOKEN = "mandate402-demo-token";
export const DEFAULT_MORPH_MAINNET_RPC_URL =
  "https://rpc-quicknode.morph.network";
export const DEFAULT_MORPH_MAINNET_CHAIN_ID = 2818;
export const DEFAULT_MORPH_EXPLORER_URL = "https://explorer.morph.network";
export const DEFAULT_MORPH_X402_FACILITATOR_URL =
  "https://morph-rails.morph.network/x402";

export type AppEnv = "demo" | "production";
export type PersistenceMode = "sqlite" | "postgres";

export function getAppEnv(): AppEnv {
  const value = process.env.APP_ENV?.trim().toLowerCase();
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("APP_ENV must be explicitly set in production.");
    }

    return "demo";
  }

  if (value === "demo" || value === "production") {
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
    return "sqlite";
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

export function getSupabaseRuntimeConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY,
  };
}

export function getOperatorToken() {
  return process.env.MANDATE402_OPERATOR_TOKEN ?? DEMO_OPERATOR_TOKEN;
}

export function getMorphRuntimeConfig() {
  const chainIdValue = isProductionEnv()
    ? process.env.MORPH_CHAIN_ID
    : (process.env.MORPH_CHAIN_ID ?? String(DEFAULT_MORPH_MAINNET_CHAIN_ID));

  const rpcUrl = isProductionEnv()
    ? process.env.MORPH_RPC_URL
    : (process.env.MORPH_RPC_URL ?? DEFAULT_MORPH_MAINNET_RPC_URL);

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
  return process.env.MORPH_EXPLORER_URL ?? DEFAULT_MORPH_EXPLORER_URL;
}

export function getMorphX402FacilitatorUrl() {
  return (
    process.env.MORPH_X402_FACILITATOR_URL ?? DEFAULT_MORPH_X402_FACILITATOR_URL
  );
}

export function getPrimaryVendorEndpoint(vendorId: string) {
  const mapping: Record<string, string | undefined> = {
    "morph-market-data":
      process.env.PRIMARY_X402_VENDOR_A_URL ??
      process.env.MORPH_MARKET_DATA_URL,
    "morph-research-net":
      process.env.PRIMARY_X402_VENDOR_B_URL ??
      process.env.MORPH_RESEARCH_NET_URL,
  };

  return mapping[vendorId];
}

export function getFallbackVendorEndpoint() {
  return (
    process.env.MANDATE402_X402_DEMO_VENDOR_URL ??
    process.env.MANDATE402_DEMO_WRAPPER_URL
  );
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
      process.env.PRIMARY_X402_VENDOR_A_URL ??
        process.env.MORPH_MARKET_DATA_URL,
    ),
    "morph-research-net": appendStatusPath(
      process.env.PRIMARY_X402_VENDOR_B_URL ??
        process.env.MORPH_RESEARCH_NET_URL,
    ),
  };

  return mapping[vendorId];
}

export function getFallbackVendorStatusEndpoint() {
  return appendStatusPath(
    process.env.MANDATE402_X402_DEMO_VENDOR_URL ??
      process.env.MANDATE402_DEMO_WRAPPER_URL,
  );
}
