import {
  DEFAULT_MORPH_EXPLORER_URL,
  DEFAULT_MORPH_MAINNET_RPC_URL,
  getBiconomyRuntimeConfig,
} from "@/lib/infrastructure/env";
import type { BrowserWalletSnapshot } from "@/lib/infrastructure/supabase-browser";
import { getDefaultMEENetworkUrl } from "@biconomy/abstractjs";
import { type ConnectedWallet, toViemAccount } from "@privy-io/react-auth";
import type { Chain } from "viem";

const MORPH_HOODI_RPC_URL = "https://rpc-hoodi.morph.network";
const MORPH_HOODI_EXPLORER_URL = "https://explorer-hoodi.morph.network";

type PrivyAuthorizationSigner = (
  input: {
    contractAddress: `0x${string}`;
    chainId?: number;
    nonce?: number;
    executor?: "self" | `0x${string}`;
  },
  options?: {
    address?: string;
  },
) => Promise<{
  address: string;
  chainId: number;
  nonce: number;
}>;

export type PreparedOperatorWalletBinding = {
  providerUserId: string | null;
  providerWalletId: string | null;
  walletClientType: string | null;
  orchestratorAddress: string;
  orchestratorKind: "biconomy_nexus_7702" | "browser_wallet" | "managed_signer";
  delegationContractAddress: string | null;
  status: "verified" | "linked_manual_review";
  verificationSource: "provider_session" | "browser_wallet" | "manual";
  lastSyncError: string | null;
};

function createMorphChainForWallet(chainId: number): Chain {
  const preset =
    chainId === 2910
      ? {
          label: "Morph Hoodi",
          rpcUrl: MORPH_HOODI_RPC_URL,
          explorerUrl: MORPH_HOODI_EXPLORER_URL,
        }
      : {
          label: "Morph Mainnet",
          rpcUrl: DEFAULT_MORPH_MAINNET_RPC_URL,
          explorerUrl: DEFAULT_MORPH_EXPLORER_URL,
        };

  return {
    id: chainId,
    name: preset.label,
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [preset.rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: `${preset.label} Explorer`,
        url: preset.explorerUrl,
      },
    },
  } as const satisfies Chain;
}

export async function preparePrivyEmbeddedWalletBinding(input: {
  chainId: number;
  providerUserId: string | null;
  wallet: ConnectedWallet;
  signAuthorization: PrivyAuthorizationSigner;
}) {
  const biconomy = getBiconomyRuntimeConfig();
  const chain = createMorphChainForWallet(input.chainId);
  const meeNodeUrl =
    biconomy.meeNodeUrlOverride ??
    getDefaultMEENetworkUrl(biconomy.useStagingNetwork);
  if (!/^https?:\/\//.test(meeNodeUrl)) {
    throw new Error("Biconomy MEE network URL is invalid.");
  }

  await input.wallet.switchChain(chain.id);
  await toViemAccount({ wallet: input.wallet });

  await input.signAuthorization({
    contractAddress: input.wallet.address as `0x${string}`,
    chainId: chain.id,
  });

  return {
    address: input.wallet.address,
    chainId: chain.id,
    binding: {
      providerUserId: input.providerUserId,
      providerWalletId: input.wallet.meta.id,
      walletClientType: input.wallet.walletClientType,
      orchestratorAddress: input.wallet.address,
      orchestratorKind: "biconomy_nexus_7702",
      delegationContractAddress: biconomy.nexusImplementationAddress,
      status: "verified",
      verificationSource: "provider_session",
      lastSyncError: null,
    } satisfies PreparedOperatorWalletBinding,
  };
}

export function createPrivyExternalWalletBinding(input: {
  wallet: ConnectedWallet;
  providerUserId: string | null;
  chainId: number;
}) {
  return {
    address: input.wallet.address,
    chainId: input.chainId,
    binding: {
      providerUserId: input.providerUserId,
      providerWalletId: input.wallet.meta.id,
      walletClientType: input.wallet.walletClientType,
      orchestratorAddress: input.wallet.address,
      orchestratorKind: "browser_wallet",
      delegationContractAddress: null,
      status: "verified",
      verificationSource: "provider_session",
      lastSyncError: null,
    } satisfies PreparedOperatorWalletBinding,
  };
}

export function createBrowserWalletBinding(snapshot: BrowserWalletSnapshot) {
  return {
    address: snapshot.address,
    chainId: snapshot.chainId,
    binding: {
      providerUserId: null,
      providerWalletId: null,
      walletClientType: "browser_eip1193",
      orchestratorAddress: snapshot.address,
      orchestratorKind: "browser_wallet",
      delegationContractAddress: null,
      status: "verified",
      verificationSource: "browser_wallet",
      lastSyncError: null,
    } satisfies PreparedOperatorWalletBinding,
  };
}

export function createManagedSignerBinding(address: string) {
  return {
    binding: {
      providerUserId: null,
      providerWalletId: null,
      walletClientType: "managed_signer",
      orchestratorAddress: address,
      orchestratorKind: "managed_signer",
      delegationContractAddress: null,
      status: "linked_manual_review",
      verificationSource: "manual",
      lastSyncError: null,
    } satisfies PreparedOperatorWalletBinding,
  };
}
