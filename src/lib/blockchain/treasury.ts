import type { Address } from "viem";

import {
  getMorphPublicClient,
  getMorphWalletClient,
} from "@/lib/blockchain/clients";
import { getTreasuryContract } from "@/lib/blockchain/contracts";
import type { Agent } from "@/lib/domain/types";

export type TreasuryExecutionMode =
  | "enabled"
  | "prepared_only"
  | "not_configured";

export type TreasuryExecutionRuntimeConfig = {
  mode: TreasuryExecutionMode;
  settlementTokenAddress: Address | null;
  settlementTokenDecimals: number | null;
  facilitatorAddress: Address | null;
  warnings: string[];
};

type TreasuryExecutionClients = {
  walletClient: Pick<ReturnType<typeof getMorphWalletClient>, "writeContract">;
  publicClient: Pick<
    ReturnType<typeof getMorphPublicClient>,
    "waitForTransactionReceipt"
  >;
};

export class TreasuryEnforcementError extends Error {
  constructor(
    message = "Treasury enforcement rejected the payment attempt.",
    readonly code: string = "treasury_guard_denied",
  ) {
    super(message);
    this.name = "TreasuryEnforcementError";
  }
}

function isEvmAddress(value: string | null): value is Address {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function resolveAgentOnchainAddress(agent: Agent) {
  if (!isEvmAddress(agent.onchainAddress)) {
    return null;
  }

  if (!agent.verifiedAt || !agent.walletProvider || !agent.chainId) {
    return null;
  }

  return agent.onchainAddress;
}

export function getTreasuryExecutionRuntimeConfig(): TreasuryExecutionRuntimeConfig {
  const contract = getTreasuryContract();
  const settlementTokenAddress =
    process.env.MANDATE402_TREASURY_SETTLEMENT_TOKEN_ADDRESS?.trim();
  const facilitatorAddress =
    process.env.MANDATE402_TREASURY_FACILITATOR_ADDRESS?.trim();
  const decimalsValue =
    process.env.MANDATE402_TREASURY_SETTLEMENT_TOKEN_DECIMALS?.trim();
  const settlementTokenDecimals =
    decimalsValue && Number.isInteger(Number(decimalsValue))
      ? Number(decimalsValue)
      : settlementTokenAddress
        ? 6
        : null;

  const warnings: string[] = [];
  if (!contract.preparation.configured) {
    return {
      mode: "not_configured",
      settlementTokenAddress: null,
      settlementTokenDecimals: null,
      facilitatorAddress: null,
      warnings: [...contract.preparation.requirements],
    };
  }

  if (!settlementTokenAddress?.startsWith("0x")) {
    warnings.push(
      "MANDATE402_TREASURY_SETTLEMENT_TOKEN_ADDRESS is not configured.",
    );
  }

  if (!facilitatorAddress?.startsWith("0x")) {
    warnings.push("MANDATE402_TREASURY_FACILITATOR_ADDRESS is not configured.");
  }

  if (
    settlementTokenDecimals === null ||
    !Number.isInteger(settlementTokenDecimals) ||
    settlementTokenDecimals < 2
  ) {
    warnings.push(
      "MANDATE402_TREASURY_SETTLEMENT_TOKEN_DECIMALS must be an integer >= 2.",
    );
  }

  return {
    mode: warnings.length === 0 ? "enabled" : "prepared_only",
    settlementTokenAddress: settlementTokenAddress?.startsWith("0x")
      ? (settlementTokenAddress as Address)
      : null,
    settlementTokenDecimals:
      settlementTokenDecimals !== null &&
      Number.isInteger(settlementTokenDecimals) &&
      settlementTokenDecimals >= 2
        ? settlementTokenDecimals
        : null,
    facilitatorAddress: facilitatorAddress?.startsWith("0x")
      ? (facilitatorAddress as Address)
      : null,
    warnings,
  };
}

function centsToTokenAmount(
  amountCents: number,
  settlementTokenDecimals: number,
) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new TreasuryEnforcementError(
      "Treasury enforcement requires a positive integer amount in cents.",
      "invalid_amount_cents",
    );
  }

  return BigInt(amountCents) * 10n ** BigInt(settlementTokenDecimals - 2);
}

export async function enforceTreasuryExecution(input: {
  agent: Agent;
  amountCents: number;
  clients?: TreasuryExecutionClients;
}) {
  const runtime = getTreasuryExecutionRuntimeConfig();
  if (runtime.mode !== "enabled") {
    return {
      enforced: false,
      mode: runtime.mode,
      warnings: runtime.warnings,
    };
  }

  if (!input.agent.onchainAddress) {
    throw new TreasuryEnforcementError(
      `Missing on-chain treasury agent address for ${input.agent.id}.`,
      "missing_agent_onchain_address",
    );
  }

  if (!isEvmAddress(input.agent.onchainAddress)) {
    throw new TreasuryEnforcementError(
      `Invalid on-chain treasury agent address for ${input.agent.id}.`,
      "invalid_agent_onchain_address",
    );
  }

  const agentAddress = resolveAgentOnchainAddress(input.agent);
  if (!agentAddress) {
    throw new TreasuryEnforcementError(
      `Unverified on-chain treasury agent address for ${input.agent.id}.`,
      "unverified_agent_onchain_address",
    );
  }

  const contract = getTreasuryContract();
  if (!contract.address) {
    throw new TreasuryEnforcementError(
      "Treasury contract address is not configured.",
      "missing_treasury_address",
    );
  }

  const walletClient = input.clients?.walletClient ?? getMorphWalletClient();
  const publicClient = input.clients?.publicClient ?? getMorphPublicClient();

  try {
    const hash = await walletClient.writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "executeX402Payment",
      args: [
        agentAddress,
        runtime.settlementTokenAddress as Address,
        runtime.facilitatorAddress as Address,
        centsToTokenAmount(
          input.amountCents,
          runtime.settlementTokenDecimals as number,
        ),
      ],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return {
      enforced: true,
      mode: runtime.mode,
      txHash: hash,
    };
  } catch (error) {
    throw new TreasuryEnforcementError(
      error instanceof Error
        ? `Treasury enforcement rejected the payment attempt: ${error.message}`
        : "Treasury enforcement rejected the payment attempt.",
      "treasury_guard_denied",
    );
  }
}

export function buildAgentTreasuryGovernancePlan(input: {
  agent: Agent;
  maxUsdSpendPerWindow: bigint;
  windowDurationSeconds: bigint;
  pythPriceFeedId: `0x${string}`;
  killSwitchEnabled?: boolean;
}) {
  const runtime = getTreasuryExecutionRuntimeConfig();
  const agentAddress = resolveAgentOnchainAddress(input.agent);
  const contract = getTreasuryContract();

  if (runtime.mode !== "enabled" || !agentAddress || !contract.address) {
    return {
      ready: false as const,
      mode: runtime.mode,
      warnings: [
        ...runtime.warnings,
        ...(agentAddress ? [] : ["Agent onchain identity is not verified."]),
        ...(contract.address ? [] : ["Treasury contract address is missing."]),
      ],
    };
  }

  return {
    ready: true as const,
    mode: runtime.mode,
    contractAddress: contract.address,
    agentAddress,
    setMandate: {
      functionName: "setMandate" as const,
      args: [
        agentAddress,
        runtime.settlementTokenAddress as Address,
        input.maxUsdSpendPerWindow,
        input.windowDurationSeconds,
        input.pythPriceFeedId,
        true,
      ] as const,
    },
    setApprovedFacilitator: {
      functionName: "setApprovedFacilitator" as const,
      args: [
        agentAddress,
        runtime.facilitatorAddress as Address,
        true,
      ] as const,
    },
    setKillSwitch:
      input.killSwitchEnabled === undefined
        ? null
        : {
            functionName: "setKillSwitch" as const,
            args: [agentAddress, input.killSwitchEnabled] as const,
          },
  };
}
