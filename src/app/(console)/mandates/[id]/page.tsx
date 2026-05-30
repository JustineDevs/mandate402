"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { ConsoleCodeSurface, ConsolePanel } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { consoleSplitSection, consoleStatGrid4 } from "@/lib/console-layout";
import { formatOperatorToken } from "@/lib/operator-display-labels";
import {
  financialTone,
  formatMandateStatus,
  formatUsd,
  laneForAttempt,
  mandateTone,
  receiptTone,
} from "@/lib/operator-view-model";

export default function MandateDetailPage() {
  const params = useParams<{ id?: string }>();
  const mandateId = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRevoke = async (token: string) => {
    setIsRevoking(true);
    setRevokeError(null);

    try {
      const response = await fetch(`/api/mandates/${mandateId}/revoke`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to revoke mandate");
      }

      setDialogOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setRevokeError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <OperatorGate
      title="Sign in to view mandate"
      description="Open mandate details and related attempts."
    >
      {({ data, accessToken }) => {
        const mandate = data.dashboard.mandates.find(
          (entry) => entry.id === mandateId,
        );

        if (!mandate) {
          return (
            <ConsoleShell
              activeTab="Mandates"
              eyebrow="Mandates"
              title="Mandate not found"
              summary="No mandate exists for this ID in the current dataset."
            >
              <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
                <SectionHeader
                  title="Missing mandate"
                  description="The requested mandate ID was not found in the current operator dataset."
                />
                <Link
                  href="/mandates"
                  className="inline-flex min-h-11 items-center rounded-full border border-hairline-strong px-4 py-2 text-sm font-bold text-charcoal transition-colors hover:bg-surface-soft"
                >
                  Back to mandates
                </Link>
              </div>
            </ConsoleShell>
          );
        }

        const isRevocable =
          mandate.status === "issued_active" ||
          mandate.status === "issued_reserved";

        const attempts = data.dashboard.attempts.filter(
          (attempt) => attempt.mandateId === mandate.id,
        );
        const auditEntries = data.dashboard.auditEntries.filter(
          (entry) => entry.mandateId === mandate.id,
        );
        const domainEvents = data.dashboard.domainEvents.filter(
          (event) => event.entityId === mandate.id,
        );

        return (
          <ConsoleShell
            activeTab="Mandates"
            eyebrow="Mandates"
            title={mandate.name}
            summary="Spend posture, vendors, and attempts for this mandate."
            toolbar={
              <div className="flex flex-wrap gap-2">
                {isRevocable && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger
                      render={
                        <Button className="rounded-full bg-red-600 font-bold text-white hover:bg-red-700">
                          Revoke Mandate
                        </Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Revoke Mandate</DialogTitle>
                        <DialogDescription>
                          This action immediately removes spend authority from
                          this mandate and records a revoke event on Morph.
                          Queued and future attempts will be blocked.
                        </DialogDescription>
                      </DialogHeader>
                      {revokeError && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                          {revokeError}
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          disabled={isRevoking}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-red-600 text-white hover:bg-red-700"
                          onClick={() => handleRevoke(accessToken)}
                          disabled={isRevoking}
                        >
                          {isRevoking ? "Revoking..." : "Confirm Revoke"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <StatusPill
                  label={mandate.status}
                  tone={mandateTone(mandate.status)}
                />
                <StatusPill label={`${attempts.length} Attempts`} tone="info" />
              </div>
            }
          >
            <div className={consoleStatGrid4()}>
              <ConsoleCodeSurface
                title="Mandate identity"
                summary={`${mandate.agentName} · ${formatMandateStatus(mandate.status)} · expires ${mandate.expiresAt}`}
              >
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>Mandate ID: {mandate.id}</p>
                </div>
              </ConsoleCodeSurface>
              <ConsoleCodeSurface
                title="Approved vendors"
                summary={`${mandate.approvedVendorIds.length} vendor${mandate.approvedVendorIds.length === 1 ? "" : "s"} on the allow list.`}
              >
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  {mandate.approvedVendorIds.map((vendorId) => (
                    <p key={vendorId}>{vendorId}</p>
                  ))}
                </div>
              </ConsoleCodeSurface>
              <ConsoleCodeSurface
                title="Spend posture"
                summary={`Cap ${formatUsd(mandate.budgetCapCents)} · reserved ${formatUsd(mandate.reservedCents)} · consumed ${formatUsd(mandate.consumedCents)}`}
              >
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>Figures reflect live mandate ledger totals.</p>
                </div>
              </ConsoleCodeSurface>
              <ConsoleCodeSurface
                title="Evidence policy"
                summary={
                  mandate.requiresReceiptCapability
                    ? "Receipt evidence is required before spend is considered complete."
                    : "Receipt evidence is optional for this mandate."
                }
              >
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>Issue anchor: {mandate.morphIssueTxId}</p>
                  <p>Revoke anchor: {mandate.morphRevokeTxId ?? "None"}</p>
                </div>
              </ConsoleCodeSurface>
            </div>

            <section className={consoleSplitSection()}>
              <ConsolePanel>
                <SectionHeader
                  eyebrow="Attempts"
                  title="Related payment attempts"
                  description="Every attempt tied to this mandate stays visible with both financial and receipt truth."
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lane</TableHead>
                      <TableHead>Attempt</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Financial</TableHead>
                      <TableHead>Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>{laneForAttempt(attempt)}</TableCell>
                        <TableCell className="font-medium text-charcoal">
                          {attempt.id}
                        </TableCell>
                        <TableCell>{attempt.vendorId}</TableCell>
                        <TableCell>{formatUsd(attempt.amountCents)}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </ConsolePanel>

              <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
                <ConsoleCodeSurface
                  title="Audit trail"
                  summary={`${auditEntries.length} entries for this mandate. Expand for full messages and timestamps.`}
                >
                  <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                    {auditEntries.slice(0, 8).map((entry) => (
                      <div key={entry.id}>
                        <div className="font-semibold text-on-dark">
                          {formatOperatorToken(entry.type)}
                        </div>
                        <div>{entry.message}</div>
                        <div>{entry.createdAt}</div>
                      </div>
                    ))}
                  </div>
                </ConsoleCodeSurface>

                <ConsoleCodeSurface
                  title="Domain events"
                  summary={`${domainEvents.length} ledger events. Expand for correlation references.`}
                >
                  <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                    {domainEvents.slice(0, 8).map((event) => (
                      <div key={event.id}>
                        <div className="font-semibold text-on-dark">
                          {formatOperatorToken(event.eventType)}
                        </div>
                        {event.correlationId ? (
                          <div>Correlation: {event.correlationId}</div>
                        ) : null}
                        <div>{event.occurredAt}</div>
                      </div>
                    ))}
                  </div>
                </ConsoleCodeSurface>
              </div>
            </section>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
