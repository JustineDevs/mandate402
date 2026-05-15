import {
  http,
  createPublicClient,
  createWalletClient,
  keccak256,
  parseAbi,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getMorphRuntimeConfig } from "@/lib/infrastructure/env";
import { createId } from "@/lib/infrastructure/id";

const mandateRegistryAbi = parseAbi([
  "function issueMandate(bytes32 mandateId, bytes32 specHash)",
  "function revokeMandate(bytes32 mandateId, bytes32 revokeRef)",
]);

function createMorphChain(chainId: number) {
  return {
    id: chainId,
    name: "Morph",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [
          getMorphRuntimeConfig().rpcUrl ??
            "https://rpc-quicknode.morph.network",
        ],
      },
    },
  } as const;
}

function mandateIdToBytes32(mandateId: string) {
  return keccak256(stringToHex(mandateId));
}

async function writeAnchor(
  action: "issueMandate" | "revokeMandate",
  mandateId: string,
  refValue: string,
) {
  const config = getMorphRuntimeConfig();
  if (!config.rpcUrl || !config.privateKey || !config.contractAddress) {
    return `demo_${action}_${mandateId}_${createId("tx")}`;
  }

  const account = privateKeyToAccount(config.privateKey as `0x${string}`);
  const chain = createMorphChain(config.chainId);
  const transport = http(config.rpcUrl);
  const walletClient = createWalletClient({ account, chain, transport });
  const publicClient = createPublicClient({ chain, transport });

  const hash = await walletClient.writeContract({
    address: config.contractAddress,
    abi: mandateRegistryAbi,
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
