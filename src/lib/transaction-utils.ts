/**
 * Transactional utilities for the Mandate402 operator console.
 * These are used by John (Transactional UI Lane) to ensure idempotency and
 * correct state handling during mandate creation and payment attempts.
 */

/**
 * Generates a stable payment identifier for client-side use.
 * This ensures that a re-submitted form doesn't trigger a duplicate
 * reservation or payout in the Postgres ledger.
 */
export function generatePaymentIdentifier(): string {
  // We use crypto.randomUUID() where available for high-entropy IDs.
  // In older environments, we fall back to a timestamped random string.
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `pid_${crypto.randomUUID()}`;
  }

  return `pid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Standardizes vendor endpoint URLs to ensure the correlation /status
 * path is correctly derived.
 */
export function getVendorStatusUrl(baseUrl: string): string {
  const url = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${url}/status`;
}
