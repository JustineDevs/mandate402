"use client";

import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCodeSurface } from "@/components/console-card";
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
import {
  laneForAttempt,
  receiptTone,
  summarizeReceipt,
} from "@/lib/operator-view-model";

export default function ReceiptsPage() {
  return (
    <OperatorGate
      title="Receipt evidence"
      description="Inspect proof-of-delivery status separately from the financial result for each machine payment attempt."
    >
      {({ data }) => {
        const attempts = data.dashboard.attempts;
        const selected = attempts[0];

        return (
          <ConsoleShell
            activeTab="Receipts"
            eyebrow="Receipts & Evidence"
            title="Receipts"
            summary="Keep payment success, receipt availability, and blocked no-call cases understandable even for operators who do not think in blockchain terms."
            toolbar={
              <>
                <StatusPill
                  label={`${attempts.filter((attempt) => attempt.receiptEvidence === "received_valid").length} Received`}
                  tone="success"
                />
                <StatusPill
                  label={`${attempts.filter((attempt) => attempt.receiptEvidence === "required_pending").length} Pending`}
                  tone="warning"
                />
              </>
            }
          >
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
                <SectionHeader
                  eyebrow="Proof"
                  title="Receipt ledger"
                  description="Blocked attempts remain visible here too so operators can tell when no receipt is expected because money never moved."
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lane</TableHead>
                      <TableHead>Attempt</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Receipt State</TableHead>
                      <TableHead>Financial State</TableHead>
                      <TableHead>Charge Reference</TableHead>
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
                        <TableCell>
                          <StatusPill
                            label={attempt.receiptEvidence.replaceAll("_", " ")}
                            tone={receiptTone(attempt.receiptEvidence)}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            label={attempt.financialOutcome.replaceAll(
                              "_",
                              " ",
                            )}
                            tone={
                              attempt.financialOutcome ===
                              "executed_charge_succeeded"
                                ? "success"
                                : attempt.financialOutcome === "policy_denied"
                                  ? "danger"
                                  : "warning"
                            }
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {attempt.chargeReference ?? "none"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selected ? (
                <ConsoleCodeSurface title={`Receipt review: ${selected.id}`}>
                  <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                    <p>vendor: {selected.vendorId}</p>
                    <p>payment identifier: {selected.paymentIdentifier}</p>
                    <p>financial lane: {selected.financialOutcome}</p>
                    <p>receipt lane: {selected.receiptEvidence}</p>
                    <p>{summarizeReceipt(selected)}</p>
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
