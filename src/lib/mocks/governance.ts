import type {
  FacilitatorRegistration,
  GovernanceFacilitator,
  SlashingProposal,
} from "@/lib/domain/types";
import { createId } from "@/lib/infrastructure/id";

/**
 * Mock data and services for Governance actions to unblock Transactional UI development.
 * This simulates the backend facilitator registry (Issue #51).
 */

const MOCK_FACILITATORS: GovernanceFacilitator[] = [
  {
    id: createId("fac"),
    name: "Morph Primary Facilitator",
    address: "0x867a2e06e2ecbcc4d4aacc2f92353e51c0c8305f",
    endpoint: "https://morph-rails.morph.network/x402",
    stakeCents: 10000000, // $10,000
    status: "active",
    riskScore: 5,
  },
  {
    id: createId("fac"),
    name: "LIFI Bridge Facilitator",
    address: "0x1234567890123456789012345678901234567890",
    endpoint: "https://lifi-facilitator.example.com",
    stakeCents: 5000000, // $5,000
    status: "active",
    riskScore: 12,
  },
];

export async function getMockFacilitators(): Promise<GovernanceFacilitator[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...MOCK_FACILITATORS];
}

export async function mockRegisterFacilitator(
  registration: FacilitatorRegistration,
): Promise<{ txHash: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real implementation, this would call a Morph contract via the backend.
  console.log("Registering facilitator:", registration);

  return {
    txHash: `0xreg_tx_${Math.random().toString(36).slice(2, 12)}`,
  };
}

export async function mockProposeSlash(
  proposal: SlashingProposal,
): Promise<{ proposalId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real implementation, this would create a governance proposal in the DB/on-chain.
  console.log("Submitting slashing proposal:", proposal);

  return {
    proposalId: createId("prp"),
  };
}
