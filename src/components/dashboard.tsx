"use client";

import type React from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

/**
 * Integrated Dashboard Page
 * Uses modular Sidebar and TopNav
 */

// --- Data ---
const metrics = {
  activeMandates: 12,
  spendToday: 1248,
  policyBlocks: 7,
};

const agentSpends = [
  { name: "Agent Alpha", amount: 420, max: 500, percentage: 84 },
  { name: "Agent Beta", amount: 260, max: 500, percentage: 52 },
  { name: "Agent Gamma", amount: 140, max: 500, percentage: 28 },
];

const recentMandates = [
  { id: "1", name: "Procurement Agent", agent: "Alpha", status: "Active" },
  { id: "2", name: "Research Agent", agent: "Beta", status: "Expiring" },
  { id: "3", name: "Ops Agent", agent: "Gamma", status: "Revoked" },
];

const recentTransactions = [
  {
    id: "tx1",
    vendor: "OpenAI API",
    amount: 12,
    status: "Success",
    timestamp: "10:48 AM",
  },
  {
    id: "tx2",
    vendor: "Tavily",
    amount: 4,
    status: "Success",
    timestamp: "10:42 AM",
  },
  {
    id: "tx3",
    vendor: "Vendor X",
    amount: 18,
    status: "Blocked",
    timestamp: "11:02 AM",
  },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#F7FAF9]">
      {/* Sidebar Navigation */}
      <Sidebar activeTab="Dashboard" />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 p-4 md:p-10 flex flex-col min-h-screen">
        <TopNav />

        <main>
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F1720]">
              Overview
            </h2>
            <a
              href="/mandates"
              className="px-5 py-2.5 bg-[#15803D] text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all active:scale-95"
            >
              Create Mandate
            </a>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-7 rounded-xl border border-[#E4ECE9] shadow-sm">
              <p className="text-[#64748B] text-sm font-medium mb-2">
                Active Mandates
              </p>
              <p className="text-4xl font-bold text-[#0F1720]">
                {metrics.activeMandates}
              </p>
            </div>
            <div className="bg-white p-7 rounded-xl border border-[#E4ECE9] shadow-sm">
              <p className="text-[#64748B] text-sm font-medium mb-2">
                Spend Today
              </p>
              <p className="text-4xl font-bold text-[#0F1720]">
                ${metrics.spendToday.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-7 rounded-xl border border-[#E4ECE9] shadow-sm">
              <p className="text-[#64748B] text-sm font-medium mb-2">
                Policy Blocks
              </p>
              <p className="text-4xl font-bold text-[#0F1720]">
                {metrics.policyBlocks}
              </p>
            </div>
          </div>

          {/* Spend Section */}
          <section className="bg-white rounded-xl border border-[#E4ECE9] p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-[#0F1720]">
                Spend by Agent
              </h3>
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                USD Equivalent
              </span>
            </div>
            <div className="space-y-8">
              {agentSpends.map((agent) => (
                <div key={agent.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-[#1F2937]">
                      {agent.name}
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-[#0F1720]">
                        ${agent.amount}
                      </span>
                      <span className="text-xs text-[#64748B]">
                        / ${agent.max}
                      </span>
                    </div>
                  </div>
                  <div className="h-3.5 w-full bg-[#F7FAF9] rounded-full overflow-hidden border border-[#E4ECE9]/50 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#22C55E] to-red-500 rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${agent.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Mandates Table */}
            <div className="bg-white rounded-xl border border-[#E4ECE9] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E4ECE9] bg-[#F7FAF9]/50 flex items-center justify-between">
                <h3 className="font-bold text-[#1F2937]">Recent Mandates</h3>
                <button className="text-xs font-bold text-[#15803D] hover:underline">
                  View All
                </button>
              </div>
              <div className="divide-y divide-[#E4ECE9]">
                {recentMandates.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-5 hover:bg-[#F7FAF9] transition-colors cursor-pointer group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1F2937] group-hover:text-[#15803D] transition-colors">
                        {m.name}
                      </span>
                      <span className="text-xs text-[#64748B]">
                        Agent {m.agent}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        m.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : m.status === "Expiring"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          m.status === "Active"
                            ? "bg-green-500"
                            : m.status === "Expiring"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                      />
                      {m.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-[#E4ECE9] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E4ECE9] bg-[#F7FAF9]/50 flex items-center justify-between">
                <h3 className="font-bold text-[#1F2937]">
                  Recent Transactions
                </h3>
                <button className="text-xs font-bold text-[#15803D] hover:underline">
                  Export Logs
                </button>
              </div>
              <div className="divide-y divide-[#E4ECE9]">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-5 hover:bg-[#F7FAF9] transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1F2937]">
                        {tx.vendor}
                      </span>
                      <span className="text-xs font-mono text-[#64748B]">
                        TX ID: {tx.id.toUpperCase()} • {tx.timestamp}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-bold text-sm">${tx.amount}</span>
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                          tx.status === "Success"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${tx.status === "Success" ? "bg-green-500" : "bg-red-500"}`}
                        />
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
