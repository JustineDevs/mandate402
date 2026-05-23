import type { ReactNode } from "react";

interface SectionHeaderProps {
  /** Upper label (Untitled-style meta lane). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Trailing counts, pills, or compact metadata. */
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * In-page section title row (inside console main, below hero).
 * @see docs/process/FRONTEND-PRIMITIVES.md
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-mono-reference text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={`text-xl font-bold tracking-tight text-charcoal sm:text-2xl ${eyebrow ? "mt-2" : ""}`}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-steel">
            {description}
          </p>
        ) : null}
        {meta ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone">
            {meta}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
