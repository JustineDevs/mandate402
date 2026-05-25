"use client";

import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCard, ConsoleCodeSurface } from "@/components/console-card";
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

export default function PolicyRegistryPage() {
  return (
    <OperatorGate
      title="Policy controls"
      description="Review the reasons machine payments were blocked before they reached a vendor."
    >
      {({ data }) => {
        const blockedAttempts = data.dashboard.attempts.filter(
          (attempt) => attempt.status === "policy_denied",
        );

        return (
          <ConsoleShell
            activeTab="Policies"
            eyebrow="Policy Registry"
            title="Policies"
            summary="This screen shows why a payment was denied before money moved, so operators can trust the treasury controls without reading backend logs."
            heroTone="control"
            toolbar={
              <>
                <StatusPill
                  label={`${blockedAttempts.length} Blocked`}
                  tone="danger"
                />
                <StatusPill
                  label={data.dashboard.fallbackGate.decision_status}
                  tone="warning"
                />
              </>
            }
          >
            <div className="grid gap-6 lg:grid-cols-3">
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

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
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
              </div>

              <ConsoleCodeSurface title="Policy posture">
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>
                    fallback gate: {data.dashboard.fallbackGate.decision_status}
                  </p>
                  <p>
                    review owner: {data.dashboard.fallbackGate.review_owner}
                  </p>
                  <p>
                    primary path: configured Morph x402 vendor paths stay
                    preferred until the fallback gate explicitly opens.
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
