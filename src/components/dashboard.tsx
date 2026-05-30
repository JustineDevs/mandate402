import type { Route } from "next";
import Link from "next/link";

import {
  ConsoleCard,
  ConsoleCodeSurface,
  ConsolePanel,
} from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorConsole } from "@/components/operator-console";
import { ProductionReadinessPanel } from "@/components/production-readiness-panel";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  agentIdentityLabel,
  agentIdentityTone,
  formatShortAddress,
} from "@/lib/agent-identity-view";
import { consoleSplitSection, consoleStatGrid4 } from "@/lib/console-layout";
import type { DashboardData } from "@/lib/dashboard-data";
import {
  financialTone,
  formatFallbackGateStatus,
  formatOnboardingState,
  formatOperatorRole,
  formatTreasuryMode,
  formatUsd,
  formatWalletProvider,
  mandateTone,
  onboardingStateTone,
  receiptTone,
  vendorStatusTone,
} from "@/lib/operator-view-model";
import {
  formatReadinessStatusLabel,
  summarizeReadiness,
} from "@/lib/readiness-display-labels";

type DashboardProps = {
  accessToken: string;
  data: DashboardData;
  operator: {
    operatorId: string;
    role: "operator" | "platform_admin";
    onboardingState?: string;
    preferredWalletProvider?: string | null;
    preferredTreasuryMode?: string | null;
  };
  onRefresh: () => Promise<void>;
  onChanged: () => Promise<void>;
  onSignOut: () => Promise<void>;
  message: string;
  isPending: boolean;
};

export function Dashboard({
  accessToken,
  data,
  operator,
  onRefresh,
  onChanged,
  onSignOut,
  message,
  isPending,
}: DashboardProps) {
  const activeMandates = data.mandates.filter(
    (mandate) =>
      mandate.status === "issued_active" ||
      mandate.status === "issued_reserved",
  );
  const primaryVendors = data.vendors.filter(
    (vendor) => vendor.mode === "primary",
  );
  const recentAttempts = data.attempts.slice(0, 6);
  const recentAuditEntries = data.auditEntries.slice(0, 6);
  const incidentTone = data.incidents.length > 0 ? "warning" : "success";
  const onboardingComplete = operator.onboardingState === "complete";
  const readinessSummary = summarizeReadiness(data.systemStatus.readiness);
  const agentsById = new Map(data.agents.map((agent) => [agent.id, agent]));

  return (
    <ConsoleShell
      activeTab="Dashboard"
      eyebrow="Dashboard"
      title="Overview"
      summary="Runtime status, treasury exposure, open incidents, and links to mandates, transactions, and policies."
      heroTone="control"
      actions={
        <>
          {!onboardingComplete ? (
            <Link href={"/settings?treasury=1" as Route}>
              <Button className="rounded-full bg-white font-bold text-brand-control hover:bg-white/90">
                Link treasury wallet
              </Button>
            </Link>
          ) : null}
          {onboardingComplete ? (
            <Link href={"/mandates/create" as Route}>
              <Button className="rounded-full bg-white font-bold text-brand-control hover:bg-white/90">
                Create mandate
              </Button>
            </Link>
          ) : null}
        </>
      }
      toolbar={
        <>
          <StatusPill
            label={formatReadinessStatusLabel(
              data.systemStatus.readiness.status,
            )}
            humanize={false}
            tone={
              data.systemStatus.readiness.status === "ok"
                ? "success"
                : "warning"
            }
          />
          <StatusPill
            label={`${readinessSummary.passingCount}/${readinessSummary.totalCount} checks`}
            humanize={false}
            tone="neutral"
          />
          <StatusPill
            label={operator.onboardingState ?? "unknown"}
            tone={onboardingStateTone(operator.onboardingState)}
          />
          <StatusPill
            label={`${data.incidents.length} open incidents`}
            humanize={false}
            tone={incidentTone}
          />
          <StatusPill
            label={`${data.systemStatus.staleUnknownAttempts} charges need review`}
            humanize={false}
            tone={
              data.systemStatus.staleUnknownAttempts > 0 ? "danger" : "success"
            }
          />
        </>
      }
    >
      <div className={consoleStatGrid4()}>
        <ConsoleCard
          eyebrow="Live mandates"
          value={String(data.metrics.liveMandates)}
        >
          Active treasury lanes with spend authority right now.
        </ConsoleCard>
        <ConsoleCard
          eyebrow="Treasury in motion"
          value={formatUsd(data.metrics.spendReservedPlusConsumed)}
        >
          Reserved and consumed spend visible without conflating it with final
          settlement truth.
        </ConsoleCard>
        <ConsoleCard
          eyebrow="Blocked attempts"
          value={String(data.metrics.blockedAttempts)}
        >
          Policy-denied spend that never reached a vendor.
        </ConsoleCard>
        <ConsoleCard
          eyebrow="Primary vendors"
          value={String(primaryVendors.length)}
        >
          Approved primary runtime endpoints in the current vendor registry.
        </ConsoleCard>
      </div>

      <ProductionReadinessPanel readiness={data.systemStatus.readiness} />

      <section className={consoleSplitSection("default")}>
        <ConsolePanel>
          <SectionHeader
            eyebrow="Immediate attention"
            title="Open incidents and recent attempts"
            description="The dashboard keeps operator attention on unresolved payment truth first, then recent execution history."
            actions={
              <Link href={"/transactions" as Route}>
                <Button variant="outline">Open transactions</Button>
              </Link>
            }
          />

          {data.incidents.length > 0 ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-semantic-warning-text">
                Open incidents
              </div>
              <div className="space-y-3">
                {data.incidents.slice(0, 3).map((incident) => (
                  <div
                    key={incident.id}
                    className="rounded-md border border-amber-200 bg-white/70 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill
                        label={incident.severity}
                        tone={
                          incident.severity === "danger" ? "danger" : "warning"
                        }
                      />
                      <span className="text-sm font-semibold text-charcoal">
                        {incident.title}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate">
                      {incident.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attempt</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Financial</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAttempts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No payment attempts yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium text-charcoal">
                      {attempt.id}
                    </TableCell>
                    <TableCell>{attempt.vendorId}</TableCell>
                    <TableCell>
                      <StatusPill
                        label={attempt.financialOutcome}
                        tone={financialTone(attempt.financialOutcome)}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={attempt.receiptEvidence}
                        tone={receiptTone(attempt.receiptEvidence)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ConsolePanel>

        <ConsoleCodeSurface
          title="Your session"
          summary={`Signed in as ${formatOperatorRole(operator.role)}. Onboarding: ${formatOnboardingState(operator.onboardingState)}.`}
          className="min-w-0"
        >
          <div className="space-y-4 text-sm leading-7 text-on-dark-muted">
            <p>Operator ID: {operator.operatorId}</p>
            <p>
              Wallet provider:{" "}
              {formatWalletProvider(operator.preferredWalletProvider)}
            </p>
            <p>
              Treasury mode:{" "}
              {formatTreasuryMode(operator.preferredTreasuryMode)}
            </p>
            {message ? <p>{message}</p> : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-on-dark hover:bg-white/10 hover:text-on-dark"
                disabled={isPending}
                onClick={() => void onRefresh()}
              >
                Refresh workspace
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-on-dark hover:bg-white/10 hover:text-on-dark"
                disabled={isPending}
                onClick={() => void onSignOut()}
              >
                Sign out
              </Button>
            </div>
          </div>
        </ConsoleCodeSurface>
      </section>

      <ConsolePanel>
        <SectionHeader
          eyebrow="Operator actions"
          title="Run governed actions"
          description={
            onboardingComplete
              ? "Create mandates, dispatch governed attempts, reconcile unresolved charges, and revoke spend authority from the same protected workspace."
              : "Finish the treasury connection setup before creating mandates or dispatching governed payment actions."
          }
        />

        {onboardingComplete ? (
          <OperatorConsole
            accessToken={accessToken}
            agents={data.agents}
            mandates={data.mandates}
            attempts={data.attempts}
            onChanged={onChanged}
            treasuryEnforcementMode={
              data.systemStatus.blockchain.treasuryEnforcementMode
            }
            vendors={data.vendors}
          />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label="Action lock" tone="warning" />
              <span className="text-sm font-semibold text-charcoal">
                Treasury connection required before operator actions unlock
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              This operator still needs a verified wallet path. Mandate
              creation, attempt dispatch, reconciliation, and revoke controls
              stay disabled until the treasury connection flow is complete.
            </p>
          </div>
        )}
      </ConsolePanel>

      <section className={consoleSplitSection("balanced")}>
        <ConsolePanel>
          <SectionHeader
            eyebrow="Mandate posture"
            title="Active mandates"
            description="The dashboard shows the current governed spend lanes and pushes editing into the dedicated mandate surfaces."
            actions={
              <Link href={"/mandates" as Route}>
                <Button variant="outline">Open mandates</Button>
              </Link>
            }
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mandate</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Identity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget in motion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeMandates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No active mandates found.
                  </TableCell>
                </TableRow>
              ) : (
                activeMandates.slice(0, 6).map((mandate) => {
                  const agent = agentsById.get(mandate.agentId);

                  return (
                    <TableRow key={mandate.id}>
                      <TableCell className="font-medium text-charcoal">
                        {mandate.name}
                      </TableCell>
                      <TableCell>{mandate.agentName}</TableCell>
                      <TableCell>
                        {agent ? (
                          <div className="space-y-1">
                            <StatusPill
                              label={agentIdentityLabel(agent)}
                              tone={agentIdentityTone(agent)}
                            />
                            <div className="text-xs text-steel">
                              {formatShortAddress(agent.onchainAddress)}
                            </div>
                          </div>
                        ) : (
                          <StatusPill label="identity_unmapped" tone="danger" />
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          label={mandate.status}
                          tone={mandateTone(mandate.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {formatUsd(
                          mandate.reservedCents + mandate.consumedCents,
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ConsolePanel>

        <ConsolePanel>
          <SectionHeader
            eyebrow="Runtime context"
            title="Vendors and audit trail"
            description="Primary runtime reachability and recent audit output stay visible here, while deeper investigation lives on the dedicated routes."
            actions={
              <div className="flex flex-wrap gap-2">
                <Link href={"/vendors" as Route}>
                  <Button variant="outline">Open vendors</Button>
                </Link>
                <Link href={"/audit" as Route}>
                  <Button variant="outline">Open audit</Button>
                </Link>
              </div>
            }
          />

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <ConsoleCard
              eyebrow="Fallback gate"
              value={formatFallbackGateStatus(
                data.fallbackGate.decision_status,
              )}
              humanizeValue={false}
            >
              Review owner: {data.fallbackGate.review_owner}
            </ConsoleCard>
            <ConsoleCard
              eyebrow="Primary target count"
              value={String(data.fallbackGate.primary_targets.length)}
              humanizeValue={false}
            >
              Runtime stays ecosystem-first until the gate explicitly opens.
            </ConsoleCard>
          </div>

          <div className="mb-6 space-y-3">
            {data.vendors.slice(0, 4).map((vendor) => (
              <div
                key={vendor.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-hairline bg-surface-soft p-3"
              >
                <div>
                  <div className="font-semibold text-charcoal">
                    {vendor.name}
                  </div>
                  <div className="text-xs text-steel">{vendor.id}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill label={vendor.mode} tone="info" />
                  <StatusPill
                    label={vendor.status}
                    tone={vendorStatusTone(vendor.status)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-hairline pt-6">
            {recentAuditEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No audit entries yet.
              </p>
            ) : (
              recentAuditEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border border-hairline p-3"
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                    {entry.type}
                  </div>
                  <div className="mt-2 text-sm font-medium text-charcoal">
                    {entry.message}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {entry.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        </ConsolePanel>
      </section>
    </ConsoleShell>
  );
}
