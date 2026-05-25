"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

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
    description: "System health and configuration",
    href: "/settings",
    keywords: ["health", "runtime", "chain"],
  },
  {
    id: "build",
    label: "Build",
    description: "Integrator build diary",
    href: "/build",
    keywords: ["developer", "api"],
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
  const panelRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

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

  function navigateTo(href: Route) {
    onOpenChange(false);
    router.push(href);
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-ink/40 px-3 pt-[min(20vh,8rem)] pb-8 sm:px-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <dialog
        ref={panelRef}
        open
        aria-labelledby={titleId}
        className="m-0 w-full max-w-lg overflow-hidden rounded-xl border border-hairline-strong bg-canvas p-0 shadow-[0_28px_80px_rgba(15,23,32,0.28)]"
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
            v0.1.1 — filter is local; link APIs for mandate IDs next.
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
      </dialog>
    </div>
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
        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-hairline bg-surface-soft px-3 text-xs font-bold uppercase tracking-wider text-steel transition-colors hover:border-hairline-strong hover:text-charcoal"
        aria-label="Open global search"
      >
        <span className="text-[10px] text-stone">⌘K</span>
        <span>Search</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-left">
        Jump to any workspace route. Local filter only — server-backed mandate
        search comes later.
      </TooltipContent>
    </Tooltip>
  );
}
