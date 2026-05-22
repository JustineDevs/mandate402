"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { RecentMandatesCard } from "./recent-mandates-card";
import { RecentTransactionsCard } from "./recent-transactions-card";
import { SpendByAgentCard } from "./spend-by-agent-card";
import { KpiCard } from "./kpi-card";
import type { KpiData, AgentSpend, Mandate, Transaction } from "@/lib/types";

/**
 * Dashboard Component
 * Precise match to ASCII blueprint and design tokens.
 * Logic-ready: Orchestrates data fetching and hydrates child components via props.
 */
export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock State for dynamic data hydration
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [agentSpends, setAgentSpends] = useState<AgentSpend[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setKpis([
        { title: "Active Mandates", value: 12, delta: 26, isPositive: true, subtext: "Across procurement...", tooltipText: "Active smart contracts currently executing mandates" },
        { title: "Spend Today", value: "$1,248", delta: 26, isPositive: true, subtext: "Net authorized x402...", tooltipText: "Total value settled in the last 24 hours" },
        { title: "Policy Blocks", value: 7, delta: 26, isPositive: true, subtext: "Denied before", tooltipText: "Transactions automatically prevented by policy engine" },
      ]);
      setAgentSpends([
        { id: "a1", agentName: "Agent 1", spend: 420, max: 600 },
        { id: "a2", agentName: "Agent 2", spend: 310, max: 600 },
        { id: "a3", agentName: "Agent 3", spend: 580, max: 600 },
      ]);
      setMandates([
        { id: "m1", name: "Procurement Agent", status: "Active" },
        { id: "m2", name: "Ops Agent", status: "Expiring" },
        { id: "m3", name: "Research Agent", status: "Revoked" },
      ]);
      setTransactions([
        { id: "tx1", vendor: "OpenAI", amount: "$12", status: "Success" },
        { id: "tx2", vendor: "OpenAI API", amount: "$12", status: "Blocked" },
        { id: "tx3", vendor: "Vendor", amount: "$53", status: "Success" },
        { id: "tx4", vendor: "OpenAI", amount: "$12", status: "Success" },
      ]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Navigation */}
      <Sidebar activeTab="Dashboard" />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 p-4 md:p-10 flex flex-col min-h-screen">
        <TopNav 
          userAddress="0x5124124...124" 
          onSearch={(q) => console.log('Dashboard search:', q)} 
        />

        <main className="max-w-6xl w-full mx-auto">
          {/* Dashboard Header */}
          <h2 className="text-3xl font-bold text-[#1F2937] mb-8">
            Dashboard
          </h2>

          {/* Top Metric Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              [1, 2, 3].map(i => <KpiCard key={i} title="" value="" delta={0} isPositive={true} subtext="" isLoading={true} />)
            ) : (
              kpis.map((kpi, idx) => <KpiCard key={idx} {...kpi} />)
            )}
          </div>

          {/* Spend by Agent Large Card */}
          <SpendByAgentCard 
            agentSpends={agentSpends} 
            isLoading={isLoading} 
            onAgentClick={(id) => console.log('Agent clicked:', id)}
          />

          {/* Bottom Grid: Recent Mandates & Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">
            <RecentMandatesCard 
              mandates={mandates} 
              isLoading={isLoading} 
              onMoreClick={() => console.log('More mandates')}
            />
            <RecentTransactionsCard 
              transactions={transactions} 
              isLoading={isLoading} 
              onMoreClick={() => console.log('More transactions')}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
