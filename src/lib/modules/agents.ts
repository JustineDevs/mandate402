import {
  type PreparedOperatorWalletBinding,
  createAgentIdentityFromWalletBinding,
} from "@/lib/agent-identity";
import { ValidationError } from "@/lib/domain/errors";
import type {
  Agent,
  AgentWalletProvider,
  DomainEvent,
} from "@/lib/domain/types";
import { createId } from "@/lib/infrastructure/id";
import { withStoreLock } from "@/lib/infrastructure/store";

export type BindAgentIdentityInput = {
  agentId: string;
  walletProvider: AgentWalletProvider;
  address: string;
  chainId: number;
  createdByOperatorId: string;
  binding: PreparedOperatorWalletBinding;
  correlationId?: string | null;
};

function makeAgentEvent(input: {
  agent: Agent;
  previousAddress: string | null;
  correlationId?: string | null;
}): DomainEvent {
  return {
    id: createId("evt"),
    entityType: "agent",
    entityId: input.agent.id,
    eventType: input.previousAddress
      ? "agent_identity_rotated"
      : "agent_identity_verified",
    correlationId: input.correlationId ?? null,
    occurredAt: input.agent.updatedAt,
    metadata: {
      walletProvider: input.agent.walletProvider,
      chainId: input.agent.chainId,
      onchainAddress: input.agent.onchainAddress,
      previousAddress: input.previousAddress,
    },
  };
}

export async function bindAgentIdentity(input: BindAgentIdentityInput) {
  return withStoreLock(async (data) => {
    const agentIndex = data.agents.findIndex(
      (agent) => agent.id === input.agentId,
    );
    const existingAgent = data.agents[agentIndex];
    if (!existingAgent || existingAgent.status !== "active") {
      throw new ValidationError(
        "Agent must exist and be active before binding identity.",
      );
    }

    const nextAgent = createAgentIdentityFromWalletBinding({
      id: existingAgent.id,
      name: existingAgent.name,
      walletProvider: input.walletProvider,
      address: input.address,
      chainId: input.chainId,
      createdByOperatorId: input.createdByOperatorId,
      binding: input.binding,
    });
    const previousAddress = existingAgent.onchainAddress;
    const addressRotated =
      previousAddress !== null &&
      previousAddress.toLowerCase() !== nextAgent.onchainAddress?.toLowerCase();

    nextAgent.createdAt = existingAgent.createdAt;
    nextAgent.rotatedAt = addressRotated
      ? nextAgent.updatedAt
      : existingAgent.rotatedAt;

    data.agents[agentIndex] = nextAgent;
    data.domainEvents.unshift(
      makeAgentEvent({
        agent: nextAgent,
        previousAddress,
        correlationId: input.correlationId,
      }),
    );

    return nextAgent;
  });
}
