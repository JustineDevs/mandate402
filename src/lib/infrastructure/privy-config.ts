import type { PrivyClientConfig } from "@privy-io/react-auth";

import {
  DEFAULT_MORPH_EXPLORER_URL,
  DEFAULT_MORPH_MAINNET_CHAIN_ID,
  DEFAULT_MORPH_MAINNET_RPC_URL,
} from "@/lib/infrastructure/env";

const walletOnlyLoginMethods = ["wallet"] as NonNullable<
  PrivyClientConfig["loginMethods"]
>;

const morphMainnetChain = {
  id: DEFAULT_MORPH_MAINNET_CHAIN_ID,
  name: "Morph",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [DEFAULT_MORPH_MAINNET_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Morph Explorer", url: DEFAULT_MORPH_EXPLORER_URL },
  },
} as const;

/** Shared Privy config: external wallet connect only (no email/Google/embedded auto-create). */
export function getTreasuryPrivyProviderConfig() {
  return {
    loginMethods: walletOnlyLoginMethods,
    embeddedWallets: {
      showWalletUIs: false,
      ethereum: {
        createOnLogin: "off" as const,
      },
    },
    defaultChain: morphMainnetChain,
    supportedChains: [morphMainnetChain],
  };
}

export const treasuryWalletLoginOptions = {
  loginMethods: walletOnlyLoginMethods,
  walletChainType: "ethereum-only" as const,
};
