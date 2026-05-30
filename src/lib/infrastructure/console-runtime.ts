import { getBlockchainRuntimeHealth } from "@/lib/blockchain/health";
import { getActiveMorphNetwork } from "@/lib/blockchain/networks";
import type { AppEnv } from "@/lib/infrastructure/env";
import {
  getAppEnv,
  getPersistenceMode,
  isProductionEnv,
} from "@/lib/infrastructure/env";

export type ConsoleRuntimeChrome = {
  appEnv: AppEnv;
  environmentLabel: string;
  chainLabel: string;
  networkKey: string;
  apiOrigin: string;
  status: "ok" | "degraded";
  syncedAt: string;
  lastBlock: string | null;
  rpcReachable: boolean | null;
  persistenceMode: string;
};

function isLocalHostname(hostname: string) {
  return /^(localhost|127\.0\.0\.1)$/i.test(hostname);
}

export function resolveConsoleEnvironmentLabel(
  appEnv: AppEnv,
  hostname: string,
): string {
  if (isLocalHostname(hostname)) {
    return "Local";
  }
  if (appEnv === "production") {
    return "Production";
  }
  return "Test";
}

export function formatConsoleChainLabel(input: {
  label: string;
  chainId: number | null;
}): string {
  if (input.chainId) {
    return `${input.label} · ${input.chainId}`;
  }
  return input.label;
}

export async function buildConsoleRuntimeChrome(
  request: Request,
): Promise<ConsoleRuntimeChrome> {
  const url = new URL(request.url);
  const appEnv = getAppEnv();
  const network = getActiveMorphNetwork();
  const blockchain = await getBlockchainRuntimeHealth();
  const chainLabel = formatConsoleChainLabel({
    label: network.label,
    chainId: blockchain.observedChainId ?? network.chainId,
  });

  const runtimeDegraded =
    blockchain.status !== "ready" ||
    (isProductionEnv() && blockchain.rpcReachable === false);

  return {
    appEnv,
    environmentLabel: resolveConsoleEnvironmentLabel(appEnv, url.hostname),
    chainLabel,
    networkKey: network.key,
    apiOrigin: url.origin,
    status: runtimeDegraded ? "degraded" : "ok",
    syncedAt: new Date().toISOString(),
    lastBlock: blockchain.lastObservedBlock,
    rpcReachable: blockchain.rpcReachable,
    persistenceMode: getPersistenceMode(),
  };
}
