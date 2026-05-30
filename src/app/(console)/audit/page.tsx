"use client";

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
import { formatOperatorToken } from "@/lib/operator-display-labels";

export default function AuditPage() {
  return (
    <OperatorGate
      title="Sign in to view audit history"
      description="Open the audit event timeline."
    >
      {({ data }) => (
        <ConsoleShell
          activeTab="Audit"
          eyebrow="Audit"
          title="Audit history"
          summary="Mandate, attempt, receipt, and revocation events in one timeline."
          toolbar={
            <>
              <StatusPill
                label={`${data.dashboard.auditEntries.length} audit entries`}
                humanize={false}
                tone="info"
              />
              <StatusPill
                label={`${data.dashboard.domainEvents.length} domain events`}
                humanize={false}
                tone="neutral"
              />
            </>
          }
        >
          <section className={consoleSplitSection()}>
            <ConsolePanel>
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
                        <StatusPill label={entry.type} tone="neutral" />
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
            </ConsolePanel>

            <ConsoleCodeSurface
              title="Domain events"
              summary={`${data.dashboard.domainEvents.length} recent ledger events. Expand for entity IDs and correlation references.`}
              className="min-w-0"
            >
              <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                {data.dashboard.domainEvents.slice(0, 8).map((event) => (
                  <div key={event.id}>
                    <div className="font-semibold text-on-dark">
                      {formatOperatorToken(event.eventType)}
                    </div>
                    <div>
                      {formatOperatorToken(event.entityType)} · {event.entityId}
                    </div>
                    {event.correlationId ? (
                      <div>Correlation: {event.correlationId}</div>
                    ) : null}
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
