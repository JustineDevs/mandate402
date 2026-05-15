import "dotenv/config";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

const target = process.argv[2] ?? "market-data";

const vendorMap = {
  "market-data": process.env.PRIMARY_X402_VENDOR_A_URL,
  research: process.env.PRIMARY_X402_VENDOR_B_URL,
};

const vendorUrl = vendorMap[target];
if (!vendorUrl) {
  throw new Error(`Missing vendor URL for target: ${target}`);
}

const privateKey = process.env.AGENT_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("AGENT_PRIVATE_KEY is required");
}

const signer = privateKeyToAccount(privateKey);
const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(signer));

const fetchWithPayment = wrapFetchWithPayment(fetch, client);

async function main() {
  console.log(`🤖 Paying vendor: ${target}`);
  console.log(`URL: ${vendorUrl}`);

  const response = await fetchWithPayment(vendorUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const paymentResponse = response.headers.get("X-PAYMENT-RESPONSE");
  const text = await response.text();

  console.log(`Status: ${response.status}`);
  if (paymentResponse) {
    console.log(`X-PAYMENT-RESPONSE: ${paymentResponse}`);
  }

  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(text);
  }
}

main().catch((error) => {
  console.error("❌ x402 payment flow failed:", error);
  process.exit(1);
});
