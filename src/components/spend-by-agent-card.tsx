"use client";

import type { AgentSpend } from "@/lib/types";
import type React from "react";

interface GaugeTrackProps extends AgentSpend {
  onAgentClick?: (id: string) => void;
}

/** Single agent spend row with progress track. */
const GaugeTrack: React.FC<GaugeTrackProps> = ({
  id,
  agentName,
  spend,
  max,
  onAgentClick,
}) => {
  const percentage = Math.min((spend / max) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="relative group">
          <button
            type="button"
            onClick={() => onAgentClick?.(id)}
            className="text-slate text-sm font-medium bg-surface border border-hairline px-3 py-1 rounded flex items-center gap-2 hover:border-mandate-green transition-colors"
            aria-label={`View details for ${agentName}`}
          >
            {agentName}{" "}
            <span className="text-[10px] opacity-50" aria-hidden="true">
              v
            </span>
          </button>
        </div>
        <span className="font-bold text-charcoal">${spend}</span>
      </div>
      <div
        className="h-2 w-full bg-hairline rounded-full overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full bg-mandate-green transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface SpendByAgentCardProps {
  agentSpends?: AgentSpend[];
  isLoading?: boolean;
  onAgentClick?: (id: string) => void;
}

/** Spend-by-agent breakdown for the operator dashboard. */
export const SpendByAgentCard: React.FC<SpendByAgentCardProps> = ({
  agentSpends = [],
  isLoading,
  onAgentClick,
}) => {
  if (isLoading) {
    return (
      <section className="mb-8 rounded-lg border border-dashed border-hairline bg-canvas p-8 shadow-sm animate-pulse">
        <div className="h-6 bg-surface-soft rounded w-1/4 mb-8" />
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-surface-soft rounded w-1/3" />
                <div className="h-4 bg-surface-soft rounded w-1/6" />
              </div>
              <div className="h-2 bg-surface-soft rounded w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-lg border border-dashed border-hairline bg-canvas p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-8">
        <h3 className="text-lg font-bold text-charcoal">Spend by Agent</h3>
        <span
          className="text-slate text-xs opacity-60 cursor-help"
          aria-label="Spend calculation methodology"
          title="Total authorized spend across all active mandates per agent"
        >
          (i)
        </span>
      </div>

      <div className="space-y-8">
        {agentSpends.length === 0 ? (
          <div className="py-10 text-center text-sm italic text-steel">
            No agent spend data available.
          </div>
        ) : (
          agentSpends.map((agent) => (
            <GaugeTrack key={agent.id} {...agent} onAgentClick={onAgentClick} />
          ))
        )}
      </div>
    </section>
  );
};
