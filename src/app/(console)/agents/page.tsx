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
import {
  agentIdentityLabel,
  agentIdentityTone,
  formatAgentChain,
  formatAgentWalletProvider,
  formatShortAddress,
  isAgentOnchainIdentityVerified,
} from "@/lib/agent-identity-view";
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
        const verifiedAgents = data.dashboard.agents.filter(
          isAgentOnchainIdentityVerified,
        );
        const unmappedAgents = data.dashboard.agents.filter(
          (agent) => !isAgentOnchainIdentityVerified(agent),
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
                <StatusPill
                  label={`${verifiedAgents.length} Treasury Ready`}
                  tone={unmappedAgents.length > 0 ? "warning" : "success"}
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
                eyebrow="Treasury identities"
                value={`${verifiedAgents.length}/${data.dashboard.agents.length}`}
                humanizeValue={false}
                pill={{
                  label:
                    unmappedAgents.length > 0
                      ? "identity_unmapped"
                      : "treasury_verified",
                  tone: unmappedAgents.length > 0 ? "warning" : "success",
                }}
              >
                Verified agents have a persisted on-chain address, wallet
                provider, chain id, and verification timestamp.
              </ConsoleCard>
            </div>

            <section className={consoleSplitSection("narrow")}>
              <ConsolePanel>
                <SectionHeader
                  eyebrow="Live registry"
                  title="Agent roster"
                  description="Agents are shown with runtime status, treasury identity mapping, and any active mandates bound to them."
                />

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Treasury identity</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Active mandates</TableHead>
                      <TableHead>Budget in motion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.dashboard.agents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-muted-foreground"
                        >
                          No agent rows exist in the runtime store.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.dashboard.agents.map((agent) => {
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
                              <div className="text-xs text-steel">
                                {agent.id}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusPill
                                label={agent.status}
                                tone={
                                  agent.status === "active"
                                    ? "success"
                                    : "danger"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <StatusPill
                                  label={agentIdentityLabel(agent)}
                                  tone={agentIdentityTone(agent)}
                                />
                                <div className="text-xs text-steel">
                                  {formatShortAddress(agent.onchainAddress)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-charcoal">
                                {formatAgentWalletProvider(agent)}
                              </div>
                              <div className="text-xs text-steel">
                                {formatAgentChain(agent)}
                              </div>
                            </TableCell>
                            <TableCell>{mandates.length}</TableCell>
                            <TableCell>{formatUsd(exposure)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </ConsolePanel>

              <ConsoleCodeSurface
                title="Agent control"
                summary="Agents are governed identities. Spend authority comes from mandates — this screen does not execute payments."
                className="min-w-0"
              >
                <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                  <p>
                    Agent identity is loaded from the live runtime store and
                    treasury enforcement reads the persisted on-chain address.
                  </p>
                  <p>
                    If identity is unmapped, treasury-enabled execution fails
                    closed until a verified wallet binding is stored.
                  </p>
                  <p>
                    To change what an agent may spend, update or revoke the
                    mandate. To change who enforces spend on-chain, rotate the
                    verified agent identity.
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
