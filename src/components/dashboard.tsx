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
          <div className="footer-note">Morph-issued and operator visible.</div>
        </div>
        <div className="card">
          <div className="eyebrow">Reserved + Consumed</div>
          <div className="metric">
            {formatUsd(data.metrics.spendReservedPlusConsumed)}
          </div>
          <div className="footer-note">
            Held reservation remains separate from confirmed charge.
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Blocked Attempts</div>
          <div className="metric">{data.metrics.blockedAttempts}</div>
          <div className="footer-note">
            Verified no-call failures before vendor dispatch.
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Fallback Gate</div>
          <div className="metric">{data.fallbackGate.decision_status}</div>
          <div className="footer-note">
            Primary vendors stay ecosystem-first until gate activates.
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
              Artifact path: <code>.omx/plans/mandate402-fallback-gate.md</code>
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
    </div>
  );
}
