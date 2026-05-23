"use client";

import { useState } from "react";

import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCard, ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { InlinePopover } from "@/components/overlay-primitives";
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

const summaryCards = [
  {
    title: "Financial Truth",
    body: "The ledger should show whether money movement succeeded without collapsing that fact into receipt availability.",
    tone: "success" as const,
  },
  {
    title: "Blocked Path",
    body: "Denied attempts remain visible so operator trust comes from clear reasons, not silent disappearance.",
    tone: "danger" as const,
  },
  {
    title: "Receipt State",
    body: "Missing receipt proof must not be confused with failed settlement unless the financial lane says so.",
    tone: "warning" as const,
  },
];

const transactions: {
  id: string;
  vendor: string;
  amount: string;
  financial: string;
  receipt: string;
  reason: string;
  note: string;
  lane: CategoryLane;
}[] = [
  {
    id: "tx1",
    vendor: "OpenAI API",
    amount: "$12",
    financial: "Success",
    receipt: "Received",
    reason: "charge_01",
    note: "Successful dispatch with a linked financial reference and receipt evidence already attached.",
    lane: "payments",
  },
  {
    id: "tx2",
    vendor: "Vendor X",
    amount: "$18",
    financial: "Blocked",
    receipt: "Pending",
    reason: "not allowlisted",
    note: "Blocked before dispatch because the vendor was outside the mandate allowlist. Keep the denied reason operator-visible.",
    lane: "governance",
  },
  {
    id: "tx3",
    vendor: "Tavily",
    amount: "$4",
    financial: "Success",
    receipt: "Received",
    reason: "charge_02",
    note: "Successful usage purchase that still separates financial truth from receipt proof.",
    lane: "agents",
  },
];

export default function TransactionsPage() {
  const [selectedId, setSelectedId] = useState<string>("tx2");
  const selected =
    transactions.find((tx) => tx.id === selectedId) ?? transactions[1];

  return (
    <ConsoleShell
      activeTab="Transactions"
      eyebrow="Attempt Ledger"
      title="Transactions"
      summary="Attempt truth stays visible as financial state, receipt state, and blocked reason instead of collapsing into a generic activity feed."
      toolbar={
        <>
          <StatusPill label="3 Attempts" tone="info" />
          <StatusPill label="1 Blocked" tone="danger" />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <ConsoleCard
            key={card.title}
            prepend={<StatusPill label={card.title} tone={card.tone} />}
          >
            {card.body}
          </ConsoleCard>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <SectionHeader
              eyebrow="Ledger"
              title="Attempt ledger"
              description="Financial, receipt, and governance lanes stay visible per row."
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lane</TableHead>
                  <TableHead>Attempt</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Financial</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Reason / Charge</TableHead>
                  <TableHead className="text-right">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <CategoryAccentChip lane={tx.lane} />
                    </TableCell>
                    <TableCell className="font-medium text-charcoal">
                      {tx.id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.vendor}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.amount}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={tx.financial}
                        tone={tx.financial === "Success" ? "success" : "danger"}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={tx.receipt}
                        tone={tx.receipt === "Received" ? "success" : "warning"}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(tx.id)}
                        className="rounded-full border border-hairline-strong px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal"
                      >
                        Inspect
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <InlinePopover
            title={`Attempt ${selected.id}`}
            body={selected.note}
          />
          <ConsoleCodeSurface title="Inspection surface">
            <p className="text-sm leading-7 text-on-dark-muted">
              Operators should be able to tell whether an attempt is blocked,
              settled, or still awaiting proof without reading backend logs.
            </p>
          </ConsoleCodeSurface>
        </div>
      </section>
    </ConsoleShell>
  );
}
