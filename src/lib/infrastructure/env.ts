export const DEMO_OPERATOR_TOKEN = "mandate402-demo-token";
export const DEFAULT_MORPH_MAINNET_RPC_URL =
  "https://rpc-quicknode.morph.network";
export const DEFAULT_MORPH_MAINNET_CHAIN_ID = 2818;
export const DEFAULT_MORPH_EXPLORER_URL = "https://explorer.morph.network";
export const DEFAULT_MORPH_X402_FACILITATOR_URL =
  "https://morph-rails.morph.network/x402";

export function getOperatorToken() {
  return process.env.MANDATE402_OPERATOR_TOKEN ?? DEMO_OPERATOR_TOKEN;
}

export function getMorphRuntimeConfig() {
  return {
    rpcUrl: process.env.MORPH_RPC_URL ?? DEFAULT_MORPH_MAINNET_RPC_URL,
    privateKey: process.env.MORPH_PRIVATE_KEY,
    contractAddress: process.env.MANDATE_REGISTRY_ADDRESS as
      | `0x${string}`
      | undefined,
    chainId: Number(
      process.env.MORPH_CHAIN_ID ?? String(DEFAULT_MORPH_MAINNET_CHAIN_ID),
    ),
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
