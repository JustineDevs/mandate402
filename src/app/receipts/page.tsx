"use client";

import { useMemo, useState } from "react";

import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { InlinePopover, OverlayModal } from "@/components/overlay-primitives";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CategoryLane } from "@/lib/types";

const receipts: {
  attempt: string;
  vendor: string;
  receiptState: string;
  financialState: string;
  preview: string;
  lane: CategoryLane;
}[] = [
  {
    attempt: "att_01",
    vendor: "OpenAI API",
    receiptState: "Received",
    financialState: "Success",
    preview:
      "Receipt #1842 linked to charge_01. Export bundle includes payment identifier, vendor label, and audit reference.",
    lane: "payments",
  },
  {
    attempt: "att_02",
    vendor: "Vendor X",
    receiptState: "Pending",
    financialState: "Blocked",
    preview:
      "No receipt bundle exists because the attempt never left the policy gate. Keep the blocked record but do not imply vendor proof.",
    lane: "governance",
  },
];

export default function ReceiptsPage() {
  const [previewAttempt, setPreviewAttempt] = useState<string | null>(null);
  const [showExportNotes, setShowExportNotes] = useState(false);
  const activeReceipt = useMemo(
    () =>
      receipts.find((receipt) => receipt.attempt === previewAttempt) ?? null,
    [previewAttempt],
  );

  return (
    <ConsoleShell
      activeTab="Receipts"
      eyebrow="Receipts & Audit"
      title="Receipts"
      summary="Receipt proof stays visible as its own operator surface instead of being collapsed into financial success."
      heroTone="control"
      toolbar={
        <>
          <StatusPill label="CSV" tone="neutral" />
          <StatusPill label="PDF" tone="neutral" />
        </>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <SectionHeader
              eyebrow="Proof"
              title="Receipt ledger"
              description="Receipt and financial state stay related but distinct."
              className="mb-0"
              actions={
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExportNotes((current) => !current)}
                    className="rounded-full border border-hairline px-4 py-2 text-sm font-bold text-charcoal"
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewAttempt(receipts[0].attempt)}
                    className="rounded-full bg-mandate-green px-4 py-2 text-sm font-bold text-canvas hover:bg-mandate-green-dark"
                  >
                    Preview
                  </button>
                </div>
              }
            />
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lane</TableHead>
                  <TableHead>Attempt</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Receipt State</TableHead>
                  <TableHead>Financial State</TableHead>
                  <TableHead className="text-right">Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.attempt}>
                    <TableCell>
                      <CategoryAccentChip lane={receipt.lane} />
                    </TableCell>
                    <TableCell className="font-medium text-charcoal">
                      {receipt.attempt}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {receipt.vendor}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={receipt.receiptState}
                        tone={
                          receipt.receiptState === "Received"
                            ? "success"
                            : "warning"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={receipt.financialState}
                        tone={
                          receipt.financialState === "Success"
                            ? "success"
                            : "danger"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => setPreviewAttempt(receipt.attempt)}
                        className="rounded-full border border-hairline-strong px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal"
                      >
                        Open
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {showExportNotes ? (
            <InlinePopover
              title="Export Options"
              body="Use CSV for ledger review and PDF for operator-facing receipt bundles. Neither export implies settlement truth on its own."
            />
          ) : (
            <ConsoleCodeSurface title="Audit timeline">
              <pre className="whitespace-pre-wrap text-xs leading-6 text-on-dark-muted">{`10:42  Attempt queued
10:43  Worker dispatch claimed
10:44  Treasury approved
10:45  Receipt validated`}</pre>
            </ConsoleCodeSurface>
          )}
        </div>
      </section>

      <OverlayModal
        variant="panel"
        eyebrowLabel="Receipt preview"
        title={
          activeReceipt
            ? `Receipt Preview: ${activeReceipt.attempt}`
            : "Receipt Preview"
        }
        description="Preview proof details without rewriting blocked or unresolved financial state."
        open={activeReceipt !== null}
        onClose={() => setPreviewAttempt(null)}
      >
        {activeReceipt ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <CategoryAccentChip lane={activeReceipt.lane} />
            </div>
            <div className="rounded-lg border border-hairline bg-surface-soft p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                Vendor
              </div>
              <div className="mt-2 text-lg font-bold text-charcoal">
                {activeReceipt.vendor}
              </div>
            </div>
            <p className="text-sm leading-7 text-slate">
              {activeReceipt.preview}
            </p>
          </div>
        ) : null}
      </OverlayModal>
    </ConsoleShell>
  );
}
