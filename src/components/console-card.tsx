import type { ReactNode } from "react";

import { StatusPill } from "@/components/status-pill";
import type { StatusTone } from "@/components/status-pill";

interface ConsoleCardProps {
  eyebrow?: string;
  title?: string;
  /** Optional row above eyebrow (e.g. status pill as card headline). */
  prepend?: ReactNode;
  value?: string;
  children?: ReactNode;
  className?: string;
  pill?: { label: string; tone?: StatusTone };
}

/**
 * Shared metric / summary card for operator console grids.
 * @see docs/process/FRONTEND-PRIMITIVES.md
 */
export function ConsoleCard({
  eyebrow,
  title,
  prepend,
  value,
  children,
  className = "",
  pill,
}: ConsoleCardProps) {
  return (
    <section
      className={`rounded-lg border border-hairline bg-canvas p-6 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {prepend ? <div className="mb-3">{prepend}</div> : null}
          {eyebrow ? (
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-mandate-green-dark">
              {eyebrow}
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            {title ? (
              <h2 className="text-lg font-bold text-charcoal">{title}</h2>
            ) : null}
            {pill ? <StatusPill label={pill.label} tone={pill.tone} /> : null}
          </div>
          {value ? (
            <div className="mt-3 text-3xl font-bold text-charcoal">{value}</div>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="mt-4 text-sm leading-7 text-slate">{children}</div>
      ) : null}
    </section>
  );
}

interface ConsoleCodeSurfaceProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Logs, receipts, runtime blocks — `canvas-dark` per design tokens. */
export function ConsoleCodeSurface({
  title,
  children,
  className = "",
}: ConsoleCodeSurfaceProps) {
  return (
    <section
      className={`rounded-lg border border-hairline-dark bg-canvas-dark p-5 text-on-dark shadow-sm sm:p-6 ${className}`}
    >
      {title ? (
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-dark-muted">
          {title}
        </div>
      ) : null}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </section>
  );
}
