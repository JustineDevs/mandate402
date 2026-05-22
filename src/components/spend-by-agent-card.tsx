"use client";

import type { AgentSpend } from "@/lib/types";
import type React from "react";

interface GaugeTrackProps extends AgentSpend {
  onAgentClick?: (id: string) => void;
}

/**
 * GaugeTrack Component
 * Multi-stage progress bar for agent spend.
 * Prepared for dynamic data hydration and event handling.
 */
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
            className="text-[#475569] text-sm font-medium bg-[#F7FAF9] border border-[#E4ECE9] px-3 py-1 rounded flex items-center gap-2 hover:border-[#15803D] transition-colors"
            aria-label={`View details for ${agentName}`}
          >
            {agentName}{" "}
            <span className="text-[10px] opacity-50" aria-hidden="true">
              v
            </span>
          </button>
        </div>
        <span className="text-[#1F2937] font-bold">${spend}</span>
      </div>
      <div
        className="h-2 w-full bg-[#E4ECE9] rounded-full overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-[#22C55E] via-[#F59E0B] to-[#EF4444] transition-all duration-1000"
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

/**
 * SpendByAgentCard Component
 * High-fidelity long card for dashboard metrics.
 * Parameterized for dynamic data and handles loading/empty states.
 */
export const SpendByAgentCard: React.FC<SpendByAgentCardProps> = ({
  agentSpends = [],
  isLoading,
  onAgentClick,
}) => {
  if (isLoading) {
    return (
      <section className="bg-white border border-[#E4ECE9] border-dashed rounded-lg p-8 mb-8 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/4 mb-8" />
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
              </div>
              <div className="h-2 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-[#E4ECE9] border-dashed rounded-lg p-8 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-8">
        <h3 className="text-lg font-bold text-[#1F2937]">Spend by Agent</h3>
        <span
          className="text-[#475569] text-xs opacity-60 cursor-help"
          aria-label="Spend calculation methodology"
          title="Total authorized spend across all active mandates per agent"
        >
          (i)
        </span>
      </div>

      <div className="space-y-8">
        {agentSpends.length === 0 ? (
          <div className="text-center py-10 text-[#666666] text-sm italic">
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
