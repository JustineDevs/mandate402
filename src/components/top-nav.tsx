"use client";

import type React from "react";
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
  onSearch?: (query: string) => void;
  onProfileClick?: () => void;
  onWalletClick?: () => void;
  environment?: ConsoleEnvironment;
  /** Human-readable sync label, e.g. "Synced 2m ago". */
  lastSyncLabel?: string;
  chainLabel?: string;
  searchExtraItems?: GlobalSearchItem[];
}

/**
 * TopNav — environment chrome, page-scoped search, global search (⌘K), wallet pill.
 */
export const TopNav: React.FC<TopNavProps> = ({
  userAddress,
  onSearch,
  onProfileClick,
  onWalletClick,
  environment = "production",
  lastSyncLabel = "Synced just now",
  chainLabel = "Morph L2",
  searchExtraItems,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const envLabel = environment === "production" ? "Production" : "Staging";

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
                className={`h-2 w-2 rounded-full ${environment === "production" ? "bg-mandate-green" : "bg-accent-payments"}`}
                aria-hidden="true"
              />
              {envLabel}
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-left">
              {environment === "production"
                ? "Production lane — policy and treasury semantics match live Morph settlement."
                : "Staging lane — rehearsal data; do not treat outcomes as production truth."}
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
              UI clock for operator orientation. Wire to your sync job or block
              height when backend hooks land.
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
              Active chain context for RPC, explorers, and facilitator endpoints
              shown elsewhere in the console.
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="relative min-w-0 flex-1 lg:max-w-lg"
            title="Client-side filter for content on this page only. Does not search the server or other routes."
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
              <svg
                className="h-5 w-5 text-steel"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Filter this page…"
              className="w-full border-none bg-transparent py-3 pr-3 pl-10 text-sm font-medium text-charcoal placeholder:text-muted focus:outline-none sm:pl-12 sm:pr-4"
              aria-label="Page filter search"
            />
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-4">
            <GlobalSearchTriggerButton
              onClick={() => setGlobalSearchOpen(true)}
            />

            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={onWalletClick}
                disabled={!walletInteractive}
                className="flex min-h-11 max-w-full items-center gap-2 rounded-full border border-hairline bg-canvas py-1.5 pr-3 pl-2 shadow-sm transition-colors hover:bg-surface-soft sm:gap-3 sm:pr-4 sm:pl-3"
                aria-label="Wallet status and address"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-mandate-green"
                  aria-hidden="true"
                />

                <span className="font-mono-reference truncate text-xs font-medium tracking-tight text-ink sm:text-sm">
                  {walletLabel}
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
                  ? "Treasury and onchain signer state come from the linked operator wallet path."
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
                  ? "Operator profile actions are available from this control."
                  : "Profile actions stay disabled until a real operator profile surface is wired."}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </>
  );
};
