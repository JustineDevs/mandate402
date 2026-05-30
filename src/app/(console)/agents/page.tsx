"use client";

import {
  ConsoleCard,
  ConsoleCodeSurface,
  ConsolePanel,
} from "@/components/console-card";
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
import { consoleSplitSection, consoleStatGrid3 } from "@/lib/console-layout";
import { formatUsd } from "@/lib/operator-view-model";

export default function AgentsPage() {
  return (
    <OperatorGate
      title="Sign in to view agents"
      description="Open the agent registry for live agents and mandate coverage."
    >
      {({ data }) => {
        const activeMandates = data.dashboard.mandates.filter(
          (mandate) =>
            mandate.status === "issued_active" ||
            mandate.status === "issued_reserved",
        );

        return (
          <ConsoleShell
            activeTab="Agents"
            eyebrow="Agents"
            title="Agent registry"
            summary="Governed agent identities and the mandates that control their spend (not an autonomous LLM runtime)."
            toolbar={
              <>
                <StatusPill
                  label={`${data.dashboard.agents.length} Agents`}
                  tone="info"
                />
                <StatusPill
                  label={`${activeMandates.length} Active Mandates`}
                  tone="success"
                />
              </>
            }
          >
            <div className={consoleStatGrid3()}>
              <ConsoleCard
                eyebrow="Registered Agents"
                value={String(data.dashboard.agents.length)}
              >
                These are the agent identities currently known to the runtime
                store.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Governed Spend"
                value={formatUsd(
                  activeMandates.reduce(
                    (sum, mandate) =>
                      sum + mandate.reservedCents + mandate.consumedCents,
                    0,
                  ),
                )}
              >
                Reserved and consumed spend is grouped under the mandates bound
                to these agents.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Blocked Attempts"
                value={String(
                  data.dashboard.attempts.filter(
                    (attempt) => attempt.status === "policy_denied",
                  ).length,
                )}
              >
                Denied attempts stay visible to show where agent behavior was
                stopped before money moved.
              </ConsoleCard>
            </div>

            <section className={consoleSplitSection("narrow")}>
              <ConsolePanel>
                <SectionHeader
                  eyebrow="Live registry"
                  title="Agent roster"
                  description="Agents are shown with their current runtime status and any active mandates bound to them."
                />

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active mandates</TableHead>
                      <TableHead>Budget in motion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.dashboard.agents.map((agent) => {
                      const mandates = activeMandates.filter(
                        (mandate) => mandate.agentId === agent.id,
                      );
                      const exposure = mandates.reduce(
                        (sum, mandate) =>
                          sum + mandate.reservedCents + mandate.consumedCents,
                        0,
                      );

                      return (
                        <TableRow key={agent.id}>
                          <TableCell>
                            <div className="font-semibold text-charcoal">
                              {agent.name}
                            </div>
                            <div className="text-xs text-steel">{agent.id}</div>
                          </TableCell>
                          <TableCell>
                            <StatusPill
                              label={agent.status}
                              tone={
                                agent.status === "active" ? "success" : "danger"
                              }
                            />
                          </TableCell>
                          <TableCell>{mandates.length}</TableCell>
                          <TableCell>{formatUsd(exposure)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ConsolePanel>

              <ConsoleCodeSurface
                title="Agent control"
                summary="Agents are governed identities. Spend authority comes from mandates — this screen does not execute payments."
                className="min-w-0"
              >
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>Agent identity is loaded from the live runtime store.</p>
                  <p>
                    To change what an agent may spend, update or revoke the
                    mandate — not the agent row.
                  </p>
                  <p>
                    Blocked attempts stay visible under Transactions and Policy
                    so operators can see denials without a fake “run” button
                    here.
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
