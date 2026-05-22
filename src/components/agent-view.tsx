"use client";

import type { ProposedAction } from "@/lib/types";
import type React from "react";

import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

interface AgentViewProps {
  agentData?: {
    id: string;
    name: string;
    task: string;
    currentMandate: {
      name: string;
      allowedVendors: string[];
      allowedUntilTime: string;
      allowedUntilDate: string;
      policyStatus: string;
      budgetRemaining: string | number;
    };
  };
  proposedActions?: ProposedAction[];
  isLoading?: boolean;
  onRunAction?: (actionId: string) => void;
}

/**
 * AgentView Component
 * High-fidelity agent console and mandate execution view.
 * Instrumented for backend integration with dynamic props and action handling.
 */
export const AgentView: React.FC<AgentViewProps> = ({
  agentData = {
    id: "a1",
    name: "Agent Alpha",
    task: "Find best market data source and purchase access...",
    currentMandate: {
      name: "Procurement - Market Research",
      allowedVendors: ["OpenAI API", "Tavily", "Perplexity API"],
      allowedUntilTime: "23:59 UTC",
      allowedUntilDate: "2026-05-20",
      policyStatus: "In Good Standing",
      budgetRemaining: 32,
    },
  },
  proposedActions = [
    { id: "pa1", desc: "1. Query Tavily for source shortlist", cost: 2.0 },
  ],
  isLoading,
  onRunAction,
}) => {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeTab="Agents" />

      <div className="flex-1 md:ml-72 p-4 md:p-10 flex flex-col min-h-screen relative">
        <TopNav onSearch={(q) => console.log("Search:", q)} />

        <main
          className={`max-w-5xl w-full mx-auto pb-32 ${isLoading ? "animate-pulse" : ""}`}
        >
          {/* Page Title */}
          <h2 className="text-3xl font-bold text-[#1F2937] mb-8">Agent View</h2>

          {/* 1. Outer Agent Panel Wrapper */}
          <section className="bg-white border border-[#E4ECE9] rounded-xl p-8 shadow-sm mb-10">
            <div className="space-y-6 mb-10">
              <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                <span className="text-[#475569] text-sm font-medium">
                  Agent Console
                </span>
                <div className="text-[#1F2937] font-bold text-lg">
                  {agentData.name}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-4">
                <span className="text-[#475569] text-sm font-medium mt-1">
                  Task
                </span>
                <div className="text-[#1F2937] font-bold leading-relaxed">
                  {agentData.task}
                </div>
              </div>
            </div>

            {/* 2. Inner "Current Mandate" Box */}
            <div className="bg-white border border-[#E4ECE9] rounded-lg overflow-hidden">
              <div className="bg-[#F7FAF9]/50 px-6 py-3 border-b border-[#E4ECE9]">
                <h3 className="text-sm font-bold text-[#1F2937]">
                  Current Mandate
                </h3>
              </div>

              <div className="p-6 flex gap-10">
                {/* Visual Card Box - Empty structural container */}
                <div
                  className="w-48 h-32 bg-white rounded-xl border border-[#E4ECE9]"
                  aria-hidden="true"
                />

                {/* Metadata Grid */}
                <div className="flex-1 grid grid-cols-[180px_1fr] gap-y-4 items-center">
                  <span className="text-[#475569] text-sm font-medium">
                    Allowed Vendors
                  </span>
                  <span className="text-[#1F2937] font-bold text-sm">
                    {agentData.currentMandate.allowedVendors.join(", ")}
                  </span>

                  <span className="text-[#475569] text-sm font-medium">
                    Allowed Until
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#1F2937] font-mono font-bold text-sm">
                      {agentData.currentMandate.allowedUntilTime}
                    </span>
                    <span className="text-[#1F2937] font-bold text-sm">
                      {agentData.currentMandate.allowedUntilDate}
                    </span>
                  </div>

                  <span className="text-[#475569] text-sm font-medium">
                    Policy Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1F2937] font-bold text-sm">
                      {agentData.currentMandate.policyStatus}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${agentData.currentMandate.policyStatus === "In Good Standing" ? "bg-[#22C55E]" : "bg-red-500"}`}
                      aria-hidden="true"
                    />
                  </div>

                  <span className="text-[#475569] text-sm font-medium">
                    Budget Remaining
                  </span>
                  <span className="text-[#1F2937] font-bold text-lg">
                    ${agentData.currentMandate.budgetRemaining}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* 3. Proposed Actions Sticky Tray */}
        <footer className="fixed bottom-0 left-72 right-0 bg-[#1F2937] p-6 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-50">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-white text-sm font-bold">Proposed Actions</h4>
              <span className="text-white text-sm">
                Cost: $
                {proposedActions
                  .reduce(
                    (sum, a) =>
                      sum +
                      (typeof a.cost === "string"
                        ? Number.parseFloat(a.cost)
                        : a.cost),
                    0,
                  )
                  .toFixed(2)}
              </span>
            </div>

            <div className="space-y-4">
              {proposedActions.length === 0 ? (
                <p className="text-white/60 text-sm italic py-4">
                  No actions proposed by the agent.
                </p>
              ) : (
                proposedActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between py-4 border-t border-white/10"
                  >
                    <p className="text-white text-sm font-medium">
                      {action.desc}
                    </p>
                    <button
                      type="button"
                      onClick={() => onRunAction?.(action.id)}
                      className="px-8 py-2 bg-white text-[#1F2937] text-sm font-bold rounded-lg hover:bg-gray-100 transition-all active:scale-95"
                    >
                      Run
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
