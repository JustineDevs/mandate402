import { OperatorConsole } from "@/components/operator-console";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardData } from "@/lib/dashboard-data";

type DashboardProps = {
  accessToken: string;
  data: DashboardData;
  onChanged: () => Promise<void>;
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function Dashboard({ accessToken, data, onChanged }: DashboardProps) {
  const activeMandate = data.mandates[0];

  return (
    <div className="dashboard">
      <div className="cards">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="eyebrow">Live Mandates</div>
            <div className="metric mt-1 font-sans">
              {data.metrics.liveMandates}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="footer-note text-muted-foreground">
              Morph-issued treasury lanes with operator oversight.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="eyebrow">Reserved + Consumed</div>
            <div className="metric mt-1 font-sans">
              {formatUsd(data.metrics.spendReservedPlusConsumed)}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="footer-note text-muted-foreground">
              Reservation accounting stays separate from final settlement truth.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="eyebrow">Blocked Attempts</div>
            <div className="metric mt-1 font-sans">
              {data.metrics.blockedAttempts}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="footer-note text-muted-foreground">
              No-call failures are enforced before vendor dispatch.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="eyebrow">Fallback Gate</div>
            <div className="metric mt-1 font-sans">
              {data.fallbackGate.decision_status}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="footer-note text-muted-foreground">
              Ecosystem-first stays active until the tracked gate explicitly
              opens.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="sections">
        <div className="stack">
          <Card className="shadow-sm" id="mandate-form">
            <CardHeader className="border-b border-border pb-4">
              <div className="eyebrow">Issue New Mandate</div>
            </CardHeader>
            <CardContent className="pt-6">
              <OperatorConsole
                accessToken={accessToken}
                agents={data.agents}
                mandates={data.mandates}
                attempts={data.attempts}
                onChanged={onChanged}
                vendors={data.vendors}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="eyebrow">Open Incidents</div>
            </CardHeader>
            <CardContent>
              {data.incidents.length === 0 ? (
                <p className="muted">No open reconciliation incidents.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <span
                            className={`badge ${
                              incident.severity === "danger"
                                ? "danger"
                                : "warning"
                            }`}
                          >
                            {incident.severity}
                          </span>
                        </TableCell>
                        <TableCell>{incident.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {incident.detail}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="eyebrow">Mandate Snapshot</div>
            </CardHeader>
            <CardContent>
              {activeMandate ? (
                <>
                  <div className="mt-2 grid gap-4 sm:grid-cols-2">
                    <div className="field space-y-2">
                      <Label htmlFor="snapshot-mandate-name">
                        Mandate name
                      </Label>
                      <Input
                        id="snapshot-mandate-name"
                        defaultValue={activeMandate.name}
                        readOnly
                        className="bg-muted/40"
                      />
                    </div>
                    <div className="field space-y-2">
                      <Label htmlFor="snapshot-agent-name">
                        Assigned agent
                      </Label>
                      <Input
                        id="snapshot-agent-name"
                        defaultValue={activeMandate.agentName}
                        readOnly
                        className="bg-muted/40"
                      />
                    </div>
                    <div className="field space-y-2">
                      <Label htmlFor="snapshot-budget-cap">Budget cap</Label>
                      <Input
                        id="snapshot-budget-cap"
                        defaultValue={formatUsd(activeMandate.budgetCapCents)}
                        readOnly
                        className="bg-muted/40"
                      />
                    </div>
                    <div className="field space-y-2">
                      <Label htmlFor="snapshot-expiry">Expiry</Label>
                      <Input
                        id="snapshot-expiry"
                        defaultValue={activeMandate.expiresAt}
                        readOnly
                        className="bg-muted/40"
                      />
                    </div>
                  </div>
                  <div className="field mt-6 space-y-2">
                    <Label htmlFor="snapshot-approved-vendors">
                      Approved vendors
                    </Label>
                    <div className="chip-grid" id="snapshot-approved-vendors">
                      {activeMandate.approvedVendorIds.map((vendorId) => (
                        <span className="chip" key={vendorId}>
                          {vendorId}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="actions mt-5 flex flex-wrap gap-2">
                    <span className="badge success">
                      {activeMandate.status}
                    </span>
                    <span className="badge warning">
                      anchor {activeMandate.morphIssueTxId}
                    </span>
                  </div>
                </>
              ) : (
                <p className="muted">
                  No live mandate is available yet. Create one from the operator
                  console to populate this snapshot.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm" id="transactions">
            <CardHeader className="border-b border-border pb-4">
              <div className="eyebrow">Payment Attempts</div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Financial</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Reason / Charge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>{attempt.vendorId}</TableCell>
                      <TableCell>
                        <span
                          className={`badge ${
                            attempt.financialOutcome ===
                            "executed_charge_succeeded"
                              ? "success"
                              : attempt.financialOutcome === "policy_denied"
                                ? "danger"
                                : "warning"
                          }`}
                        >
                          {attempt.financialOutcome}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`badge ${
                            attempt.receiptEvidence === "received_valid"
                              ? "success"
                              : attempt.receiptEvidence === "required_pending"
                                ? "warning"
                                : attempt.receiptEvidence === "not_required"
                                  ? "warning"
                                  : "danger"
                          }`}
                        >
                          {attempt.receiptEvidence}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {attempt.blockedReason ??
                          attempt.chargeReference ??
                          "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="eyebrow">Audit Timeline</div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.auditEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.type}</TableCell>
                      <TableCell>{entry.message}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.createdAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="pricing-card-shell shadow-sm">
            <CardHeader>
              <div className="eyebrow">Pricing</div>
              <div className="section-heading">
                Operational tiers for governed agent spend
              </div>
            </CardHeader>
            <CardContent>
              <div className="pricing-grid">
                <div className="pricing-card">
                  <div className="pricing-name">Starter</div>
                  <div className="pricing-price">Free</div>
                  <p className="pricing-copy">
                    Local prototypes and internal experimentation with mandate
                    controls.
                  </p>
                  <ul className="pricing-list">
                    <li>Single workspace</li>
                    <li>Basic mandate policies</li>
                    <li>Manual operator oversight</li>
                  </ul>
                </div>
                <div className="pricing-card pricing-card-featured">
                  <div className="badge-featured">Recommended</div>
                  <div className="pricing-name">Growth</div>
                  <div className="pricing-price">
                    $199<span>/mo</span>
                  </div>
                  <p className="pricing-copy">
                    Production agent teams with audit, reconciliation, and
                    treasury guardrails.
                  </p>
                  <ul className="pricing-list">
                    <li>Multiple agents</li>
                    <li>x402 vendor governance</li>
                    <li>Audit timeline and correlation</li>
                  </ul>
                </div>
                <div className="pricing-card">
                  <div className="pricing-name">Command</div>
                  <div className="pricing-price">Custom</div>
                  <p className="pricing-copy">
                    Governance-heavy organizations with stricter treasury and
                    compliance controls.
                  </p>
                  <ul className="pricing-list">
                    <li>Custom policies</li>
                    <li>Advanced approval flows</li>
                    <li>Explorer / release alignment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="academy-shell shadow-sm">
            <CardHeader>
              <div className="eyebrow">Mandate402 Academy</div>
              <div className="section-heading">
                Playbooks for safe autonomous spending
              </div>
            </CardHeader>
            <CardContent>
              <div className="academy-grid">
                <article className="academy-card">
                  <span className="academy-tag governance">Governance</span>
                  <h3>Policy Design</h3>
                  <p>
                    Model limits, facilitators, and revocation rules before
                    agents touch money.
                  </p>
                </article>
                <article className="academy-card">
                  <span className="academy-tag payments">Payments</span>
                  <h3>x402 Payment Loops</h3>
                  <p>
                    Understand challenge, pay, vendor response, and correlation
                    status lifecycles.
                  </p>
                </article>
                <article className="academy-card">
                  <span className="academy-tag compliance">Compliance</span>
                  <h3>Audit and Receipts</h3>
                  <p>
                    Keep financial truth and receipt truth visible without
                    collapsing one into the other.
                  </p>
                </article>
                <article className="academy-card">
                  <span className="academy-tag agents">Agents</span>
                  <h3>Unknown Attempt Recovery</h3>
                  <p>
                    Handle delayed vendor settlement safely with reservation and
                    explicit reconciliation.
                  </p>
                </article>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="stack">
          <Card className="border-hairline-dark bg-canvas-dark text-on-dark shadow-sm ring-1 ring-on-dark/10">
            <CardHeader className="pb-2">
              <div className="eyebrow text-on-dark-muted">
                Fallback Gate Artifact
              </div>
              <div className="metric font-sans text-[1.3rem] text-on-dark">
                {data.fallbackGate.decision_status}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-on-dark-muted">
              <p className="leading-relaxed">
                Cutoff date: {data.fallbackGate.cutoff_date}. Primary target
                count: {data.fallbackGate.primary_targets.length}.
              </p>
              <p className="footer-note text-on-dark-muted">
                Artifact path:{" "}
                <code className="text-on-dark/90">
                  config/mandate402-fallback-gate.md
                </code>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="eyebrow">Primary Vendors</div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {data.vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <strong>{vendor.name}</strong>
                        <div className="text-muted-foreground">{vendor.id}</div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`badge ${vendor.mode === "primary" ? "success" : "warning"}`}
                        >
                          {vendor.mode}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {vendor.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="eyebrow">Morph Anchors</div>
            </CardHeader>
            <CardContent>
              {activeMandate ? (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Issue tx</TableCell>
                      <TableCell className="text-muted-foreground">
                        {activeMandate.morphIssueTxId}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Revoke tx</TableCell>
                      <TableCell className="text-muted-foreground">
                        {activeMandate.morphRevokeTxId ?? "Not revoked yet"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Mandate state</TableCell>
                      <TableCell>
                        <span className="badge success">
                          {activeMandate.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p className="muted">
                  No mandate selected — issue a mandate to see Morph anchors.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="cta-banner">
        <div>
          <div className="eyebrow">Command Layer</div>
          <h2>Give your agents a budget, not your bank account.</h2>
          <p>
            Use Morph settlement, x402 payment rails, and mandate-driven
            treasury controls without handing raw funds to untrusted automation.
          </p>
        </div>
        <div className="cta-row">
          <a className="pill pill-primary" href="#mandate-form">
            Start from Mandates
          </a>
          <a className="pill pill-secondary-on-dark" href="#transactions">
            Review the audit proof
          </a>
        </div>
      </section>

      <footer className="footer-region">
        <div className="footer-grid">
          <div>
            <div className="footer-heading">Product</div>
            <a className="footer-link" href="#mandate-form">
              Mandates
            </a>
            <a className="footer-link" href="#transactions">
              Audit Trail
            </a>
            <a className="footer-link" href="#transactions">
              Reconciliation
            </a>
          </div>
          <div>
            <div className="footer-heading">Infra</div>
            <span className="footer-link">Morph Hoodi</span>
            <span className="footer-link">x402</span>
            <span className="footer-link">Pyth</span>
          </div>
          <div>
            <div className="footer-heading">Docs</div>
            <span className="footer-link">README</span>
            <span className="footer-link">AGENTS</span>
            <span className="footer-link">Contributing</span>
          </div>
          <div>
            <div className="footer-heading">Remote</div>
            <a
              className="footer-link"
              href="https://github.com/JustineDevs/mandate402"
            >
              GitHub
            </a>
            <span className="footer-link">Release automation</span>
            <span className="footer-link">Contract verify</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
