"use client";

import Link from "next/link";

import { ConsoleCard, ConsolePanel } from "@/components/console-card";
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
  agentIdentityLabel,
  agentIdentityTone,
  formatShortAddress,
} from "@/lib/agent-identity-view";
import { consoleStatGrid3 } from "@/lib/console-layout";
import {
  buildRevokedMandates,
  formatUsd,
  mandateTone,
} from "@/lib/operator-view-model";

export default function MandatesPage() {
  return (
    <OperatorGate
      title="Sign in to view mandates"
      description="Open the mandate registry to issue and review spending limits."
    >
      {({ data }) => {
        const liveMandates = data.dashboard.mandates.filter(
          (mandate) =>
            mandate.status === "issued_active" ||
            mandate.status === "issued_reserved",
        );
        const revokedMandates = buildRevokedMandates(data.dashboard);
        const agentsById = new Map(
          data.dashboard.agents.map((agent) => [agent.id, agent]),
        );

        return (
          <ConsoleShell
            activeTab="Mandates"
            eyebrow="Mandates"
            title="Mandate registry"
            summary="Issue and review mandates with limits, vendors, and revocation history."
            actions={
              <div className="flex flex-wrap gap-2">
                <Link href="/mandates/create">
                  <Button className="rounded-full bg-white font-bold text-mandate-green hover:bg-white/90">
                    Create Mandate
                  </Button>
                </Link>
                <StatusPill
                  label={`${liveMandates.length} Live`}
                  tone="success"
                />
                <StatusPill
                  label={`${revokedMandates.length} Revoked / Expired`}
                  tone="danger"
                />
              </div>
            }
          >
            <div className={consoleStatGrid3()}>
              <ConsoleCard
                eyebrow="Budget Under Control"
                value={formatUsd(
                  data.dashboard.metrics.spendReservedPlusConsumed,
                )}
              >
                Reserved and consumed amounts stay visible as operator-facing
                spend, instead of forcing non-crypto users to decode raw ledger
                fields.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Primary Vendors"
                value={String(
                  data.dashboard.vendors.filter(
                    (vendor) => vendor.mode === "primary",
                  ).length,
                )}
              >
                Mandates are scoped to named vendor paths so operators can see
                exactly which endpoints are allowed to receive a machine
                payment.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Receipt Discipline"
                value={String(
                  data.dashboard.mandates.filter(
                    (mandate) => mandate.requiresReceiptCapability,
                  ).length,
                )}
              >
                Receipt expectations stay explicit so a successful payment is
                never confused with proof of delivery.
              </ConsoleCard>
            </div>

            <section className="grid min-w-0 gap-4 sm:gap-6">
              <ConsolePanel>
                <SectionHeader
                  eyebrow="Live Spending Lanes"
                  title="Active mandates"
                  description="These are the mandates that can still authorize a payment attempt."
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mandate</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Consumed</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveMandates.map((mandate) => {
                      const agent = agentsById.get(mandate.agentId);

                      return (
                        <TableRow key={mandate.id}>
                          <TableCell>
                            <div className="font-semibold text-charcoal">
                              {mandate.name}
                            </div>
                            <div className="text-xs text-steel">
                              {mandate.id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-charcoal">
                              {mandate.agentName}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {agent ? (
                                <>
                                  <StatusPill
                                    label={agentIdentityLabel(agent)}
                                    tone={agentIdentityTone(agent)}
                                  />
                                  <span className="text-xs text-steel">
                                    {formatShortAddress(agent.onchainAddress)}
                                  </span>
                                </>
                              ) : (
                                <StatusPill
                                  label="identity_unmapped"
                                  tone="danger"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusPill
                              label={mandate.status}
                              tone={mandateTone(mandate.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {formatUsd(mandate.budgetCapCents)}
                          </TableCell>
                          <TableCell>
                            {formatUsd(mandate.reservedCents)}
                          </TableCell>
                          <TableCell>
                            {formatUsd(mandate.consumedCents)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {mandate.expiresAt}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ConsolePanel>

              <ConsolePanel>
                <SectionHeader
                  eyebrow="Closed Lanes"
                  title="Revoked and expired mandates"
                  description="Operators can prove a mandate is no longer allowed to spend even though its audit trail remains visible."
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mandate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget Used</TableHead>
                      <TableHead>Revoke / Expiry Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revokedMandates.map((mandate) => (
                      <TableRow key={mandate.id}>
                        <TableCell>
                          <div className="font-semibold text-charcoal">
                            {mandate.name}
                          </div>
                          <div className="text-xs text-steel">{mandate.id}</div>
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            label={mandate.status}
                            tone={mandateTone(mandate.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {formatUsd(mandate.consumedCents)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {mandate.morphRevokeTxId ?? mandate.expiresAt}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ConsolePanel>
            </section>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
