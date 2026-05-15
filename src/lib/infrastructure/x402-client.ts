import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

import { getMorphRuntimeConfig } from "@/lib/infrastructure/env";

let fetchWithPayment:
  | ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>)
  | null = null;

export function getPaymentFetch() {
  if (fetchWithPayment) {
    return fetchWithPayment;
  }

  const { privateKey } = getMorphRuntimeConfig();
  if (!privateKey) {
    throw new Error(
      "MORPH_PRIVATE_KEY is required for x402-paying vendor execution.",
    );
  }

  const signer = privateKeyToAccount(privateKey as `0x${string}`);
  const client = new x402Client();
  client.register("eip155:*", new ExactEvmScheme(signer));
  fetchWithPayment = wrapFetchWithPayment(fetch, client);
  return fetchWithPayment;
}

export function resetPaymentFetchForTests() {
  fetchWithPayment = null;
}
