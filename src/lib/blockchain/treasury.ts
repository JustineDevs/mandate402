import type { Address } from "viem";

import {
  getMorphPublicClient,
  getMorphWalletClient,
} from "@/lib/blockchain/clients";
import { getTreasuryContract } from "@/lib/blockchain/contracts";

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

export class TreasuryEnforcementError extends Error {
  constructor(
    message = "Treasury enforcement rejected the payment attempt.",
    readonly code: string = "treasury_guard_denied",
  ) {
    super(message);
    this.name = "TreasuryEnforcementError";
  }
}

function normalizeAgentEnvKey(agentId: string) {
  return agentId
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

export function resolveAgentOnchainAddress(agentId: string) {
  const envKey = `MANDATE402_AGENT_ONCHAIN_ADDRESS_${normalizeAgentEnvKey(agentId)}`;
  const address = process.env[envKey]?.trim();
  return address?.startsWith("0x") ? (address as Address) : null;
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
  agentId: string;
  amountCents: number;
}) {
  const runtime = getTreasuryExecutionRuntimeConfig();
  if (runtime.mode !== "enabled") {
    return {
      enforced: false,
      mode: runtime.mode,
      warnings: runtime.warnings,
    };
  }

  const agentAddress = resolveAgentOnchainAddress(input.agentId);
  if (!agentAddress) {
    throw new TreasuryEnforcementError(
      `Missing on-chain treasury agent address for ${input.agentId}.`,
      "missing_agent_onchain_address",
    );
  }

  const contract = getTreasuryContract();
  if (!contract.address) {
    throw new TreasuryEnforcementError(
      "Treasury contract address is not configured.",
      "missing_treasury_address",
    );
  }

  const walletClient = getMorphWalletClient();
  const publicClient = getMorphPublicClient();

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
