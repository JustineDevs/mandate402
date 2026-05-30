import type { ReactNode } from "react";

import { StatusPill } from "@/components/status-pill";
import type { StatusTone } from "@/components/status-pill";
import { consolePanelClass } from "@/lib/console-layout";
import { formatOperatorToken } from "@/lib/operator-display-labels";
import { cn } from "@/lib/utils";

interface ConsoleCardProps {
  eyebrow?: string;
  title?: string;
  prepend?: ReactNode;
  value?: string;
  /** When true (default), value is humanized from snake_case tokens. */
  humanizeValue?: boolean;
  children?: ReactNode;
  className?: string;
  pill?: { label: string; tone?: StatusTone; humanize?: boolean };
}

/**
 * Shared metric / summary card for operator console grids.
 */
export function ConsoleCard({
  eyebrow,
  title,
  prepend,
  value,
  humanizeValue = true,
  children,
  className = "",
  pill,
}: ConsoleCardProps) {
  const displayValue =
    value && humanizeValue ? formatOperatorToken(value) : value;

  return (
    <section className={cn(consolePanelClass, "min-w-0", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {prepend ? <div className="mb-3">{prepend}</div> : null}
          {eyebrow ? (
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
              {eyebrow}
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            {title ? (
              <h2 className="text-base font-bold text-charcoal sm:text-lg">
                {title}
              </h2>
            ) : null}
            {pill ? (
              <StatusPill
                label={pill.label}
                tone={pill.tone}
                humanize={pill.humanize}
              />
            ) : null}
          </div>
          {displayValue ? (
            <div className="mt-3 break-words text-xl font-bold leading-tight text-charcoal sm:text-2xl lg:text-3xl">
              {displayValue}
            </div>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="mt-4 text-sm leading-relaxed text-slate">
          {children}
        </div>
      ) : null}
    </section>
  );
}

interface ConsoleCodeSurfaceProps {
  title?: string;
  /** Operator-facing one-liner shown before optional detail disclosure. */
  summary?: string;
  disclosureLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function ConsoleCodeSurface({
  title,
  summary,
  disclosureLabel = "More detail",
  defaultOpen = false,
  children,
  className = "",
}: ConsoleCodeSurfaceProps) {
  return (
    <section
      className={cn(
        "min-w-0 w-full rounded-lg border border-hairline-dark bg-canvas-dark p-4 text-on-dark shadow-sm sm:p-6",
        className,
      )}
    >
      {title ? (
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-dark-muted">
          {title}
        </div>
      ) : null}
      <div className={title ? "mt-4" : ""}>
        {summary ? (
          <>
            <p className="text-sm leading-relaxed text-on-dark-muted">
              {summary}
            </p>
            <details
              className="group mt-4 rounded-md border border-white/10 bg-white/[0.03]"
              open={defaultOpen}
            >
              <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-on-dark-muted marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">{disclosureLabel}</span>
                <span className="hidden group-open:inline">Hide detail</span>
              </summary>
              <div className="border-t border-white/10 px-3 py-3">
                {children}
              </div>
            </details>
          </>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

/** Bordered console section panel (tables, ledgers, forms). */
export function ConsolePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(consolePanelClass, className)}>{children}</div>;
}

/** Responsive status tile used in settings-style grids. */
export function StatusField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border border-hairline bg-canvas p-4 shadow-sm",
        className,
      )}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
        {label}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
