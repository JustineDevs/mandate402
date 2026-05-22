"use client";

import type { Mandate, MandateStatus } from "@/lib/types";
import type React from "react";

interface RecentMandatesCardProps {
  mandates?: Mandate[];
  isLoading?: boolean;
  onMoreClick?: () => void;
}

const statusColorMap: Record<MandateStatus, string> = {
  Active: "#22C55E",
  Expiring: "#F59E0B",
  Revoked: "#EF4444",
};

/**
 * RecentMandatesCard Component
 * Isolated top panel layout for recent mandates.
 * Programmatically maps status colors and handles loading/empty states.
 */
export const RecentMandatesCard: React.FC<RecentMandatesCardProps> = ({
  mandates = [],
  isLoading,
  onMoreClick,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#E4ECE9] border-dashed rounded-xl p-8 shadow-sm h-full flex flex-col animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-8" />
        <div className="flex-1 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E4ECE9] border-dashed rounded-xl p-8 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-[#475569]">Recent Mandates</h3>
          <span
            className="text-[#475569] text-[10px] opacity-60 cursor-help"
            aria-label="Information tooltip"
          >
            (i)
          </span>
        </div>
        <button
          type="button"
          onClick={onMoreClick}
          className="flex items-center gap-1 text-[#6B7280] text-[10px] font-bold uppercase tracking-wider hover:text-[#1F2937] transition-colors"
          aria-label="View more mandates"
        >
          More{" "}
          <span className="text-xs" aria-hidden="true">
            &gt;
          </span>
        </button>
      </div>

      {/* List Rows - Balanced Spacing */}
      <div className="flex-1 flex flex-col justify-between">
        {mandates.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-[#666666] text-xs italic">
            No recent mandates found.
          </div>
        ) : (
          mandates.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between group cursor-pointer py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#1F2937] text-sm font-medium">
                  {m.name}
                </span>
                <span
                  className="text-[#1F2937] text-[10px] opacity-40"
                  aria-hidden="true"
                >
                  [v]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1F2937] text-xs font-medium">
                  {m.status}
                </span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusColorMap[m.status] }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
