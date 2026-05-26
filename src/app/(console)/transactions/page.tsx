"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCard, ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
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
  financialTone,
  formatUsd,
  laneForAttempt,
  receiptTone,
} from "@/lib/operator-view-model";

export default function TransactionsPage() {
  const router = useRouter();
  const [isReconciling, setIsReconciling] = useState<string | null>(null);

  const handleReconcile = async (
    mandateId: string,
    attemptId: string,
    token: string,
  ) => {
    setIsReconciling(attemptId);
    try {
      const response = await fetch(
        `/api/mandates/${mandateId}/attempts/${attemptId}/reconcile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reconcile attempt");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Reconciliation failed. Check logs or retry.");
    } finally {
      setIsReconciling(null);
    }
  };

  return (
    <OperatorGate
      title="Payment attempts"
      description="Inspect allowed, blocked, and unresolved payment attempts without exposing raw backend internals."
    >
      {({ data, accessToken }) => {
        const attempts = data.dashboard.attempts;
        const selected = attempts[0];

        return (
          <ConsoleShell
            activeTab="Transactions"
            eyebrow="Attempt Ledger"
            title="Payment Attempts"
            summary="See which attempts were approved, blocked before money moved, or are still waiting for charge truth."
            toolbar={
              <>
                <StatusPill label={`${attempts.length} Attempts`} tone="info" />
                <StatusPill
                  label={`${attempts.filter((attempt) => attempt.status === "policy_denied").length} Blocked`}
                  tone="danger"
                />
                <StatusPill
                  label={`${attempts.filter((attempt) => attempt.status === "execution_unknown").length} Unknown`}
                  tone="warning"
                />
              </>
            }
          >
            <div className="grid gap-6 lg:grid-cols-3">
              <ConsoleCard
                eyebrow="Approved Spend"
                value={formatUsd(
                  attempts
                    .filter(
                      (attempt) =>
                        attempt.financialOutcome ===
                        "executed_charge_succeeded",
                    )
                    .reduce((sum, attempt) => sum + attempt.amountCents, 0),
                )}
              >
                Valid x402 calls stay visibly separate from blocked attempts, so
                operators can see what actually moved money.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Blocked Before Dispatch"
                value={String(
                  attempts.filter(
                    (attempt) => attempt.status === "policy_denied",
                  ).length,
                )}
              >
                These rows prove the mandate layer stopped unsafe spend before a
                vendor call was allowed.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Receipt Evidence Pending"
                value={String(
                  attempts.filter(
                    (attempt) => attempt.receiptEvidence === "required_pending",
                  ).length,
                )}
              >
                Financial truth and proof of delivery remain separate, so
                pending evidence never rewrites payment outcome.
              </ConsoleCard>
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
                <SectionHeader
                  eyebrow="Ledger"
                  title="Attempt ledger"
                  description="Each row keeps the vendor, amount, financial result, and receipt state visible for non-crypto operators."
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
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <CategoryAccentChip lane={laneForAttempt(attempt)} />
                        </TableCell>
                        <TableCell className="font-medium text-charcoal">
                          {attempt.id}
                        </TableCell>
                        <TableCell>{attempt.vendorId}</TableCell>
                        <TableCell>{formatUsd(attempt.amountCents)}</TableCell>
                        <TableCell>
                          <StatusPill
                            label={attempt.financialOutcome.replaceAll(
                              "_",
                              " ",
                            )}
                            tone={financialTone(attempt.financialOutcome)}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            label={attempt.receiptEvidence.replaceAll("_", " ")}
                            tone={receiptTone(attempt.receiptEvidence)}
                          />
                        </TableCell>
                        <TableCell>
                          {attempt.status === "execution_unknown" ? (
                            <Button
                              size="sm"
                              className="bg-mandate-green text-xs font-bold text-white hover:bg-mandate-green-dark"
                              onClick={() =>
                                handleReconcile(
                                  attempt.mandateId,
                                  attempt.id,
                                  accessToken,
                                )
                              }
                              disabled={isReconciling === attempt.id}
                            >
                              {isReconciling === attempt.id
                                ? "..."
                                : "Reconcile"}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {attempt.blockedReason ??
                                attempt.chargeReference ??
                                "complete"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selected ? (
                <ConsoleCodeSurface title={`Attempt ${selected.id}`}>
                  <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                    <p>vendor: {selected.vendorId}</p>
                    <p>payment identifier: {selected.paymentIdentifier}</p>
                    <p>financial outcome: {selected.financialOutcome}</p>
                    <p>receipt evidence: {selected.receiptEvidence}</p>
                    <p>
                      operator note:{" "}
                      {selected.blockedReason
                        ? `Blocked before money moved because ${selected.blockedReason}.`
                        : selected.chargeReference
                          ? `Vendor charge reference ${selected.chargeReference} is available for review.`
                          : "This attempt is still waiting on a final charge reference."}
                    </p>
                  </div>
                </ConsoleCodeSurface>
              ) : null}
            </section>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
