"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ConsoleDisclosureProps = {
  title: string;
  summary?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

/**
 * Progressive disclosure block for operator console — human title upfront,
 * technical detail hidden until expanded.
 */
export function ConsoleDisclosure({
  title,
  summary,
  children,
  defaultOpen = false,
  className,
}: ConsoleDisclosureProps) {
  return (
    <details
      className={cn(
        "group rounded-md border border-hairline bg-surface-soft",
        className,
      )}
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-charcoal">{title}</div>
            {summary ? (
              <p className="mt-1 text-xs leading-relaxed text-steel">
                {summary}
              </p>
            ) : null}
          </div>
          <span
            className="mt-0.5 shrink-0 text-xs font-semibold text-steel group-open:hidden"
            aria-hidden="true"
          >
            Show
          </span>
          <span
            className="mt-0.5 hidden shrink-0 text-xs font-semibold text-steel group-open:inline"
            aria-hidden="true"
          >
            Hide
          </span>
        </div>
      </summary>
      <div className="border-t border-hairline px-4 py-3 text-sm leading-relaxed text-slate">
        {children}
      </div>
    </details>
  );
}
