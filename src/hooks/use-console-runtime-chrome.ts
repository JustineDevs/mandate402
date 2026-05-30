"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchConsoleRuntimeChrome,
  formatConsoleSyncLabel,
  mapRuntimeToConsoleEnvironment,
} from "@/lib/console-runtime-client";
import type { ConsoleRuntimeChrome } from "@/lib/infrastructure/console-runtime";

const POLL_MS = 30_000;

export type ConsoleRuntimeChromeView = {
  environment: "production" | "staging";
  environmentLabel: string;
  lastSyncLabel: string;
  chainLabel: string;
  apiOrigin: string;
  status: "ok" | "degraded";
  lastBlock: string | null;
  rpcReachable: boolean | null;
  loading: boolean;
  error: string | null;
};

const initialView: ConsoleRuntimeChromeView = {
  environment: "staging",
  environmentLabel: "Connecting…",
  lastSyncLabel: "Checking runtime…",
  chainLabel: "Morph",
  apiOrigin: "",
  status: "degraded",
  lastBlock: null,
  rpcReachable: null,
  loading: true,
  error: null,
};

function toView(
  chrome: ConsoleRuntimeChrome,
  apiOrigin: string,
): ConsoleRuntimeChromeView {
  return {
    environment: mapRuntimeToConsoleEnvironment(chrome),
    environmentLabel: chrome.environmentLabel,
    lastSyncLabel: formatConsoleSyncLabel(chrome.syncedAt),
    chainLabel: chrome.chainLabel,
    apiOrigin: apiOrigin || chrome.apiOrigin,
    status: chrome.status,
    lastBlock: chrome.lastBlock,
    rpcReachable: chrome.rpcReachable,
    loading: false,
    error: null,
  };
}

export function useConsoleRuntimeChrome(): ConsoleRuntimeChromeView {
  const [view, setView] = useState<ConsoleRuntimeChromeView>(initialView);

  const refresh = useCallback(async () => {
    try {
      const { chrome, apiOrigin } = await fetchConsoleRuntimeChrome();
      setView(toView(chrome, apiOrigin));
    } catch (error) {
      setView((current) => ({
        ...current,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to reach the runtime API.",
        lastSyncLabel: "Sync unavailable",
        environmentLabel: "Offline",
        status: "degraded",
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  return view;
}
