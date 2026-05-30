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
import { ProductionReadinessPanel } from "@/components/production-readiness-panel";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button, buttonVariants } from "@/components/ui/button";
import { consoleSplitSection, consoleStatGrid4 } from "@/lib/console-layout";
import { formatUsd, runtimeStatusTone } from "@/lib/operator-view-model";
import { formatReadinessStatusLabel } from "@/lib/readiness-display-labels";
import { cn } from "@/lib/utils";

export default function TreasuryPage() {
  return (
    <OperatorGate
      title="Sign in to view runtime status"
      description="Review spend exposure, queues, and system readiness."
    >
      {({ data }) => {
        const status = data.dashboard.systemStatus;

        return (
          <ConsoleShell
            activeTab="Runtime"
            eyebrow="Runtime"
            title="System status"
            summary="Reserved spend, queue depth, and readiness checks for treasury operations. Wallet linking is under Settings."
            heroTone="control"
            actions={
              <div className="flex flex-wrap gap-2">
                <Link
                  href={"/settings?treasury=1" as Route}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "rounded-full border-white/30 bg-white/10 font-semibold text-on-dark hover:bg-white/20",
                  )}
                >
                  Wallet settings
                </Link>
                <Button
                  disabled
                  className="rounded-full bg-white font-bold text-brand-control hover:bg-white/90"
                >
                  Rebalance unavailable
                </Button>
              </div>
            }
            toolbar={
              <>
                <StatusPill
                  label={formatReadinessStatusLabel(status.readiness.status)}
                  humanize={false}
                  tone={runtimeStatusTone(status.readiness.status)}
                />
                <StatusPill
                  label={`${status.staleUnknownAttempts} charges need review`}
                  humanize={false}
                  tone={status.staleUnknownAttempts > 0 ? "danger" : "success"}
                />
              </>
            }
          >
            <div className={consoleStatGrid4()}>
              <ConsoleCard
                eyebrow="Reserved and consumed"
                value={formatUsd(
                  data.dashboard.metrics.spendReservedPlusConsumed,
                )}
              >
                Treasury exposure across active mandates.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Queued attempts"
                value={String(status.queuedAttempts)}
                humanizeValue={false}
              >
                Attempts waiting for a worker decision.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Queued reconciliation"
                value={String(status.queuedReconciliationTasks)}
              >
                Attempts waiting for final charge status.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Live mandates"
                value={String(data.dashboard.metrics.liveMandates)}
              >
                Mandates that can still authorize payments.
              </ConsoleCard>
            </div>

            <ProductionReadinessPanel readiness={status.readiness} />

            <section className={consoleSplitSection("runtime")}>
              <ConsolePanel>
                <SectionHeader
                  eyebrow="Readiness"
                  title="Runtime checks"
                  description="Summary of integrity, chain, vendor, and worker state."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Integrity
                    </div>
                    <div className="mt-2">
                      <StatusPill
                        label={status.integrity.status}
                        tone={
                          status.integrity.status === "ok"
                            ? "success"
                            : "danger"
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Blockchain
                    </div>
                    <div className="mt-2">
                      <StatusPill
                        label={status.blockchain.status}
                        tone={
                          status.blockchain.status === "ready"
                            ? "success"
                            : "warning"
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Vendor runtime
                    </div>
                    <div className="mt-2">
                      <StatusPill
                        label={
                          status.vendorRuntime.primaryConfigured &&
                          status.vendorRuntime.localOnlyPrimaryVendors
                            .length === 0
                            ? "ready"
                            : "degraded"
                        }
                        tone={
                          status.vendorRuntime.primaryConfigured &&
                          status.vendorRuntime.localOnlyPrimaryVendors
                            .length === 0
                            ? "success"
                            : "warning"
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Worker tasks
                    </div>
                    <div className="mt-2 text-lg font-bold text-charcoal">
                      {status.workerTasks}
                    </div>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4 sm:col-span-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Unknown escalation window
                    </div>
                    <div className="mt-2 text-lg font-bold text-charcoal">
                      {status.unknownAttemptEscalationMinutes} min
                    </div>
                  </div>
                </div>
              </ConsolePanel>

              <ConsoleCodeSurface
                title="Treasury notes"
                summary="Reserved is approved spend awaiting settlement; consumed is spend confirmed as charged."
                className="min-w-0"
              >
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>
                    Vendor runtime is degraded when primary endpoints are
                    missing or still local-only in production.
                  </p>
                  <p>
                    Charges marked unknown need operator review when settlement
                    truth is still unresolved.
                  </p>
                </div>
              </ConsoleCodeSurface>
            </section>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
