import { z } from "zod";

import { UnauthorizedError } from "@/lib/domain/errors";
import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { requireOperator } from "@/lib/modules/auth";
import {
  getOperatorAccessState,
  linkTreasuryWalletAccount,
} from "@/lib/operator-access";

const walletLinkSchema = z.object({
  provider: z.enum(["privy", "external", "turnkey"]),
  mode: z.enum(["embedded_7702", "external_fusion", "managed_signer"]),
  status: z
    .enum(["verified", "linked_manual_review", "sync_failed"])
    .optional(),
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "address must be a valid EVM address."),
  chainId: z.number().int().positive(),
  label: z.string().trim().min(1).max(120).optional(),
  verificationSource: z.enum(["manual", "browser_wallet", "provider_session"]),
  providerUserId: z.string().trim().min(1).max(255).optional(),
  providerWalletId: z.string().trim().min(1).max(255).optional(),
  walletClientType: z.string().trim().min(1).max(120).optional(),
  orchestratorAddress: z
    .string()
    .regex(
      /^0x[a-fA-F0-9]{40}$/,
      "orchestratorAddress must be a valid EVM address.",
    )
    .optional(),
  orchestratorKind: z
    .enum(["biconomy_nexus_7702", "browser_wallet", "managed_signer"])
    .optional(),
  delegationContractAddress: z
    .string()
    .regex(
      /^0x[a-fA-F0-9]{40}$/,
      "delegationContractAddress must be a valid EVM address.",
    )
    .optional(),
  lastSyncError: z.string().trim().min(1).max(1000).optional(),
});

function readBearerToken(request: Request) {
  const bearer = request.headers.get("authorization");
  if (!bearer?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing bearer token.");
  }
  return bearer.slice("Bearer ".length);
}

export async function GET(request: Request) {
  try {
    const operator = await requireOperator(request);
    const accessToken = readBearerToken(request);
    const access = await getOperatorAccessState(
      accessToken,
      operator.operatorId,
    );
    return jsonOk({ operator, access });
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const operator = await requireOperator(request);
    const accessToken = readBearerToken(request);
    const body = await request.json();
    const input = walletLinkSchema.parse(body);
    const wallet = await linkTreasuryWalletAccount({
      accessToken,
      userId: operator.operatorId,
      provider: input.provider,
      mode: input.mode,
      address: input.address,
      chainId: input.chainId,
      label: input.label,
      verificationSource: input.verificationSource,
      status: input.status,
      providerUserId: input.providerUserId,
      providerWalletId: input.providerWalletId,
      walletClientType: input.walletClientType,
      orchestratorAddress: input.orchestratorAddress,
      orchestratorKind: input.orchestratorKind,
      delegationContractAddress: input.delegationContractAddress,
      lastSyncError: input.lastSyncError,
    });
    const access = await getOperatorAccessState(
      accessToken,
      operator.operatorId,
    );
    return jsonOk({ wallet, access }, { status: 201 });
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
