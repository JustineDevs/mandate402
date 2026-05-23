import { getMorphPublicClient, hasMorphSigner } from "@/lib/blockchain/clients";
import { getMorphContractManifest } from "@/lib/blockchain/contracts";
import { getActiveMorphNetwork } from "@/lib/blockchain/networks";
import {
  getTreasuryExecutionRuntimeConfig,
  resolveAgentOnchainAddress,
} from "@/lib/blockchain/treasury";
import { isProductionEnv } from "@/lib/infrastructure/env";

export type BlockchainRuntimeHealth = {
  status: "ready" | "degraded";
  network: {
    key: string;
    label: string;
    chainId: number | null;
    rpcUrl: string;
    explorerUrl: string;
    environmentExpectations: string[];
  };
  contracts: {
    mandateRegistryAddress: string | null;
    treasuryAddress: string | null;
    pythOracleAddress: string | null;
  };
  rpcConfigured: boolean;
  rpcProbeAttempted: boolean;
  rpcReachable: boolean | null;
  configuredChainId: number | null;
  observedChainId: number | null;
  chainIdMatches: boolean | null;
  lastObservedBlock: string | null;
  signerReady: boolean;
  anchoringReady: boolean;
  treasuryPrepared: boolean;
  treasuryEnforcementMode: "enabled" | "prepared_only" | "not_configured";
  treasuryAgentMappings: {
    mapped: string[];
    unmapped: string[];
  };
  warnings: string[];
};

function isValidChainId(chainId: number | null) {
  return chainId !== null && Number.isFinite(chainId) && chainId > 0;
}

export async function getBlockchainRuntimeHealth(
  agentIds: string[] = [],
): Promise<BlockchainRuntimeHealth> {
  const network = getActiveMorphNetwork();
  const contracts = getMorphContractManifest();
  const treasuryRuntime = getTreasuryExecutionRuntimeConfig();
  const signerReady = hasMorphSigner();
  const rpcConfigured = Boolean(network.rpcUrl);
  const configuredChainId = isValidChainId(network.chainId)
    ? network.chainId
    : null;
  const warnings: string[] = [];

  const anchoringReady =
    rpcConfigured &&
    configuredChainId !== null &&
    signerReady &&
    contracts.mandateRegistry.configured;
  const treasuryPrepared = contracts.treasury.preparation.configured;
  const mappedAgents = agentIds.filter((agentId) =>
    Boolean(resolveAgentOnchainAddress(agentId)),
  );
  const unmappedAgents = agentIds.filter(
    (agentId) => !resolveAgentOnchainAddress(agentId),
  );

  let rpcProbeAttempted = false;
  let rpcReachable: boolean | null = null;
  let observedChainId: number | null = null;
  let chainIdMatches: boolean | null = null;
  let lastObservedBlock: string | null = null;

  if (isProductionEnv() && rpcConfigured && configuredChainId !== null) {
    rpcProbeAttempted = true;
    try {
      const client = getMorphPublicClient();
      const [chainId, blockNumber] = await Promise.all([
        client.getChainId(),
        client.getBlockNumber(),
      ]);

      rpcReachable = true;
      observedChainId = chainId;
      chainIdMatches = chainId === configuredChainId;
      lastObservedBlock = blockNumber.toString();
    } catch (error) {
      rpcReachable = false;
      warnings.push(
        error instanceof Error
          ? `RPC probe failed: ${error.message}`
          : "RPC probe failed.",
      );
    }
  }

  if (!contracts.mandateRegistry.configured) {
    warnings.push("MANDATE_REGISTRY_ADDRESS is not configured.");
  }

  if (!treasuryPrepared) {
    warnings.push(
      "Treasury enforcement is wired, but the full runtime settlement configuration is still incomplete.",
    );
  }
  warnings.push(...treasuryRuntime.warnings);

  if (treasuryRuntime.mode === "enabled" && unmappedAgents.length > 0) {
    warnings.push(
      `Treasury enforcement is enabled but some agents are missing on-chain addresses: ${unmappedAgents.join(", ")}.`,
    );
  }

  if (!signerReady) {
    warnings.push(
      "MORPH_PRIVATE_KEY is not configured for signer-backed writes.",
    );
  }

  if (configuredChainId === null) {
    warnings.push("Morph chain id is not valid.");
  }

  const status: BlockchainRuntimeHealth["status"] =
    isProductionEnv() &&
    rpcConfigured &&
    rpcReachable !== false &&
    configuredChainId !== null &&
    chainIdMatches !== false &&
    contracts.mandateRegistry.configured &&
    signerReady
      ? "ready"
      : "degraded";

  return {
    status,
    network: {
      key: network.key,
      label: network.label,
      chainId: configuredChainId,
      rpcUrl: network.rpcUrl,
      explorerUrl: network.explorerUrl,
      environmentExpectations: network.environmentExpectations,
    },
    contracts: {
      mandateRegistryAddress: contracts.mandateRegistry.address,
      treasuryAddress: contracts.treasury.address,
      pythOracleAddress: contracts.oracle.pythAddress,
    },
    rpcConfigured,
    rpcProbeAttempted,
    rpcReachable,
    configuredChainId,
    observedChainId,
    chainIdMatches,
    lastObservedBlock,
    signerReady,
    anchoringReady,
    treasuryPrepared,
    treasuryEnforcementMode:
      treasuryRuntime.mode === "enabled" && unmappedAgents.length === 0
        ? "enabled"
        : treasuryRuntime.mode,
    treasuryAgentMappings: {
      mapped: mappedAgents,
      unmapped: unmappedAgents,
    },
    warnings,
  };
}
