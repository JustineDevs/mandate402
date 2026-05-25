"use client";

import { ConsoleCard, ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";

export default function SettingsPage() {
  return (
    <OperatorGate
      title="Operator settings"
      description="Review the current operator session posture, fallback policy state, and runtime degradation signals from real data."
    >
      {({ data, message }) => {
        const status = data.dashboard.systemStatus;
        const fallbackGate = data.dashboard.fallbackGate;
        const incidentCount = data.dashboard.incidents.length;

        return (
          <ConsoleShell
            activeTab="Settings"
            eyebrow="Operator Settings"
            title="Settings & Session Posture"
            summary="This screen is limited to live operator and runtime state. It does not pretend to be a writable configuration panel."
            heroTone="control"
            actions={
              <>
                <StatusPill
                  label={status.status}
                  tone={status.status === "ok" ? "success" : "warning"}
                />
                <StatusPill
                  label={`${incidentCount} Incidents`}
                  tone={incidentCount > 0 ? "warning" : "success"}
                />
              </>
            }
          >
            <div className="grid gap-6 lg:grid-cols-3">
              <ConsoleCard eyebrow="Operator Role" value={data.operator.role}>
                Access remains bounded by the authenticated Supabase operator
                profile.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Wallet Preference"
                value={data.operator.preferredWalletProvider ?? "not linked"}
              >
                The linked treasury path is shown here from the operator access
                contract, not from static UI defaults.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Fallback Gate"
                value={fallbackGate.decision_status}
              >
                Wrapper fallback remains governed by the tracked gate artifact
                and its recorded evidence.
              </ConsoleCard>
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
                <SectionHeader
                  eyebrow="Live posture"
                  title="Current runtime and operator state"
                  description="This section is read-only and only reflects values already enforced elsewhere in the app."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Operator onboarding
                    </div>
                    <div className="mt-2">
                      <StatusPill
                        label={data.operator.onboardingState ?? "unknown"}
                        tone={
                          data.operator.onboardingState === "complete"
                            ? "success"
                            : "warning"
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Runtime status
                    </div>
                    <div className="mt-2">
                      <StatusPill
                        label={status.status}
                        tone={status.status === "ok" ? "success" : "warning"}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Preferred treasury mode
                    </div>
                    <div className="mt-2 text-lg font-bold text-charcoal">
                      {data.operator.preferredTreasuryMode ?? "not linked"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                      Stale unknown attempts
                    </div>
                    <div className="mt-2 text-lg font-bold text-charcoal">
                      {status.staleUnknownAttempts}
                    </div>
                  </div>
                </div>
              </div>

              <ConsoleCodeSurface title="Operator setting note">
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>this page is intentionally read-only</p>
                  <p>
                    runtime truth comes from live system status and fallback
                    gate state
                  </p>
                  <p>
                    treasury preferences come from the linked operator access
                    contract
                  </p>
                  <p>{message}</p>
                </div>
              </ConsoleCodeSurface>
            </section>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
