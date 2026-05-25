"use client";

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

export default function AuditPage() {
  return (
    <OperatorGate
      title="Audit history"
      description="Review the operator-readable event trail for mandates, attempts, receipt evidence, and revocations."
    >
      {({ data }) => (
        <ConsoleShell
          activeTab="Audit"
          eyebrow="Audit & Evidence"
          title="Audit History"
          summary="Every important payment-control transition stays visible here so an operator can explain what happened without reconstructing backend logs."
          toolbar={
            <>
              <StatusPill
                label={`${data.dashboard.auditEntries.length} Audit Entries`}
                tone="info"
              />
              <StatusPill
                label={`${data.dashboard.domainEvents.length} Domain Events`}
                tone="neutral"
              />
            </>
          }
        >
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
              <SectionHeader
                eyebrow="Timeline"
                title="Audit ledger"
                description="Human-readable audit events show who did what and when."
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mandate</TableHead>
                    <TableHead>Attempt</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.dashboard.auditEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground">
                        {entry.createdAt}
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          label={entry.type.replaceAll("_", " ")}
                          tone="neutral"
                        />
                      </TableCell>
                      <TableCell>{entry.mandateId}</TableCell>
                      <TableCell>{entry.attemptId ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ConsoleCodeSurface title="Structured event feed">
              <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                {data.dashboard.domainEvents.slice(0, 8).map((event) => (
                  <div key={event.id}>
                    <div className="font-semibold text-on-dark">
                      {event.eventType}
                    </div>
                    <div>
                      {event.entityType}: {event.entityId}
                    </div>
                    <div>correlation: {event.correlationId ?? "none"}</div>
                  </div>
                ))}
              </div>
            </ConsoleCodeSurface>
          </section>
        </ConsoleShell>
      )}
    </OperatorGate>
  );
}
