"use client";

import type { Route } from "next";
import Link from "next/link";

import { ConsoleCard, ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/operator-view-model";

export default function BuildPage() {
  return (
    <OperatorGate
      title="Treasury and system status"
      description="Review system readiness, spend posture, and unresolved incidents in the protected operator console."
    >
      {({ data }) => {
        const status = data.dashboard.systemStatus;

        return (
          <ConsoleShell
            activeTab="Treasury"
            eyebrow="Treasury & Runtime"
            title="Treasury Status"
            summary="This is the safety-control-room view for treasury posture: how much is in motion, what is degraded, and whether the system is ready to trust a machine payment."
            heroTone="control"
            actions={
              <div className="flex gap-2">
                <Link href={"/build/rebalance" as Route}>
                  <Button className="rounded-full bg-white font-bold text-brand-control hover:bg-white/90">
                    Rebalance Treasury
                  </Button>
                </Link>
              </div>
            }
            toolbar={
              <>
                <StatusPill
                  label={status.status}
                  tone={status.status === "ok" ? "success" : "warning"}
                />
                <StatusPill
                  label={`${status.staleUnknownAttempts} Stale Unknown`}
                  tone={status.staleUnknownAttempts > 0 ? "danger" : "success"}
                />
              </>
            }
          >
            <div className="grid gap-6 lg:grid-cols-4">
              <ConsoleCard
                eyebrow="Reserved + Consumed"
                value={formatUsd(
                  data.dashboard.metrics.spendReservedPlusConsumed,
                )}
              >
                Visible treasury exposure across active mandates.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Queued Attempts"
                value={String(status.queuedAttempts)}
              >
                Attempts still waiting for a worker decision.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Queued Reconciliation"
                value={String(status.queuedReconciliationTasks)}
              >
                Attempts still waiting for final charge truth.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Live Mandates"
                value={String(data.dashboard.metrics.liveMandates)}
              >
                Spending lanes that can still authorize a payment.
              </ConsoleCard>
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
                <SectionHeader
                  eyebrow="Runtime posture"
                  title="System readiness"
                  description="Non-crypto operators can read this as a control-room checklist instead of parsing raw environment flags."
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
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Unknown window
                    </div>
                    <div className="mt-2 text-lg font-bold text-charcoal">
                      {status.unknownAttemptEscalationMinutes} min
                    </div>
                  </div>
                </div>
              </div>

              <ConsoleCodeSurface title="Treasury note">
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>
                    reserved funds are approved spend waiting for a final
                    settlement answer
                  </p>
                  <p>consumed funds are spend already confirmed as charged</p>
                  <p>
                    vendor runtime is degraded if named primary endpoints are
                    missing or still local-only in production
                  </p>
                  <p>
                    stale unknown attempts are the main operator signal that a
                    payment still needs human attention
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
