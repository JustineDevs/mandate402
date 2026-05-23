"use client";

import type { ProposedAction } from "@/lib/types";
import type React from "react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
 * Agent console and proposed actions (wireframe).
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
  const totalCost = useMemo(
    () =>
      proposedActions
        .reduce(
          (sum, action) =>
            sum +
            (typeof action.cost === "string"
              ? Number.parseFloat(action.cost)
              : action.cost),
          0,
        )
        .toFixed(2),
    [proposedActions],
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeTab="Agents" />

      <div className="relative flex min-h-screen flex-1 flex-col p-4 md:ml-72 md:p-10">
        <TopNav />

        <main
          className={`mx-auto w-full max-w-5xl pb-32 ${isLoading ? "animate-pulse" : ""}`}
        >
          <h2 className="mb-8 text-3xl font-bold text-charcoal">Agent View</h2>

          <Card className="mb-10 shadow-sm">
            <CardHeader>
              <CardTitle>Agent console</CardTitle>
              <CardDescription>
                Live task context for {agentData.name}. Mandate boundaries apply
                to every proposed action below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                <Label className="text-slate">Agent</Label>
                <div className="text-lg font-bold text-charcoal">
                  {agentData.name}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-4">
                <Label className="mt-1 text-slate">Task</Label>
                <div className="font-bold leading-relaxed text-charcoal">
                  {agentData.task}
                </div>
              </div>
            </CardContent>

            <Separator />

            <Card className="mx-6 mb-6 overflow-hidden border border-border shadow-none sm:mx-8">
              <CardHeader className="border-b border-border bg-muted/40 py-3">
                <CardTitle className="text-sm">Current mandate</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-8 p-6 sm:flex-row sm:gap-10">
                <div
                  className="h-32 w-full shrink-0 rounded-lg border border-border bg-card sm:w-48"
                  aria-hidden="true"
                />

                <div className="grid flex-1 grid-cols-[180px_1fr] items-center gap-y-4">
                  <Label className="text-slate">Mandate</Label>
                  <span className="text-sm font-bold text-charcoal">
                    {agentData.currentMandate.name}
                  </span>

                  <Label className="text-slate">Allowed vendors</Label>
                  <span className="text-sm font-bold text-charcoal">
                    {agentData.currentMandate.allowedVendors.join(", ")}
                  </span>

                  <Label className="text-slate">Allowed until</Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold text-charcoal">
                      {agentData.currentMandate.allowedUntilTime}
                    </span>
                    <span className="text-sm font-bold text-charcoal">
                      {agentData.currentMandate.allowedUntilDate}
                    </span>
                  </div>

                  <Label className="text-slate">Policy status</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-charcoal">
                      {agentData.currentMandate.policyStatus}
                    </span>
                    <div
                      className={`h-2 w-2 rounded-full ${agentData.currentMandate.policyStatus === "In Good Standing" ? "bg-primary" : "bg-destructive"}`}
                      aria-hidden="true"
                    />
                  </div>

                  <Label className="text-slate">Budget remaining</Label>
                  <span className="text-lg font-bold text-charcoal">
                    ${agentData.currentMandate.budgetRemaining}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Card>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-hairline-dark bg-canvas-dark p-6 text-on-dark shadow-[0_-8px_30px_rgba(15,23,32,0.18)] md:left-72">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-sm font-bold text-on-dark">
                Proposed Actions
              </h4>
              <span className="text-sm text-on-dark-muted">
                Cost: ${totalCost}
              </span>
            </div>

            <div>
              {proposedActions.length === 0 ? (
                <p className="py-4 text-sm italic text-on-dark-muted">
                  No actions proposed by the agent.
                </p>
              ) : (
                <div className="divide-y divide-on-dark/15">
                  {proposedActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-sm font-medium text-on-dark">
                        {action.desc}
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0 bg-canvas font-bold text-charcoal hover:bg-surface-soft"
                        onClick={() => onRunAction?.(action.id)}
                      >
                        Run
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
