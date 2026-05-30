import { ValidationError } from "@/lib/domain/errors";
import type { Agent, AgentWalletProvider } from "@/lib/domain/types";
import { nowIso } from "@/lib/infrastructure/clock";

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

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

function assertVerifiedAgentWalletBinding(input: {
  walletProvider: AgentWalletProvider;
  address: string;
  chainId: number;
  binding: PreparedOperatorWalletBinding;
}) {
  if (!EVM_ADDRESS_PATTERN.test(input.address)) {
    throw new ValidationError(
      "Agent wallet address must be a valid EVM address.",
    );
  }

  if (!Number.isInteger(input.chainId) || input.chainId <= 0) {
    throw new ValidationError(
      "Agent wallet chain id must be a positive integer.",
    );
  }

  if (
    input.binding.orchestratorAddress.toLowerCase() !==
    input.address.toLowerCase()
  ) {
    throw new ValidationError(
      "Agent wallet address must match the verified binding.",
    );
  }

  if (
    input.walletProvider === "privy" &&
    (input.binding.verificationSource !== "provider_session" ||
      !input.binding.providerWalletId ||
      input.binding.orchestratorKind !== "biconomy_nexus_7702")
  ) {
    throw new ValidationError(
      "Privy embedded agent wallets require a verified provider session and Privy wallet id.",
    );
  }

  if (
    input.walletProvider === "external" &&
    input.binding.verificationSource !== "browser_wallet" &&
    input.binding.verificationSource !== "provider_session"
  ) {
    throw new ValidationError(
      "External agent wallets require provider-session or signed browser-wallet verification.",
    );
  }

  if (
    input.walletProvider === "managed" &&
    (input.binding.orchestratorKind !== "managed_signer" ||
      input.binding.verificationSource !== "provider_session")
  ) {
    throw new ValidationError(
      "Managed agent wallets require a verified secure signer binding.",
    );
  }

  if (input.binding.status !== "verified") {
    throw new ValidationError(
      "Agent wallet binding must be verified before use.",
    );
  }
}

export function createAgentIdentityFromWalletBinding(input: {
  id: string;
  name: string;
  walletProvider: AgentWalletProvider;
  address: string;
  chainId: number;
  createdByOperatorId: string;
  binding: PreparedOperatorWalletBinding;
  now?: string;
}): Agent {
  assertVerifiedAgentWalletBinding({
    walletProvider: input.walletProvider,
    address: input.address,
    chainId: input.chainId,
    binding: input.binding,
  });

  const timestamp = input.now ?? nowIso();
  return {
    id: input.id,
    name: input.name,
    status: "active",
    onchainAddress: input.address,
    walletProvider: input.walletProvider,
    providerWalletId: input.binding.providerWalletId,
    chainId: input.chainId,
    createdByOperatorId: input.createdByOperatorId,
    verifiedAt: timestamp,
    rotatedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
