"use client";

import type { Route } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

import { ConsoleCard, StatusField } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import type { DashboardPayload } from "@/components/operator-gate";
import { ProductionReadinessPanel } from "@/components/production-readiness-panel";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { consoleStatGrid3, consoleStatGrid4 } from "@/lib/console-layout";
import {
  formatFallbackGateStatus,
  formatOnboardingState,
  formatOperatorRole,
  formatTreasuryMode,
  formatWalletProvider,
  onboardingStateTone,
  runtimeStatusTone,
} from "@/lib/operator-display-labels";

const TreasuryConnectionPanel = dynamic(
  () =>
    import("@/components/treasury-connection-panel").then(
      (mod) => mod.TreasuryConnectionPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
        <p className="text-sm text-slate">Loading treasury wallet settings…</p>
      </section>
    ),
  },
);

type OperatorSettingsWorkspaceProps = {
  data: DashboardPayload;
  message: string;
  focusTreasury?: boolean;
  onTreasuryLinked?: () => void;
};

export function OperatorSettingsWorkspace({
  data,
  message,
  focusTreasury = false,
  onTreasuryLinked,
}: OperatorSettingsWorkspaceProps) {
  const status = data.dashboard.systemStatus;
  const fallbackGate = data.dashboard.fallbackGate;
  const incidentCount = data.dashboard.incidents.length;
  const onboardingState = data.operator.onboardingState;
  const onboardingComplete = onboardingState === "complete";

  return (
    <ConsoleShell
      activeTab="Settings"
      eyebrow="Settings"
      title="Account and runtime"
      summary="Session details, treasury wallet, and live system status for the signed-in operator."
      heroTone="control"
      actions={
        <>
          <StatusPill
            label={status.status}
            tone={runtimeStatusTone(status.status)}
          />
          <StatusPill
            label={onboardingComplete ? "Wallet linked" : "Wallet not linked"}
            humanize={false}
            tone={onboardingComplete ? "success" : "warning"}
          />
          {incidentCount > 0 ? (
            <StatusPill
              label={`${incidentCount} open incidents`}
              humanize={false}
              tone="warning"
            />
          ) : null}
        </>
      }
    >
      <div className="space-y-10">
        <section aria-labelledby="runtime-overview-heading">
          <SectionHeader
            eyebrow="Overview"
            title="Runtime summary"
            description="Read-only values from the operator profile and system status."
            actions={
              <Link
                href={"/treasury" as Route}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-canvas px-4 text-sm font-semibold text-charcoal transition-colors hover:bg-surface-soft"
              >
                Full runtime status
              </Link>
            }
          />

          <div className={consoleStatGrid3()}>
            <ConsoleCard
              eyebrow="Role"
              value={formatOperatorRole(data.operator.role)}
              humanizeValue={false}
            >
              Access is scoped to the signed-in operator profile.
            </ConsoleCard>
            <ConsoleCard
              eyebrow="Wallet provider"
              value={formatWalletProvider(
                data.operator.preferredWalletProvider,
              )}
              humanizeValue={false}
            >
              Preferred treasury connection type from your profile.
            </ConsoleCard>
            <ConsoleCard
              eyebrow="Fallback gate"
              value={formatFallbackGateStatus(fallbackGate.decision_status)}
              humanizeValue={false}
            >
              Wrapper fallback state from the tracked gate record.
            </ConsoleCard>
          </div>
        </section>

        <section aria-labelledby="runtime-detail-heading">
          <SectionHeader
            eyebrow="Status"
            title="Live fields"
            description="Current onboarding, runtime health, and reconciliation signals."
          />

          <div className={consoleStatGrid4()}>
            <StatusField label="Onboarding">
              <StatusPill
                label={formatOnboardingState(onboardingState)}
                humanize={false}
                tone={onboardingStateTone(onboardingState)}
              />
            </StatusField>
            <StatusField label="Runtime">
              <StatusPill
                label={status.status}
                tone={runtimeStatusTone(status.status)}
              />
            </StatusField>
            <StatusField label="Treasury mode">
              <p className="text-base font-semibold leading-snug text-charcoal sm:text-lg">
                {formatTreasuryMode(data.operator.preferredTreasuryMode)}
              </p>
            </StatusField>
            <StatusField label="Stale unknown attempts">
              <p className="text-base font-semibold text-charcoal sm:text-lg">
                {status.staleUnknownAttempts}
              </p>
            </StatusField>
          </div>

          <ProductionReadinessPanel
            className="mt-6"
            readiness={data.dashboard.systemStatus.readiness}
          />

          {message ? (
            <output className="mt-4 block text-sm text-steel">{message}</output>
          ) : null}
        </section>

        <TreasuryConnectionPanel
          focusOnMount={focusTreasury}
          onLinked={onTreasuryLinked}
        />
      </div>
    </ConsoleShell>
  );
}
