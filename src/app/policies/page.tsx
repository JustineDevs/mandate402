"use client";

import { useState } from "react";

import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCard, ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { InlinePopover } from "@/components/overlay-primitives";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

const policyCards = [
  {
    title: "Vendor Allowlists",
    body: "Primary vendors stay explicitly named and visible to operators before any spend attempt is made.",
    tone: "success" as const,
  },
  {
    title: "Receipt Discipline",
    body: "Receipt evidence remains a separate truth from settlement success so the UI never implies proof that does not exist.",
    tone: "warning" as const,
  },
  {
    title: "Unknown Execution",
    body: "Attempts that are still unresolved remain visible until correlation proves the final outcome.",
    tone: "danger" as const,
  },
];

const blockedRows: {
  attempt: string;
  vendor: string;
  reason: string;
  note: string;
  status: string;
  lane: CategoryLane;
}[] = [
  {
    attempt: "att_7c36q72z",
    vendor: "Vendor X",
    reason: "not allowlisted",
    note: "The vendor boundary stays explicit. This attempt should remain visibly denied until a human widens the mandate.",
    status: "Blocked",
    lane: "governance",
  },
  {
    attempt: "att_95f7g8bq",
    vendor: "OpenAI API",
    reason: "soft limit exceeded",
    note: "The mandate still exists, but this individual spend exceeded the configured soft limit and needs a visible operator override.",
    status: "Blocked",
    lane: "compliance",
  },
];

export default function PoliciesPage() {
  const [selectedAttempt, setSelectedAttempt] = useState<string>(
    blockedRows[0].attempt,
  );
  const selectedRow =
    blockedRows.find((row) => row.attempt === selectedAttempt) ??
    blockedRows[0];

  return (
    <ConsoleShell
      activeTab="Policies"
      eyebrow="Policy Registry"
      title="Policies"
      summary="This page makes pre-dispatch control, denial reasons, and rule visibility explicit before any spend leaves the system."
      heroTone="control"
      toolbar={
        <>
          <StatusPill label="Create Rule" tone="success" />
          <StatusPill label="Export" tone="neutral" />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {policyCards.map((card) => (
          <ConsoleCard
            key={card.title}
            prepend={<StatusPill label={card.title} tone={card.tone} />}
          >
            {card.body}
          </ConsoleCard>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <SectionHeader
              eyebrow="Denials"
              title="Blocked reasons ledger"
              description="Reasons stay explicit and inspectable, never hidden behind one summary card."
              meta={<StatusPill label="Runtime Readiness" tone="warning" />}
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
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedRows.map((row) => (
                  <TableRow key={row.attempt}>
                    <TableCell>
                      <CategoryAccentChip lane={row.lane} />
                    </TableCell>
                    <TableCell className="font-medium text-charcoal">
                      {row.attempt}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.vendor}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.reason}
                    </TableCell>
                    <TableCell>
                      <StatusPill label={row.status} tone="danger" />
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAttempt(row.attempt)}
                        className="rounded-full border border-hairline-strong px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal"
                      >
                        View
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
            title={`Inspection: ${selectedRow.vendor}`}
            body={selectedRow.note}
          />
          <ConsoleCodeSurface title="Rule detail">
            <pre className="whitespace-pre-wrap text-xs leading-6 text-on-dark-muted">{`scope: all active mandates
trigger: facilitator_not_allowlisted
effect: block before dispatch
visibility: operator banner + audit entry`}</pre>
          </ConsoleCodeSurface>
        </div>
      </section>

      <section className="mt-8 lg:mt-10">
        <SectionHeader
          eyebrow="Operator reference"
          title="How policy evaluation surfaces in the console"
          description="Dense tables carry the ledger; accordions carry explanatory copy without crowding the primary grid."
          className="mb-4"
        />
        <Accordion
          defaultValue={[]}
          className="rounded-xl border border-border bg-card px-3 shadow-sm sm:px-4"
        >
          <AccordionItem value="pre-dispatch">
            <AccordionTrigger>Pre-dispatch gates</AccordionTrigger>
            <AccordionContent>
              <p className="max-w-3xl text-muted-foreground">
                Allowlists, soft limits, and facilitator boundaries run before
                treasury dispatch. A blocked row here means no payment
                identifier should exist for that attempt.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="receipts">
            <AccordionTrigger>Receipt vs financial truth</AccordionTrigger>
            <AccordionContent>
              <p className="max-w-3xl text-muted-foreground">
                Receipt bundles prove delivery to operators; they do not
                retroactively change settlement outcome. Keep both columns
                visible whenever an attempt is shown.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="unknown">
            <AccordionTrigger>Unknown execution</AccordionTrigger>
            <AccordionContent>
              <p className="max-w-3xl text-muted-foreground">
                Attempts that are still correlating remain in the ledger with
                explicit status until worker and treasury paths converge on a
                final reason code.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </ConsoleShell>
  );
}
