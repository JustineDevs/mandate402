import { describe, expect, it } from "vitest";

import {
  agentIdentityLabel,
  agentIdentityTone,
  formatAgentChain,
  formatShortAddress,
  isAgentOnchainIdentityVerified,
} from "@/lib/agent-identity-view";
import type { Agent } from "@/lib/domain/types";

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent_research_alpha",
    name: "Research Alpha",
    status: "active",
    onchainAddress: null,
    walletProvider: null,
    providerWalletId: null,
    chainId: null,
    createdByOperatorId: null,
    verifiedAt: null,
    rotatedAt: null,
    createdAt: "2026-05-30T00:00:00.000Z",
    updatedAt: "2026-05-30T00:00:00.000Z",
    ...overrides,
  };
}

describe("agent identity view helpers", () => {
  it("marks an agent unmapped until all on-chain identity fields are present", () => {
    const agent = makeAgent({
      onchainAddress: "0x5555555555555555555555555555555555555555",
      walletProvider: "external",
    });

    expect(isAgentOnchainIdentityVerified(agent)).toBe(false);
    expect(agentIdentityLabel(agent)).toBe("identity_unmapped");
    expect(agentIdentityTone(agent)).toBe("warning");
  });

  it("marks a fully bound agent as treasury verified", () => {
    const agent = makeAgent({
      onchainAddress: "0x5555555555555555555555555555555555555555",
      walletProvider: "external",
      chainId: 2910,
      verifiedAt: "2026-05-30T00:00:00.000Z",
    });

    expect(isAgentOnchainIdentityVerified(agent)).toBe(true);
    expect(agentIdentityLabel(agent)).toBe("treasury_verified");
    expect(agentIdentityTone(agent)).toBe("success");
    expect(formatShortAddress(agent.onchainAddress)).toBe("0x5555…5555");
    expect(formatAgentChain(agent)).toBe("Morph Hoodi");
  });
});
