"use client";

import type React from "react";
import type { KpiData } from "@/lib/types";

interface KpiCardProps extends KpiData {
  isLoading?: boolean;
}

/**
 * KpiCard Component
 * Reusable KPI box for dashboard metrics.
 * Prepared for backend data hydration and loading states.
 */
export const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  delta, 
  isPositive, 
  subtext, 
  tooltipText,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 border border-[#E4ECE9] border-dashed rounded-lg shadow-sm animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
        <div className="h-8 bg-gray-100 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-[#E4ECE9] border-dashed rounded-lg shadow-sm" aria-label={`${title} metric`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[#475569] text-sm font-medium flex items-center gap-1">
          {title} 
          {tooltipText && (
            <span 
              className="opacity-60 text-[10px] cursor-help" 
              title={tooltipText}
              aria-label="More information"
            >
              (i)
            </span>
          )}
        </span>
      </div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-3xl font-bold text-[#1F2937]">{value}</span>
        <span className={`text-sm font-bold flex items-center ${isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
          {delta}% <span className="text-[10px] ml-1">{isPositive ? '▲' : '▼'}</span>
        </span>
      </div>
      <p className="text-[#666666] text-xs opacity-70 truncate">{subtext}</p>
    </div>
  );
};
