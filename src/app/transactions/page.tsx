import { ConsoleShell } from "@/components/console-shell";
import { StatusPill } from "@/components/status-pill";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function TransactionsPage() {
  const data = await getDashboardData();

  return (
    <ConsoleShell
      activeTab="Transactions"
      eyebrow="Attempt Ledger"
      title="See financial outcome, receipt state, and queue truth together."
      summary="Transactions keep reservation, dispatch, blocked reasons, and receipt evidence explicit so operators do not mistake queue progress for settlement truth."
      actions={
        <>
          <StatusPill label={`${data.attempts.length} attempts`} tone="info" />
          <StatusPill
            label={`${data.systemStatus.unknownAttempts} unknown`}
            tone="warning"
          />
        </>
      }
    >
      <section className="rounded-[28px] border border-[#d8e6dd] bg-white p-6 shadow-sm md:p-8">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e4ece9] text-[#64748b]">
              <tr>
                <th className="py-3 pr-4 font-semibold">Attempt</th>
                <th className="py-3 pr-4 font-semibold">Vendor</th>
                <th className="py-3 pr-4 font-semibold">Amount</th>
                <th className="py-3 pr-4 font-semibold">Financial</th>
                <th className="py-3 pr-4 font-semibold">Receipt</th>
                <th className="py-3 font-semibold">Reason / Charge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef3f0]">
              {data.attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="py-4 pr-4 font-medium text-[#0f1720]">
                    {attempt.id}
                  </td>
                  <td className="py-4 pr-4 text-[#475569]">
                    {attempt.vendorId}
                  </td>
                  <td className="py-4 pr-4 text-[#475569]">
                    {formatUsd(attempt.amountCents)}
                  </td>
                  <td className="py-4 pr-4">
                    <StatusPill
                      label={attempt.financialOutcome}
                      tone={
                        attempt.financialOutcome === "executed_charge_succeeded"
                          ? "success"
                          : attempt.financialOutcome === "policy_denied"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </td>
                  <td className="py-4 pr-4">
                    <StatusPill
                      label={attempt.receiptEvidence}
                      tone={
                        attempt.receiptEvidence === "received_valid"
                          ? "success"
                          : attempt.receiptEvidence === "missing_timeout"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </td>
                  <td className="py-4 text-[#475569]">
                    {attempt.blockedReason ?? attempt.chargeReference ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ConsoleShell>
  );
}
