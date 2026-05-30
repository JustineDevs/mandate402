"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";

import {
  GlobalSearchDialog,
  GlobalSearchTriggerButton,
} from "@/components/global-search";
import type { GlobalSearchItem } from "@/components/global-search";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ConsoleEnvironment = "production" | "staging";

interface TopNavProps {
  userAddress?: string;
  onProfileClick?: () => void;
  onWalletClick?: () => void;
  walletPending?: boolean;
  environment?: ConsoleEnvironment;
  /** Server-derived label, e.g. Production, Local, Test. */
  environmentLabel?: string;
  /** Human-readable sync label, e.g. "Synced 2m ago". */
  lastSyncLabel?: string;
  chainLabel?: string;
  runtimeStatus?: "ok" | "degraded";
  runtimeApiOrigin?: string;
  runtimeLastBlock?: string | null;
  runtimeRpcReachable?: boolean | null;
  runtimeError?: string | null;
  searchExtraItems?: GlobalSearchItem[];
}

/**
 * TopNav — environment chrome, workspace search (⌘K), wallet pill, profile.
 */
export const TopNav: FC<TopNavProps> = ({
  userAddress,
  onProfileClick,
  onWalletClick,
  walletPending = false,
  environment = "production",
  environmentLabel,
  lastSyncLabel = "Checking runtime…",
  chainLabel = "Morph",
  runtimeStatus = "degraded",
  runtimeApiOrigin,
  runtimeLastBlock,
  runtimeRpcReachable,
  runtimeError,
  searchExtraItems,
}) => {
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const walletInteractive = typeof onWalletClick === "function";
  const profileInteractive = typeof onProfileClick === "function";
  const walletLabel = userAddress?.trim() || "Treasury unlinked";

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const envLabel =
    environmentLabel ??
    (environment === "production" ? "Production" : "Staging");
  const envToneClass =
    environment === "production" && runtimeStatus === "ok"
      ? "bg-mandate-green"
      : runtimeStatus === "ok"
        ? "bg-accent-payments"
        : "bg-accent-payments";

  return (
    <>
      <GlobalSearchDialog
        open={globalSearchOpen}
        onOpenChange={setGlobalSearchOpen}
        extraItems={searchExtraItems}
      />

      <header className="mb-8 border-b border-hairline pb-4 sm:mb-10 lg:mb-12">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
          <Tooltip>
            <TooltipTrigger
              type="button"
              className="inline-flex cursor-default items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-1 text-charcoal"
            >
              <span
                className={`h-2 w-2 rounded-full ${envToneClass}`}
                aria-hidden="true"
              />
              {envLabel}
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-left">
              {runtimeError
                ? runtimeError
                : environment === "production"
                  ? `Live runtime (${runtimeApiOrigin || "same origin"}). Policy and treasury semantics match production Morph settlement.`
                  : `Non-production runtime (${runtimeApiOrigin || "same origin"}). Treat outcomes as rehearsal unless you intentionally pointed at production.`}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              type="button"
              className="cursor-default border-none bg-transparent p-0 text-left text-stone"
            >
              {lastSyncLabel}
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-left">
              {runtimeError
                ? "Could not reach the runtime API. Local dev falls back to http://localhost:3000 when a remote base URL is configured."
                : runtimeLastBlock
                  ? `Last observed block ${runtimeLastBlock} from ${runtimeApiOrigin || "this app"}.`
                  : `Runtime health from ${runtimeApiOrigin || "this app"}. RPC ${runtimeRpcReachable === false ? "unreachable" : runtimeRpcReachable === true ? "reachable" : "not probed"}.`}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              type="button"
              className="cursor-default border-none bg-transparent p-0 font-mono-reference normal-case tracking-normal text-slate"
            >
              {chainLabel}
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-left">
              Active Morph network from server config and RPC probe. Used for
              explorers and settlement context across the console.
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <GlobalSearchTriggerButton
            onClick={() => setGlobalSearchOpen(true)}
          />

          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-4 md:w-auto md:shrink-0">
            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={onWalletClick}
                disabled={!walletInteractive || walletPending}
                className="flex min-h-11 max-w-full items-center gap-2 rounded-full border border-hairline bg-canvas py-1.5 pr-3 pl-2 shadow-sm transition-colors hover:bg-surface-soft disabled:cursor-wait disabled:opacity-70 sm:gap-3 sm:pr-4 sm:pl-3"
                aria-label="Wallet status and address"
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${userAddress?.trim() ? "bg-mandate-green" : "bg-accent-payments"}`}
                  aria-hidden="true"
                />

                <span className="font-mono-reference truncate text-xs font-medium tracking-tight text-ink sm:text-sm">
                  {walletPending ? "Connecting wallet…" : walletLabel}
                </span>

                {walletInteractive ? (
                  <svg
                    className="h-4 w-4 shrink-0 text-stone"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                ) : null}
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-left">
                {walletInteractive
                  ? userAddress?.trim()
                    ? "Open settings to review or update the linked wallet."
                    : "Connect an external wallet or open settings to finish setup."
                  : "Treasury wallet status is shown here, but wallet actions stay disabled until a real nav action is wired."}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={onProfileClick}
                disabled={!profileInteractive}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-steel shadow-sm transition-colors hover:bg-surface-soft"
                aria-label="Profile settings"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-left">
                {profileInteractive
                  ? "Open operator settings for session posture and treasury linkage."
                  : "Profile actions stay disabled until a real operator profile surface is wired."}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </>
  );
};
