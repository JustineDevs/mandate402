/**
 * Allowed post-login `?next=` targets: same-origin paths only, no protocol or
 * scheme tricks. Keeps redirects inside the operator console surface.
 */
export const OPERATOR_CONSOLE_PATH_PREFIXES = [
  "/agents",
  "/audit",
  "/build",
  "/mandates",
  "/policy-registry",
  "/receipts",
  "/settings",
  "/transactions",
  "/vendors",
] as const;

/**
 * Returns a safe internal path for `router.replace`, or `undefined` if the
 * input must not be used (open redirect / unknown surface).
 */
export function sanitizeOperatorNextPath(
  raw: string | undefined | null,
): string | undefined {
  if (raw == null || raw === "") {
    return undefined;
  }

  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return undefined;
  }

  if (!decoded.startsWith("/")) {
    return undefined;
  }
  if (decoded.startsWith("//")) {
    return undefined;
  }
  const lower = decoded.toLowerCase();
  if (lower.includes("javascript:") || lower.includes("data:")) {
    return undefined;
  }
  if (decoded.includes("://")) {
    return undefined;
  }

  const pathOnly = (decoded.split("?")[0] ?? "").split("#")[0] ?? "";
  if (pathOnly === "/operator" || pathOnly.startsWith("/operator/")) {
    return undefined;
  }
  if (pathOnly === "/") {
    return undefined;
  }

  const allowed = OPERATOR_CONSOLE_PATH_PREFIXES.some(
    (p) => pathOnly === p || pathOnly.startsWith(`${p}/`),
  );

  return allowed ? pathOnly : undefined;
}
