import { x402Client } from "@x402/core/client";
import { x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

import { getMorphRuntimeConfig } from "@/lib/infrastructure/env";

type PaymentRuntime = {
  client: x402Client;
  httpClient: x402HTTPClient;
};

let fetchWithPayment:
  | ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>)
  | null = null;
let paymentRuntime: PaymentRuntime | null = null;

export function getPaymentRuntime(): PaymentRuntime {
  if (paymentRuntime) {
    return paymentRuntime;
  }

  const { privateKey } = getMorphRuntimeConfig();
  if (!privateKey) {
    throw new Error(
      "MORPH_PRIVATE_KEY is required for x402-paying vendor execution.",
    );
  }

  const signer = privateKeyToAccount(privateKey as `0x${string}`);
  const client = new x402Client();
  client.register(
    "eip155:*",
    new ExactEvmScheme(
      signer as unknown as ConstructorParameters<typeof ExactEvmScheme>[0],
    ),
  );
  paymentRuntime = {
    client,
    httpClient: new x402HTTPClient(client),
  };
  return paymentRuntime;
}

export function getPaymentFetch() {
  if (fetchWithPayment) {
    return fetchWithPayment;
  }

  fetchWithPayment = wrapFetchWithPayment(fetch, getPaymentRuntime().client);
  return fetchWithPayment;
}

export function resetPaymentFetchForTests() {
  fetchWithPayment = null;
  paymentRuntime = null;
}
