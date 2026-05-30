import { describe, expect, it } from "vitest";

import {
  createAgentIdentityFromWalletBinding,
  createBrowserWalletBinding,
  createManagedSignerBinding,
} from "@/lib/operator-wallet-sdk";

describe("operator wallet agent identity binding", () => {
  it("creates a verified external agent identity from a signed browser wallet", () => {
    const wallet = createBrowserWalletBinding({
      address: "0x5555555555555555555555555555555555555555",
      chainNamespace: "eip155",
      chainId: 2910,
    });

    const agent = createAgentIdentityFromWalletBinding({
      id: "agent_research_alpha",
      name: "Research Alpha",
      walletProvider: "external",
      address: wallet.address,
      chainId: wallet.chainId,
      createdByOperatorId: "operator_fixture",
      binding: wallet.binding,
      now: "2026-05-30T00:00:00.000Z",
    });

    expect(agent).toMatchObject({
      id: "agent_research_alpha",
      onchainAddress: "0x5555555555555555555555555555555555555555",
      walletProvider: "external",
      chainId: 2910,
      createdByOperatorId: "operator_fixture",
      verifiedAt: "2026-05-30T00:00:00.000Z",
    });
  });

  it("does not treat manually linked managed signer bindings as verified agent identity", () => {
    const managed = createManagedSignerBinding(
      "0x5555555555555555555555555555555555555555",
    );

    expect(() =>
      createAgentIdentityFromWalletBinding({
        id: "agent_research_alpha",
        name: "Research Alpha",
        walletProvider: "managed",
        address: "0x5555555555555555555555555555555555555555",
        chainId: 2910,
        createdByOperatorId: "operator_fixture",
        binding: managed.binding,
      }),
    ).toThrow(
      "Managed agent wallets require a verified secure signer binding.",
    );
  });
});
