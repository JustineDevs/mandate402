import { ConsoleShell } from "@/components/console-shell";
import { StatusPill } from "@/components/status-pill";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const data = await getDashboardData();
  const receiptAttempts = data.attempts.filter(
    (attempt) => attempt.receiptEvidence !== "not_required",
  );

  return (
    <ConsoleShell
      activeTab="Receipts"
      eyebrow="Receipt Evidence"
      title="Keep evidence separate from payment success."
      summary="Receipt pages should show which attempts still owe evidence, which ones are valid, and where the audit trail recorded the transition."
      actions={
        <>
          <StatusPill
            label={`${receiptAttempts.length} receipt-tracked`}
            tone="info"
          />
          <StatusPill
            label={`${data.auditEntries.length} audit entries`}
            tone="neutral"
          />
        </>
      }
    >
      <section className="rounded-[28px] border border-[#d8e6dd] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
              Receipt ledger
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#0f1720]">
              Attempt evidence status
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-[#d8e6dd] px-4 py-2 text-sm font-semibold text-[#1f2937]"
            >
              Export CSV
            </button>
            <button
              type="button"
              className="rounded-full bg-[#15803d] px-4 py-2 text-sm font-semibold text-white"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e4ece9] text-[#64748b]">
              <tr>
                <th className="py-3 pr-4 font-semibold">Attempt</th>
                <th className="py-3 pr-4 font-semibold">Vendor</th>
                <th className="py-3 pr-4 font-semibold">Receipt state</th>
                <th className="py-3 font-semibold">Financial state</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef3f0]">
              {receiptAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="py-4 pr-4 font-medium text-[#0f1720]">
                    {attempt.id}
                  </td>
                  <td className="py-4 pr-4 text-[#475569]">
                    {attempt.vendorId}
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
                  <td className="py-4">
                    <StatusPill
                      label={attempt.financialOutcome}
                      tone="neutral"
                    />
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
