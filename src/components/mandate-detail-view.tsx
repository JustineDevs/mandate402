"use client";

import type { Activity, MandateStatus, TransactionStatus } from "@/lib/types";
import type React from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

interface MandateDetailViewProps {
  mandate?: {
    id: string;
    name: string;
    approvedVendors: string[];
    categories: string[];
    softLimit: string | number;
    status: MandateStatus;
    agent: string;
    budgetUsed: string | number;
    budgetTotal: string | number;
    expiresIn: string;
  };
  activities?: Activity[];
  isLoading?: boolean;
  onPause?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRevoke?: (id: string) => void;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
}

const transactionStatusColorMap: Record<TransactionStatus, string> = {
  Success: "#22C55E",
  Blocked: "#EF4444",
};

/**
 * MandateDetailView Component
 * High-fidelity detail screen for a specific mandate.
 * Instrumented for backend integration with dynamic props and color mapping.
 */
export const MandateDetailView: React.FC<MandateDetailViewProps> = ({
  mandate = {
    id: "m1",
    name: "Procurement - Market Research",
    approvedVendors: ["OpenAI API", "Tavily", "Perplexity API"],
    categories: ["Data / Research", "AI APIs"],
    softLimit: 20,
    status: "Active",
    agent: "Agent Alpha",
    budgetUsed: 18,
    budgetTotal: 50,
    expiresIn: "2 days",
  },
  activities = [],
  isLoading,
  onPause,
  onEdit,
  onRevoke,
  onExportCsv,
  onExportPdf,
}) => {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeTab="Mandates" />

      <div className="flex-1 md:ml-72 p-4 md:p-10 flex flex-col min-h-screen relative">
        <TopNav onSearch={(q) => console.log("Search:", q)} />

        <main className="max-w-5xl w-full mx-auto pb-32">
          {/* 1. Mandate Detail Container */}
          <section
            className={`bg-white border border-[#E4ECE9] rounded-xl shadow-sm overflow-hidden mb-10 ${isLoading ? "animate-pulse" : ""}`}
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-2xl font-bold text-[#1F2937]">
                  Mandate Detail
                </h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onPause?.(mandate.id)}
                    className="px-5 py-2 bg-white border border-[#1F2937] text-[#1F2937] text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit?.(mandate.id)}
                    className="px-5 py-2 bg-white border border-[#1F2937] text-[#1F2937] text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    [E] Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRevoke?.(mandate.id)}
                    className="px-5 py-2 bg-[#1F2937] text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-black transition-colors"
                  >
                    <span className="text-xs" aria-hidden="true">
                      ✕
                    </span>{" "}
                    [X] Revoke
                  </button>
                </div>
              </div>

              <div className="flex gap-12">
                {/* Visual Card Placeholder */}
                <div
                  className="w-48 h-32 bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                  aria-hidden="true"
                >
                  [Visual] Card
                </div>

                {/* Data Fields */}
                <div className="flex-1 grid grid-cols-[180px_1fr] gap-y-4">
                  <span className="text-[#666666] text-sm font-medium">
                    Mandate Name
                  </span>
                  <span className="text-[#1F2937] font-bold">
                    {mandate.name}
                  </span>

                  <span className="text-[#666666] text-sm font-medium">
                    Approved vendors
                  </span>
                  <span className="text-[#1F2937] font-bold">
                    {mandate.approvedVendors.join(", ")}
                  </span>

                  <span className="text-[#666666] text-sm font-medium">
                    Categories
                  </span>
                  <span className="text-[#1F2937] font-bold">
                    {mandate.categories.join(", ")}
                  </span>

                  <span className="text-[#666666] text-sm font-medium">
                    Per-payment soft limit
                  </span>
                  <span className="text-[#1F2937] font-bold">
                    ${mandate.softLimit}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Status Banner */}
            <div className="grid grid-cols-4 border-t border-[#E4ECE9] bg-[#F7FAF9]/30">
              <div className="px-6 py-4 flex flex-col gap-1 border-r border-[#E4ECE9]">
                <span className="text-[10px] uppercase tracking-wider text-[#666666] font-bold">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${mandate.status === "Active" ? "bg-[#22C55E]" : "bg-red-500"}`}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold text-[#1F2937]">
                    {mandate.status}
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 flex flex-col gap-1 border-r border-[#E4ECE9]">
                <span className="text-[10px] uppercase tracking-wider text-[#666666] font-bold">
                  Agent
                </span>
                <span className="text-sm font-bold text-[#1F2937]">
                  {mandate.agent}
                </span>
              </div>
              <div className="px-6 py-4 flex flex-col gap-1 border-r border-[#E4ECE9]">
                <span className="text-[10px] uppercase tracking-wider text-[#666666] font-bold">
                  Budget Used
                </span>
                <span className="text-sm font-bold text-[#1F2937]">
                  ${mandate.budgetUsed} / ${mandate.budgetTotal}
                </span>
              </div>
              <div className="px-6 py-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[#666666] font-bold">
                  Expires
                </span>
                <span className="text-sm font-bold text-[#1F2937]">
                  {mandate.expiresIn}
                </span>
              </div>
            </div>
          </section>

          {/* 2. Activity Timeline Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#1F2937]">
              Activity Timeline
            </h3>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4ECE9] rounded-lg text-sm text-[#1F2937] focus:outline-none"
                aria-label="Search activities"
              />
            </div>
            <div className="flex items-center gap-2 bg-[#F7FAF9] border border-[#E4ECE9] px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex -space-x-1" aria-hidden="true">
                <div className="w-3 h-3 rounded-full bg-blue-400 border border-white" />
                <div className="w-3 h-3 rounded-full bg-green-400 border border-white" />
                <div className="w-3 h-3 rounded-full bg-orange-400 border border-white" />
              </div>
              <span className="text-sm font-bold text-[#1F2937]">
                Category 5/11
              </span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Activity Timeline List */}
          <div className="bg-white border border-[#E4ECE9] rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-[#E4ECE9]">
              {activities.length === 0 ? (
                <div className="p-10 text-center text-[#666666] text-sm italic">
                  No activity recorded for this mandate.
                </div>
              ) : (
                activities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-8">
                      <span className="text-sm text-[#666666] font-medium w-20">
                        {item.time}
                      </span>
                      <span className="text-sm text-[#1F2937] font-bold">
                        {item.desc}
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="text-sm font-bold text-[#1F2937]">
                        {item.amount}
                      </span>
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              transactionStatusColorMap[item.status],
                          }}
                          aria-hidden="true"
                        />
                        <span className="text-[10px] font-bold text-[#475569] uppercase tracking-tight">
                          {item.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-gray-300 group-hover:text-gray-500"
                        aria-label="Transaction details"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* 3. Receipts Shelf (Bottom Overlay) */}
        <footer className="fixed bottom-0 left-72 right-0 bg-[#1F2937] p-6 flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-50">
          <div className="flex items-center gap-10">
            <div>
              <h4 className="text-white text-sm font-bold mb-1">Receipts</h4>
              <p className="text-white/60 text-xs font-medium">2/11 Selected</p>
            </div>
            <div className="flex gap-4" aria-label="Selected receipts">
              <button
                type="button"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors"
              >
                Receipt #1842
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors"
              >
                Receipt #1843
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onExportCsv}
              className="px-6 py-2.5 bg-transparent border border-white/40 text-white text-sm font-bold rounded-lg hover:bg-white/5 transition-colors"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              className="px-6 py-2.5 bg-transparent border border-white/40 text-white text-sm font-bold rounded-lg hover:bg-white/5 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
