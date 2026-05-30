"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export type GlobalSearchItem = {
  id: string;
  label: string;
  description?: string;
  href: Route;
  keywords?: string[];
};

const DEFAULT_INDEX: GlobalSearchItem[] = [
  {
    id: "op",
    label: "Operator workspace",
    description: "Dashboard entry",
    href: "/operator",
    keywords: ["dashboard", "home", "console"],
  },
  {
    id: "mandates",
    label: "Mandates",
    description: "List and issue mandates",
    href: "/mandates",
    keywords: ["policy", "spend"],
  },
  {
    id: "agents",
    label: "Agents",
    description: "Agent registry",
    href: "/agents",
    keywords: ["bot", "orchestration"],
  },
  {
    id: "vendors",
    label: "Vendors",
    description: "Vendor registry",
    href: "/vendors",
    keywords: ["merchant", "endpoint"],
  },
  {
    id: "tx",
    label: "Transactions",
    description: "Attempt ledger",
    href: "/transactions",
    keywords: ["ledger", "attempts", "blocked"],
  },
  {
    id: "receipts",
    label: "Receipts",
    description: "Receipt and audit surface",
    href: "/receipts",
    keywords: ["proof", "export"],
  },
  {
    id: "policies",
    label: "Policies",
    description: "Policy registry",
    href: "/policy-registry",
    keywords: ["rules", "compliance", "governance"],
  },
  {
    id: "settings",
    label: "Settings",
    description: "Account, wallet link, and runtime fields",
    href: "/settings",
    keywords: ["health", "runtime", "chain", "wallet", "profile"],
  },
  {
    id: "wallet-settings",
    label: "Wallet settings",
    description: "Link or update the treasury wallet",
    href: "/settings?treasury=1" as Route,
    keywords: ["connect", "wallet", "treasury", "external"],
  },
  {
    id: "runtime",
    label: "Runtime status",
    description: "Spend exposure, queues, and system readiness",
    href: "/treasury" as Route,
    keywords: ["build", "liquidity", "runtime", "status"],
  },
  {
    id: "home",
    label: "Marketing home",
    description: "Public landing",
    href: "/",
    keywords: ["landing", "mandate402"],
  },
];

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extraItems?: GlobalSearchItem[];
}

const DIALOG_ROLE = "dialog";

/**
 * v0.1.1 global search shell: route index + client-side filter.
 * Parent owns Cmd/Ctrl+K and passes `open` / `onOpenChange`.
 */
export function GlobalSearchDialog({
  open,
  onOpenChange,
  extraItems = [],
}: GlobalSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allItems = useMemo(
    () => [...DEFAULT_INDEX, ...extraItems],
    [extraItems],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allItems;
    }
    return allItems.filter((item) => {
      const hay = [
        item.label,
        item.description ?? "",
        item.id,
        ...(item.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allItems, query]);

  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => inputRef.current?.focus());
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function navigateTo(href: Route) {
    onOpenChange(false);
    router.push(href);
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/45 p-4 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        ref={panelRef}
        role={DIALOG_ROLE}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-lg shrink-0 overflow-hidden rounded-xl border border-hairline-strong bg-canvas p-0 shadow-[0_28px_80px_rgba(15,23,32,0.28)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-hairline px-4 py-3 sm:px-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-steel">
            Global search
          </div>
          <h2 id={titleId} className="sr-only">
            Search workspace
          </h2>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search routes, pages, mandates…"
            className="mt-2 w-full border-0 bg-transparent py-2 text-base font-medium text-charcoal placeholder:text-muted focus:outline-none"
            aria-label="Search"
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-stone">
            Local search across console routes. Server-backed mandate search
            comes later.
          </p>
        </div>
        <ul
          className="max-h-[min(60vh,420px)] overflow-y-auto py-2"
          aria-label="Results"
        >
          {filtered.length === 0 ? (
            <li className="px-5 py-6 text-center text-sm text-steel">
              No matches.
            </li>
          ) : (
            filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 px-5 py-3 text-left transition-colors hover:bg-surface-soft"
                  onClick={() => navigateTo(item.href)}
                >
                  <span className="text-sm font-bold text-charcoal">
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className="text-xs text-steel">
                      {item.description}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-hairline px-4 py-2 text-[11px] text-stone sm:px-5">
          Esc to close · click row to navigate
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function GlobalSearchTriggerButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={onClick}
        className="inline-flex min-h-11 w-full min-w-0 max-w-lg items-center gap-3 rounded-full border border-hairline bg-canvas px-4 text-left shadow-sm transition-colors hover:border-hairline-strong hover:bg-surface-soft sm:max-w-xl"
        aria-label="Search workspace"
      >
        <svg
          className="h-5 w-5 shrink-0 text-steel"
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
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone">
          Search workspace…
        </span>
        <kbd className="hidden shrink-0 rounded-md border border-hairline bg-surface-soft px-2 py-0.5 font-mono-reference text-[10px] font-bold uppercase tracking-wider text-steel sm:inline">
          ⌘K
        </kbd>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-left">
        Jump to any page in the console. Keyboard shortcut: ⌘K (Ctrl+K on
        Windows).
      </TooltipContent>
    </Tooltip>
  );
}
