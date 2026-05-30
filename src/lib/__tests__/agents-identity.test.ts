import { beforeEach, describe, expect, it } from "vitest";

import {
  createTestStoreData,
  readStore,
  resetStoreForTests,
} from "@/lib/infrastructure/store";
import { bindAgentIdentity } from "@/lib/modules/agents";
import { createBrowserWalletBinding } from "@/lib/operator-wallet-sdk";

beforeEach(async () => {
  await resetStoreForTests(createTestStoreData());
});

describe("agent identity binding", () => {
  it("persists a verified external wallet identity on the agent record", async () => {
    const wallet = createBrowserWalletBinding({
      address: "0x5555555555555555555555555555555555555555",
      chainNamespace: "eip155",
      chainId: 2910,
    });

    const agent = await bindAgentIdentity({
      agentId: "agent_research_alpha",
      walletProvider: "external",
      address: wallet.address,
      chainId: wallet.chainId,
      createdByOperatorId: "operator_fixture",
      binding: wallet.binding,
      correlationId: "corr_agent_identity",
    });

    expect(agent).toMatchObject({
      id: "agent_research_alpha",
      onchainAddress: "0x5555555555555555555555555555555555555555",
      walletProvider: "external",
      chainId: 2910,
      createdByOperatorId: "operator_fixture",
    });

    const store = await readStore();
    expect(store.agents[0]).toMatchObject({
      id: "agent_research_alpha",
      onchainAddress: "0x5555555555555555555555555555555555555555",
      verifiedAt: agent.verifiedAt,
    });
    expect(store.domainEvents[0]).toMatchObject({
      entityType: "agent",
      entityId: "agent_research_alpha",
      eventType: "agent_identity_verified",
      correlationId: "corr_agent_identity",
    });
  });
});
