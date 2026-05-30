"use client";

import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCodeSurface, ConsolePanel } from "@/components/console-card";
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
import { consoleSplitSection } from "@/lib/console-layout";
import {
  financialTone,
  formatFinancialOutcome,
  formatReceiptEvidence,
  laneForAttempt,
  receiptTone,
  summarizeReceipt,
} from "@/lib/operator-view-model";

export default function ReceiptsPage() {
  return (
    <OperatorGate
      title="Sign in to view receipts"
      description="Open receipt and evidence records."
    >
      {({ data }) => {
        const attempts = data.dashboard.attempts;
        const selected = attempts[0];

        return (
          <ConsoleShell
            activeTab="Receipts"
            eyebrow="Receipts"
            title="Receipts"
            summary="Payment outcomes, receipt availability, and blocked cases without vendor calls."
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
            <section className={consoleSplitSection()}>
              <ConsolePanel>
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
                            label={attempt.receiptEvidence}
                            tone={receiptTone(attempt.receiptEvidence)}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            label={attempt.financialOutcome}
                            tone={financialTone(attempt.financialOutcome)}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {attempt.chargeReference ?? "none"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ConsolePanel>

              {selected ? (
                <ConsoleCodeSurface
                  title="Receipt review"
                  summary={`${formatFinancialOutcome(selected.financialOutcome)} · ${formatReceiptEvidence(selected.receiptEvidence)}. ${summarizeReceipt(selected)}`}
                  className="min-w-0"
                >
                  <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                    <p>Attempt ID: {selected.id}</p>
                    <p>Vendor: {selected.vendorId}</p>
                    <p>Payment identifier: {selected.paymentIdentifier}</p>
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
