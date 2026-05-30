import type {
  BridgeQuoteRequest,
  BridgeQuoteResponse,
} from "@/lib/domain/types";
import { createId } from "@/lib/infrastructure/id";

/**
 * Mock services for Treasury Bridging to unblock Transactional UI development.
 */

export async function getBridgeQuote(
  request: BridgeQuoteRequest,
): Promise<BridgeQuoteResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Generate a mock quote
  return {
    quoteId: createId("qte"),
    estimatedFeesCents: Math.round(request.amountCents * 0.005), // 0.5% fee
    estimatedTimeMinutes: 15,
    exchangeRate: 1.0, // Stablecoin to Stablecoin mock
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes expiry
  };
}

export async function executeBridge(
  _quoteId: string,
  _operatorId: string,
): Promise<{ txHash: string }> {
  // Simulate heavy cross-chain execution delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    txHash: `0xmock_bridge_tx_${Math.random().toString(36).slice(2, 12)}`,
  };
}
