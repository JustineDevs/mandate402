import type { Chain } from "viem";

import {
  getMorphExplorerUrl,
  getMorphRuntimeConfig,
  isProductionEnv,
} from "@/lib/infrastructure/env";

export type MorphNetworkKey = "morph-mainnet" | "morph-hoodi" | "custom-morph";

export type MorphNetworkManifestEntry = {
  key: MorphNetworkKey;
  label: string;
  defaultChainId: number | null;
  defaultRpcUrl: string | null;
  defaultExplorerUrl: string | null;
  environmentExpectations: string[];
};

export type ActiveMorphNetwork = MorphNetworkManifestEntry & {
  chainId: number | null;
  rpcUrl: string;
  explorerUrl: string;
  isProduction: boolean;
};

const morphNetworkManifest: Record<MorphNetworkKey, MorphNetworkManifestEntry> =
  {
    "morph-mainnet": {
      key: "morph-mainnet",
      label: "Morph Mainnet",
      defaultChainId: 2818,
      defaultRpcUrl: "https://rpc-quicknode.morph.network",
      defaultExplorerUrl: "https://explorer.morph.network",
      environmentExpectations: [
        "Suitable as the default Morph network for demo-mode runtime behavior.",
        "Requires explicit contract addresses and signer credentials before anchor writes are considered ready.",
      ],
    },
    "morph-hoodi": {
      key: "morph-hoodi",
      label: "Morph Hoodi Testnet",
      defaultChainId: null,
      defaultRpcUrl: "https://rpc-hoodi.morph.network",
      defaultExplorerUrl: "https://explorer-hoodi.morph.network",
      environmentExpectations: [
        "Set MORPH_CHAIN_ID explicitly for Hoodi deployments instead of relying on a baked-in default.",
        "Use Hoodi RPC and explorer URLs together with the intended testnet contract addresses.",
      ],
    },
    "custom-morph": {
      key: "custom-morph",
      label: "Custom Morph Network",
      defaultChainId: null,
      defaultRpcUrl: null,
      defaultExplorerUrl: null,
      environmentExpectations: [
        "Provide explicit MORPH_CHAIN_ID, MORPH_RPC_URL, and MORPH_EXPLORER_URL values.",
        "Contract addresses and treasury/oracle references must be injected explicitly.",
      ],
    },
  };

function inferMorphNetworkKey(input: {
  chainId: number | null;
  rpcUrl: string;
  explorerUrl: string;
}): MorphNetworkKey {
  const rpcUrl = input.rpcUrl.toLowerCase();
  const explorerUrl = input.explorerUrl.toLowerCase();

  if (
    rpcUrl.includes("hoodi.morph.network") ||
    explorerUrl.includes("hoodi.morph.network")
  ) {
    return "morph-hoodi";
  }

  if (
    input.chainId === 2818 ||
    rpcUrl.includes("quicknode.morph.network") ||
    explorerUrl.includes("explorer.morph.network")
  ) {
    return "morph-mainnet";
  }

  return "custom-morph";
}

export function getSupportedMorphNetworks() {
  return Object.values(morphNetworkManifest);
}

export function getActiveMorphNetwork(): ActiveMorphNetwork {
  const runtime = getMorphRuntimeConfig();
  const explorerUrl = getMorphExplorerUrl();
  const rawChainId =
    Number.isFinite(runtime.chainId) && runtime.chainId > 0
      ? runtime.chainId
      : null;
  const networkKey = inferMorphNetworkKey({
    chainId: rawChainId,
    rpcUrl: runtime.rpcUrl ?? "",
    explorerUrl,
  });
  const manifest = morphNetworkManifest[networkKey];

  return {
    ...manifest,
    chainId: rawChainId ?? manifest.defaultChainId,
    rpcUrl: runtime.rpcUrl ?? manifest.defaultRpcUrl ?? "",
    explorerUrl: explorerUrl || manifest.defaultExplorerUrl || "",
    isProduction: isProductionEnv(),
  };
}

export function createMorphChain(network = getActiveMorphNetwork()): Chain {
  if (!network.chainId || !network.rpcUrl) {
    throw new Error(
      "Morph network is not fully configured. Chain id and RPC URL are required.",
    );
  }

  return {
    id: network.chainId,
    name: network.label,
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [network.rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: `${network.label} Explorer`,
        url: network.explorerUrl || "https://explorer.morph.network",
      },
    },
  } as const satisfies Chain;
}
