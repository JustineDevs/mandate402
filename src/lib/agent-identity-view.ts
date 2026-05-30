import type { StatusTone } from "@/components/status-pill";
import type { Agent } from "@/lib/domain/types";
import { formatOperatorToken } from "@/lib/operator-display-labels";

export function isAgentOnchainIdentityVerified(agent: Agent) {
  return Boolean(
    agent.onchainAddress &&
      agent.walletProvider &&
      agent.chainId &&
      agent.verifiedAt,
  );
}

export function agentIdentityTone(agent: Agent): StatusTone {
  if (agent.status !== "active") {
    return "neutral";
  }

  return isAgentOnchainIdentityVerified(agent) ? "success" : "warning";
}

export function agentIdentityLabel(agent: Agent) {
  if (agent.status !== "active") {
    return "inactive";
  }

  return isAgentOnchainIdentityVerified(agent)
    ? "treasury_verified"
    : "identity_unmapped";
}

export function formatShortAddress(address: string | null | undefined) {
  if (!address) {
    return "Not bound";
  }

  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatAgentChain(agent: Agent) {
  if (!agent.chainId) {
    return "No chain";
  }

  return agent.chainId === 2910
    ? "Morph Hoodi"
    : agent.chainId === 2818
      ? "Morph Mainnet"
      : `Chain ${agent.chainId}`;
}

export function formatAgentWalletProvider(agent: Agent) {
  return agent.walletProvider
    ? formatOperatorToken(agent.walletProvider)
    : "No wallet provider";
}
