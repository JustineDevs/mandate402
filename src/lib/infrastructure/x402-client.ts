import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";

import { getMorphSignerAccount } from "@/lib/blockchain/clients";

let fetchWithPayment:
  | ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>)
  | null = null;

export function getPaymentFetch() {
  if (fetchWithPayment) {
    return fetchWithPayment;
  }

  const signer = getMorphSignerAccount();
  const client = new x402Client();
  client.register("eip155:*", new ExactEvmScheme(signer));
  fetchWithPayment = wrapFetchWithPayment(fetch, client);
  return fetchWithPayment;
}

export function resetPaymentFetchForTests() {
  fetchWithPayment = null;
}
