import { z } from "zod";

import type { PreparedOperatorWalletBinding } from "@/lib/agent-identity";
import { UnauthorizedError } from "@/lib/domain/errors";
import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { logEvent } from "@/lib/infrastructure/logger";
import { readCorrelationId } from "@/lib/infrastructure/observability";
import { bindAgentIdentity } from "@/lib/modules/agents";
import { requireOperator } from "@/lib/modules/auth";

const evmAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "address must be a valid EVM address.");

const agentIdentitySchema = z.object({
  walletProvider: z.enum(["privy", "external", "managed"]),
  address: evmAddress,
  chainId: z.number().int().positive(),
  providerUserId: z.string().trim().min(1).max(255).optional(),
  providerWalletId: z.string().trim().min(1).max(255).optional(),
  walletClientType: z.string().trim().min(1).max(120).optional(),
  orchestratorAddress: evmAddress.optional(),
  orchestratorKind: z.enum([
    "biconomy_nexus_7702",
    "browser_wallet",
    "managed_signer",
  ]),
  delegationContractAddress: evmAddress.optional(),
  status: z.enum(["verified", "linked_manual_review"]),
  verificationSource: z.enum(["browser_wallet", "provider_session", "manual"]),
  lastSyncError: z.string().trim().min(1).max(1000).optional(),
});

function readBearerToken(request: Request) {
  const bearer = request.headers.get("authorization");
  if (!bearer?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing bearer token.");
  }
  return bearer.slice("Bearer ".length);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  try {
    const operator = await requireOperator(request);
    readBearerToken(request);
    const correlationId = readCorrelationId(request);
    const { agentId } = await params;
    const input = agentIdentitySchema.parse(await request.json());
    const binding: PreparedOperatorWalletBinding = {
      providerUserId: input.providerUserId ?? null,
      providerWalletId: input.providerWalletId ?? null,
      walletClientType: input.walletClientType ?? null,
      orchestratorAddress: input.orchestratorAddress ?? input.address,
      orchestratorKind: input.orchestratorKind,
      delegationContractAddress: input.delegationContractAddress ?? null,
      status: input.status,
      verificationSource: input.verificationSource,
      lastSyncError: input.lastSyncError ?? null,
    };

    const agent = await bindAgentIdentity({
      agentId,
      walletProvider: input.walletProvider,
      address: input.address,
      chainId: input.chainId,
      createdByOperatorId: operator.operatorId,
      binding,
      correlationId,
    });

    logEvent("info", "api.agent.identity_bound", {
      correlationId,
      agentId,
      operatorId: operator.operatorId,
      walletProvider: input.walletProvider,
      chainId: input.chainId,
    });

    return jsonOk({ agent, correlationId });
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
