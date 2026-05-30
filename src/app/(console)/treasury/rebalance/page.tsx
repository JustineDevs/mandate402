"use client";

import type { Route } from "next";
import Link from "next/link";

import {
  ConsoleCard,
  ConsoleCodeSurface,
  ConsolePanel,
} from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { consoleSplitSection } from "@/lib/console-layout";

export default function TreasuryRebalancePage() {
  return (
    <OperatorGate
      title="Sign in to view rebalance"
      description="Rebalance controls are disabled until a production execution path is configured."
    >
      {() => (
        <ConsoleShell
          activeTab="Runtime"
          eyebrow="Runtime"
          title="Rebalance"
          summary="Cross-chain rebalance is not available in this build."
          heroTone="control"
          toolbar={<StatusPill label="Execution disabled" tone="warning" />}
        >
          <section className={consoleSplitSection("narrow")}>
            <ConsolePanel className="space-y-6 border-amber-200 bg-amber-50 sm:p-8">
              <SectionHeader
                eyebrow="Operational hold"
                title="Bridge execution is not available"
                description="Bridge quote and execution controls are hidden until quotes, expiry, signing, submission, and receipt tracking are backed by real runtime APIs."
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <ConsoleCard eyebrow="Quote source" value="not wired">
                  Bridge quotes must come from the selected provider API.
                </ConsoleCard>
                <ConsoleCard eyebrow="Execution path" value="disabled">
                  No treasury transaction is signed from this screen.
                </ConsoleCard>
                <ConsoleCard eyebrow="Status tracking" value="pending">
                  Bridge status needs persisted receipts before launch.
                </ConsoleCard>
              </div>

              <div className="flex flex-col gap-3 border-t border-amber-200 pt-6 sm:flex-row">
                <Link href={"/treasury" as Route}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Return to treasury status
                  </Button>
                </Link>
                <Button disabled className="w-full sm:w-auto">
                  Rebalance unavailable
                </Button>
              </div>
            </ConsolePanel>

            <ConsoleCodeSurface
              title="Before rebalance goes live"
              summary="Rebalance stays disabled until quotes, treasury authorization, and settlement receipts are wired end to end."
              className="min-w-0"
            >
              <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                <p>Live quote provider and route safety checks</p>
                <p>Operator authorization bound to the treasury wallet path</p>
                <p>Persisted transaction hash, provider status, and receipt</p>
                <p>Clear failure state when execution is unknown or partial</p>
              </div>
            </ConsoleCodeSurface>
          </section>
        </ConsoleShell>
      )}
    </OperatorGate>
  );
}
