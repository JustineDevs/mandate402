import { isAddress } from "viem";
import type { Address } from "viem";

import { mandateRegistryAbi } from "@/lib/blockchain/abis/mandate-registry";
import { mandate402TreasuryAbi } from "@/lib/blockchain/abis/mandate402-treasury";
import {
  type MorphNetworkKey,
  getActiveMorphNetwork,
} from "@/lib/blockchain/networks";

type KnownNetworkContractDefaults = {
  mandateRegistryAddress?: Address;
  treasuryAddress?: Address;
  pythOracleAddress?: Address;
  ethUsdFeedId?: `0x${string}`;
  usdcUsdFeedId?: `0x${string}`;
};

type ContractAddressSource = "env" | "network-default" | "missing";

export type BlockchainContractDescriptor<TAbi> = {
  name: string;
  address: Address | null;
  abi: TAbi;
  configured: boolean;
  source: ContractAddressSource;
};

export type TreasuryPreparation = {
  configured: boolean;
  enforcementMode: "prepared_only" | "not_configured";
  requirements: string[];
};

export type MorphContractManifest = {
  networkKey: MorphNetworkKey;
  mandateRegistry: BlockchainContractDescriptor<typeof mandateRegistryAbi>;
  treasury: BlockchainContractDescriptor<typeof mandate402TreasuryAbi> & {
    preparation: TreasuryPreparation;
  };
  oracle: {
    pythAddress: Address | null;
    ethUsdFeedId: `0x${string}` | null;
    usdcUsdFeedId: `0x${string}` | null;
  };
};

const knownDefaultsByNetwork: Partial<
  Record<MorphNetworkKey, KnownNetworkContractDefaults>
> = {
  "morph-hoodi": {
    treasuryAddress: "0xD08301fEAc731dDe33b81059A59A69c1A1B5DD60",
    pythOracleAddress: "0xA2aa501b1a2434E0341E02FdD29810850D2434E0",
    ethUsdFeedId:
      "0xff61491a931112ddf1bd8147cd1b641375f79f582bb9473d47a502f86ef44195",
    usdcUsdFeedId:
      "0xeaa020c61cc479712813461ce153894b96a6c00b21ed0cfc2798d1f9a9e9c94a",
  },
};

function readAddress(
  envValue: string | undefined,
  fallback: Address | undefined,
): { address: Address | null; source: ContractAddressSource } {
  const normalizedEnvValue = envValue?.trim();
  if (normalizedEnvValue) {
    if (!isAddress(normalizedEnvValue)) {
      return { address: null, source: "missing" };
    }

    return { address: normalizedEnvValue, source: "env" };
  }

  if (fallback) {
    return { address: fallback, source: "network-default" };
  }

  return { address: null, source: "missing" };
}

function readFeedId(
  envValue: string | undefined,
  fallback: `0x${string}` | undefined,
) {
  const normalizedEnvValue = envValue?.trim();
  if (normalizedEnvValue?.startsWith("0x")) {
    return normalizedEnvValue as `0x${string}`;
  }

  return fallback ?? null;
}

export function getMorphContractManifest(): MorphContractManifest {
  const network = getActiveMorphNetwork();
  const defaults = knownDefaultsByNetwork[network.key] ?? {};
  const mandateRegistry = readAddress(
    process.env.MANDATE_REGISTRY_ADDRESS,
    defaults.mandateRegistryAddress,
  );
  const treasury = readAddress(
    process.env.MANDATE402_TREASURY_ADDRESS,
    defaults.treasuryAddress,
  );
  const pyth = readAddress(
    process.env.MANDATE402_PYTH_ORACLE_ADDRESS,
    defaults.pythOracleAddress,
  );
  const ethUsdFeedId = readFeedId(
    process.env.MANDATE402_PYTH_ETH_USD_FEED_ID,
    defaults.ethUsdFeedId,
  );
  const usdcUsdFeedId = readFeedId(
    process.env.MANDATE402_PYTH_USDC_USD_FEED_ID,
    defaults.usdcUsdFeedId,
  );

  const treasuryPreparation: TreasuryPreparation = {
    configured:
      Boolean(treasury.address) &&
      Boolean(pyth.address) &&
      Boolean(ethUsdFeedId) &&
      Boolean(usdcUsdFeedId),
    enforcementMode:
      treasury.address && pyth.address ? "prepared_only" : "not_configured",
    requirements: [
      "Treasury address must be configured.",
      "Pyth oracle address must be configured.",
      "ETH/USD and USDC/USD Pyth feed IDs must be configured.",
      "The Next.js attempt path is not yet invoking treasury enforcement on every payment attempt.",
    ],
  };

  return {
    networkKey: network.key,
    mandateRegistry: {
      name: "MandateRegistry",
      address: mandateRegistry.address,
      abi: mandateRegistryAbi,
      configured: Boolean(mandateRegistry.address),
      source: mandateRegistry.source,
    },
    treasury: {
      name: "Mandate402Treasury",
      address: treasury.address,
      abi: mandate402TreasuryAbi,
      configured: Boolean(treasury.address),
      source: treasury.source,
      preparation: treasuryPreparation,
    },
    oracle: {
      pythAddress: pyth.address,
      ethUsdFeedId,
      usdcUsdFeedId,
    },
  };
}

export function getMandateRegistryContract() {
  return getMorphContractManifest().mandateRegistry;
}

export function getTreasuryContract() {
  return getMorphContractManifest().treasury;
}
