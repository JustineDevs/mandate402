import { OperatorConsole } from "@/components/operator-console";
import type { DashboardData } from "@/lib/dashboard-data";

type DashboardProps = {
  data: DashboardData;
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function Dashboard({ data }: DashboardProps) {
  const activeMandate = data.mandates[0];

  return (
    <div className="dashboard">
      <div className="cards">
        <div className="card">
          <div className="eyebrow">Live Mandates</div>
          <div className="metric">{data.metrics.liveMandates}</div>
          <div className="footer-note">
            Morph-issued treasury lanes with operator oversight.
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Reserved + Consumed</div>
          <div className="metric">
            {formatUsd(data.metrics.spendReservedPlusConsumed)}
          </div>
          <div className="footer-note">
            Reservation accounting stays separate from final settlement truth.
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Blocked Attempts</div>
          <div className="metric">{data.metrics.blockedAttempts}</div>
          <div className="footer-note">
            No-call failures are enforced before vendor dispatch.
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Fallback Gate</div>
          <div className="metric">{data.fallbackGate.decision_status}</div>
          <div className="footer-note">
            Ecosystem-first stays active until the tracked gate explicitly
            opens.
          </div>
        </div>
      </div>

      <div className="sections">
        <div className="stack">
          <div className="card">
            <div className="eyebrow" id="mandate-form">
              Issue New Mandate
            </div>
            <OperatorConsole
              mandate={activeMandate}
              attempts={data.attempts}
              vendors={data.vendors}
            />
          </div>

          <div className="card">
            <div className="eyebrow">Mandate Snapshot</div>
            <div className="inline-grid" style={{ marginTop: 18 }}>
              <div className="field">
                <label htmlFor="snapshot-mandate-name">Mandate name</label>
                <input
                  id="snapshot-mandate-name"
                  defaultValue={activeMandate.name}
                  readOnly
                />
              </div>
              <div className="field">
                <label htmlFor="snapshot-agent-name">Assigned agent</label>
                <input
                  id="snapshot-agent-name"
                  defaultValue={activeMandate.agentName}
                  readOnly
                />
              </div>
              <div className="field">
                <label htmlFor="snapshot-budget-cap">Budget cap</label>
                <input
                  id="snapshot-budget-cap"
                  defaultValue={formatUsd(activeMandate.budgetCapCents)}
                  readOnly
                />
              </div>
              <div className="field">
                <label htmlFor="snapshot-expiry">Expiry</label>
                <input
                  id="snapshot-expiry"
                  defaultValue={activeMandate.expiresAt}
                  readOnly
                />
              </div>
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="snapshot-approved-vendors">
                Approved vendors
              </label>
              <div className="chip-grid" id="snapshot-approved-vendors">
                {activeMandate.approvedVendorIds.map((vendorId) => (
                  <span className="chip" key={vendorId}>
                    {vendorId}
                  </span>
                ))}
              </div>
            </div>
            <div className="actions" style={{ marginTop: 20 }}>
              <span className="badge success">{activeMandate.status}</span>
              <span className="badge warning">
                anchor {activeMandate.morphIssueTxId}
              </span>
            </div>
          </div>

          <div className="card" id="transactions">
            <div className="eyebrow">Payment Attempts</div>
            <table className="table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Financial</th>
                  <th>Receipt</th>
                  <th>Reason / Charge</th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>{attempt.vendorId}</td>
                    <td>
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
                    </td>
                    <td>
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
                    </td>
                    <td className="muted">
                      {attempt.blockedReason ?? attempt.chargeReference ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="eyebrow">Audit Timeline</div>
            <table className="table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.auditEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.type}</td>
                    <td>{entry.message}</td>
                    <td className="muted">{entry.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card pricing-card-shell">
            <div className="eyebrow">Pricing</div>
            <div className="section-heading">
              Operational tiers for governed agent spend
            </div>
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
          </div>

          <div className="card academy-shell">
            <div className="eyebrow">Mandate402 Academy</div>
            <div className="section-heading">
              Playbooks for safe autonomous spending
            </div>
            <div className="academy-grid">
              <article className="academy-card">
                <span className="academy-tag governance">Governance</span>
                <h3>Policy Design</h3>
                <p>
                  Model limits, facilitators, and revocation rules before agents
                  touch money.
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
          </div>
        </div>

        <div className="stack">
          <div className="card dark">
            <div className="eyebrow">Fallback Gate Artifact</div>
            <div className="metric" style={{ fontSize: "1.3rem" }}>
              {data.fallbackGate.decision_status}
            </div>
            <p className="muted" style={{ color: "#bfd0d6", lineHeight: 1.7 }}>
              Cutoff date: {data.fallbackGate.cutoff_date}. Primary target
              count: {data.fallbackGate.primary_targets.length}.
            </p>
            <div className="footer-note">
              Artifact path: <code>config/mandate402-fallback-gate.md</code>
            </div>
          </div>

          <div className="card">
            <div className="eyebrow">Primary Vendors</div>
            <table className="table" style={{ marginTop: 12 }}>
              <tbody>
                {data.vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <strong>{vendor.name}</strong>
                      <div className="muted">{vendor.id}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          vendor.mode === "primary" ? "success" : "warning"
                        }`}
                      >
                        {vendor.mode}
                      </span>
                    </td>
                    <td className="muted">{vendor.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="eyebrow">Morph Anchors</div>
            <table className="table" style={{ marginTop: 12 }}>
              <tbody>
                <tr>
                  <td>Issue tx</td>
                  <td className="muted">{activeMandate.morphIssueTxId}</td>
                </tr>
                <tr>
                  <td>Revoke tx</td>
                  <td className="muted">
                    {activeMandate.morphRevokeTxId ?? "Not revoked yet"}
                  </td>
                </tr>
                <tr>
                  <td>Mandate state</td>
                  <td>
                    <span className="badge success">
                      {activeMandate.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
