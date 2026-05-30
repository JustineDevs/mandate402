"use client";

import { CategoryAccentChip } from "@/components/category-accent";
import {
  ConsoleCard,
  ConsoleCodeSurface,
  ConsolePanel,
} from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { consoleSplitSection, consoleStatGrid3 } from "@/lib/console-layout";
import {
  fallbackGateTone,
  formatFallbackGateStatus,
} from "@/lib/operator-view-model";

export default function PolicyRegistryPage() {
  return (
    <OperatorGate
      title="Sign in to view policies"
      description="Open the policy registry."
    >
      {({ data }) => {
        const blockedAttempts = data.dashboard.attempts.filter(
          (attempt) => attempt.status === "policy_denied",
        );

        return (
          <ConsoleShell
            activeTab="Policies"
            eyebrow="Policies"
            title="Policy registry"
            summary="Reasons a payment was blocked before funds moved."
            heroTone="control"
            toolbar={
              <>
                <StatusPill
                  label={`${blockedAttempts.length} blocked`}
                  humanize={false}
                  tone="danger"
                />
                <StatusPill
                  label={data.dashboard.fallbackGate.decision_status}
                  tone={fallbackGateTone(
                    data.dashboard.fallbackGate.decision_status,
                  )}
                />
              </>
            }
          >
            <div className={consoleStatGrid3()}>
              <ConsoleCard
                eyebrow="Allowlist Enforcement"
                value={String(
                  blockedAttempts.filter((attempt) =>
                    attempt.blockedReason?.includes("vendor"),
                  ).length,
                )}
              >
                Vendor rules stay explicit, so a blocked payment can be
                explained in plain language before anyone checks chain data.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Budget Enforcement"
                value={String(
                  blockedAttempts.filter((attempt) =>
                    attempt.blockedReason?.includes("budget"),
                  ).length,
                )}
              >
                Spending limits are enforced before dispatch, which prevents an
                agent from draining a treasury while a mandate is still active.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Receipt Requirement"
                value={String(
                  data.dashboard.mandates.filter(
                    (mandate) => mandate.requiresReceiptCapability,
                  ).length,
                )}
              >
                Receipt-capable routes stay visible because operators need proof
                expectations, not just a success badge.
              </ConsoleCard>
            </div>

            <section className={consoleSplitSection()}>
              <ConsolePanel>
                <SectionHeader
                  eyebrow="Blocked Before Money Moved"
                  title="Denial reason ledger"
                  description="A blocked attempt stays visible with the reason code that stopped it."
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lane</TableHead>
                      <TableHead>Attempt</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Operator note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <CategoryAccentChip lane="governance" />
                        </TableCell>
                        <TableCell className="font-medium text-charcoal">
                          {attempt.id}
                        </TableCell>
                        <TableCell>{attempt.vendorId}</TableCell>
                        <TableCell>
                          <StatusPill
                            label={attempt.blockedReason ?? "policy_denied"}
                            tone="danger"
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          The payment did not reach the vendor because the
                          mandate rules rejected it first.
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ConsolePanel>

              <ConsoleCodeSurface
                title="Policy posture"
                summary={`Fallback is ${formatFallbackGateStatus(data.dashboard.fallbackGate.decision_status)}. Primary vendor paths stay preferred until review opens fallback.`}
                className="min-w-0"
              >
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>
                    Review owner: {data.dashboard.fallbackGate.review_owner}
                  </p>
                  <p>
                    Configured Morph vendor paths remain the default execution
                    route until the fallback gate explicitly allows backup
                    adapters.
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
