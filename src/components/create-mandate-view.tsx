"use client";

import type React from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

/**
 * CreateMandateView Component
 * Orchestrates the mandate creation page
 * Adheres to strict hex color and alignment rules
 */
export const CreateMandateView: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Column 1: Sticky Sidebar */}
      <Sidebar activeTab="Mandates" />

      {/* Column 2: Wide Content Canvas */}
      <div className="flex-1 md:ml-64 p-4 md:p-10 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Navigation Header */}
        <TopNav />

        {/* Main Content Area */}
        <main className="max-w-4xl">
          <h2 className="text-3xl font-bold text-[#222222] mb-10">
            Create New Mandate
          </h2>

          <div className="space-y-8">
            {/* Mandate Data Card 1 */}
            <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="grid grid-cols-[200px_1fr] gap-y-6">
                {/* Mandate Name */}
                <div className="text-[#666666] font-medium">Mandate Name</div>
                <div className="text-[#222222] font-semibold">
                  Procurement - Market Research
                </div>

                {/* Assigned Agent */}
                <div className="text-[#666666] font-medium">Assigned Agent</div>
                <div className="text-[#222222] font-semibold">Agent Alpha</div>

                {/* Task / Purpose */}
                <div className="text-[#666666] font-medium">Task / Purpose</div>
                <div className="text-[#222222] leading-relaxed">
                  Find and purchase research/report/API access
                </div>
              </div>

              {/* Whitespace break before budgetary controls */}
              <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-[200px_1fr] gap-y-6">
                {/* Budget Type */}
                <div className="text-[#666666] font-medium self-center">
                  Budget Type
                </div>
                <div className="relative max-w-xs">
                  <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#15803D]/10">
                    <option>Fixed Cap</option>
                    <option>Usage-Based Ceiling</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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

                {/* Max Spend */}
                <div className="text-[#666666] font-medium">Max Spend</div>
                <div className="text-2xl font-bold text-[#222222]">$50.00</div>

                {/* Expiry */}
                <div className="text-[#666666] font-medium">Expiry</div>
                <div className="flex items-center gap-4 text-[#222222]">
                  <span className="bg-gray-50 px-3 py-1 rounded border border-gray-200 text-sm">
                    2026-05-20
                  </span>
                  <span className="font-mono font-medium text-sm">
                    23:59 UTC
                  </span>
                </div>
              </div>
            </section>

            {/* Mandate Data Card 2 (Duplicate for visual reference consistency) */}
            <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm opacity-60">
              <div className="grid grid-cols-[200px_1fr] gap-y-6">
                <div className="text-[#666666] font-medium">Mandate Name</div>
                <div className="text-[#222222] font-semibold">
                  Ops Agent - Cloud Spend
                </div>

                <div className="text-[#666666] font-medium">Assigned Agent</div>
                <div className="text-[#222222] font-semibold">Agent Gamma</div>

                <div className="text-[#666666] font-medium">Task / Purpose</div>
                <div className="text-[#222222] leading-relaxed">
                  Manage infrastructure and deployment costs
                </div>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex items-center justify-end gap-4">
            <button className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Cancel
            </button>
            <button className="px-8 py-2.5 bg-[#15803D] text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all active:scale-95 shadow-md">
              Create Mandate
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
