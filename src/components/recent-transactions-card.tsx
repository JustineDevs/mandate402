"use client";

import type { Transaction, TransactionStatus } from "@/lib/types";
import type React from "react";

interface RecentTransactionsCardProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  onMoreClick?: () => void;
}

const statusColorMap: Record<TransactionStatus, string> = {
  Success: "#22C55E",
  Blocked: "#EF4444",
};

/**
 * RecentTransactionsCard Component
 * Isolated panel for transactional history.
 * Programmatically maps status colors and handles loading/empty states.
 */
export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions = [],
  isLoading,
  onMoreClick,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#E4ECE9] border-dashed rounded-xl p-8 shadow-sm h-full flex flex-col animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-8" />
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
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
          <h3 className="text-sm font-bold text-[#475569]">
            Recent Transactions
          </h3>
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
          aria-label="View more transactions"
        >
          More{" "}
          <span className="text-xs" aria-hidden="true">
            &gt;
          </span>
        </button>
      </div>

      {/* Three-Column Grid List */}
      <div className="flex-1 flex flex-col justify-between">
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-[#666666] text-xs italic">
            No recent transactions found.
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="grid grid-cols-3 items-center py-2">
              {/* Left Column */}
              <span className="text-[#1F2937] text-sm font-medium">
                {tx.vendor}
              </span>

              {/* Center Column */}
              <span className="text-[#1F2937] text-sm font-bold text-center">
                {tx.amount}
              </span>

              {/* Right Column */}
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[#1F2937] text-xs font-medium">
                  {tx.status}
                </span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusColorMap[tx.status] }}
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
