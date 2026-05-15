import "dotenv/config";
import { http, createPublicClient, createWalletClient, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const morphTestnet = {
  id: Number(process.env.MANDATE402_TESTNET_CHAIN_ID ?? "2810"),
  name: "Morph Testnet",
  network: "morph-testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.MANDATE402_TESTNET_RPC_URL ??
          "https://rpc-quicknode-holesky.morphl2.io",
      ],
    },
  },
};

const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY);
const contractAddress = process.env.MANDATE402_TREASURY_ADDRESS;
const tokenAddress = process.env.MANDATE402_TEST_TOKEN;
const amount = process.env.MANDATE402_PAYMENT_AMOUNT ?? "0.01";
const facilitatorAddress =
  process.env.MANDATE402_FACILITATOR_ADDRESS ?? account.address;

const publicClient = createPublicClient({
  chain: morphTestnet,
  transport: http(morphTestnet.rpcUrls.default.http[0]),
});

const walletClient = createWalletClient({
  account,
  chain: morphTestnet,
  transport: http(morphTestnet.rpcUrls.default.http[0]),
});

const mandateAbi = [
  {
    inputs: [
      { internalType: "address", name: "agent", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "facilitator", type: "address" },
      { internalType: "uint256", name: "tokenAmount", type: "uint256" },
    ],
    name: "executeX402Payment",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function simulateAgenticPaymentFlow() {
  console.log(
    "🤖 [Agent Core]: Intercepted HTTP 402 Payment Required status code...",
  );
  const parsedAmount = parseUnits(amount, 18);

  try {
    console.log(
      "🔄 [Agent Core]: Submitting transaction request via Mandate402 guardrails...",
    );

    const { request } = await publicClient.simulateContract({
      account,
      address: contractAddress,
      abi: mandateAbi,
      functionName: "executeX402Payment",
      args: [account.address, tokenAddress, facilitatorAddress, parsedAmount],
    });

    const txHash = await walletClient.writeContract(request);
    console.log(
      `✅ [Transaction Broadcaster]: Mandate cleared! Explorer hash: ${txHash}`,
    );
  } catch (error) {
    console.error(
      "❌ [Mandate Rejection]: Transaction blocked by treasury parameters:",
      error.message,
    );
  }
}

simulateAgenticPaymentFlow();
