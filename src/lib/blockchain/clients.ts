import { http, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  createMorphChain,
  getActiveMorphNetwork,
} from "@/lib/blockchain/networks";
import { getMorphRuntimeConfig } from "@/lib/infrastructure/env";

export function hasMorphSigner() {
  return Boolean(getMorphRuntimeConfig().privateKey);
}

export function getMorphSignerAccount() {
  const { privateKey } = getMorphRuntimeConfig();
  if (!privateKey) {
    throw new Error(
      "MORPH_PRIVATE_KEY is required for signer-backed Morph operations.",
    );
  }

  return privateKeyToAccount(privateKey as `0x${string}`);
}

export function createMorphTransport() {
  const network = getActiveMorphNetwork();
  if (!network.rpcUrl) {
    throw new Error("MORPH_RPC_URL is required for Morph RPC transport.");
  }

  return http(network.rpcUrl);
}

export function getMorphPublicClient() {
  const network = getActiveMorphNetwork();
  return createPublicClient({
    chain: createMorphChain(network),
    transport: createMorphTransport(),
  });
}

export function getMorphWalletClient() {
  const network = getActiveMorphNetwork();
  return createWalletClient({
    account: getMorphSignerAccount(),
    chain: createMorphChain(network),
    transport: createMorphTransport(),
  });
}
