"use client";

import type { KpiData } from "@/lib/types";
import type React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KpiCardProps extends KpiData {
  isLoading?: boolean;
}

/**
 * KPI metric tile for the operator dashboard.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  delta,
  isPositive,
  subtext,
  tooltipText,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
        <div className="mb-4 h-4 w-1/2 rounded bg-surface-soft" />
        <div className="mb-2 h-8 w-3/4 rounded bg-surface-soft" />
        <div className="h-3 w-1/2 rounded bg-surface-soft" />
      </div>
    );
  }

  return (
    <div
      className="spotlight-surface rounded-lg border border-hairline bg-canvas p-6 shadow-sm"
      aria-label={`${title} metric`}
    >
      <div className="mb-2 flex items-start justify-between">
        <span className="flex items-center gap-1 text-sm font-medium text-slate">
          {title}
          {tooltipText ? (
            <Tooltip>
              <TooltipTrigger
                type="button"
                className="inline-flex size-5 items-center justify-center rounded-full border border-transparent text-[10px] text-steel opacity-70 transition-opacity hover:opacity-100"
                aria-label="Metric details"
              >
                (i)
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-left">
                {tooltipText}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </span>
      </div>
      <div className="mb-1 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-charcoal">{value}</span>
        <span
          className={`flex items-center text-sm font-bold ${isPositive ? "text-mandate-green" : "text-semantic-blocked-text"}`}
        >
          {delta}%{" "}
          <span className="ml-1 text-[10px]" aria-hidden="true">
            {isPositive ? "▲" : "▼"}
          </span>
        </span>
      </div>
      <p className="truncate text-xs text-steel">{subtext}</p>
    </div>
  );
};
