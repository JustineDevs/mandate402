import { keccak256, stringToHex } from "viem";

import {
  getMorphPublicClient,
  getMorphWalletClient,
} from "@/lib/blockchain/clients";
import { getMandateRegistryContract } from "@/lib/blockchain/contracts";
import { assertProductionMorphAnchoringConfig } from "@/lib/infrastructure/env";

function mandateIdToBytes32(mandateId: string) {
  return keccak256(stringToHex(mandateId));
}

export function assertMorphWriteReady() {
  return assertProductionMorphAnchoringConfig();
}

async function writeAnchor(
  action: "issueMandate" | "revokeMandate",
  mandateId: string,
  refValue: string,
) {
  const { missingConfig } = assertMorphWriteReady();
  if (missingConfig) {
    throw new Error("Morph anchoring is not fully configured.");
  }

  const contract = getMandateRegistryContract();
  if (!contract.address) {
    throw new Error(
      "MANDATE_REGISTRY_ADDRESS is required for Morph anchor writes.",
    );
  }

  const walletClient = getMorphWalletClient();
  const publicClient = getMorphPublicClient();

  const hash = await walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: action,
    args: [mandateIdToBytes32(mandateId), keccak256(stringToHex(refValue))],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function issueMandateAnchor(mandateId: string) {
  return writeAnchor("issueMandate", mandateId, `issue:${mandateId}`);
}

export async function revokeMandateAnchor(mandateId: string) {
  return writeAnchor("revokeMandate", mandateId, `revoke:${mandateId}`);
}
