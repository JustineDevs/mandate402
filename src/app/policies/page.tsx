import { ConsoleShell } from "@/components/console-shell";
import { StatusPill } from "@/components/status-pill";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const data = await getDashboardData();
  const blockedAttempts = data.attempts.filter(
    (attempt) => attempt.status === "policy_denied",
  );

  return (
    <ConsoleShell
      activeTab="Policies"
      eyebrow="Policy Registry"
      title="Make policy truth inspectable."
      summary="Policy surfaces should show what the treasury will allow, what it blocks before dispatch, and what is currently degraded or awaiting human action."
      actions={
        <>
          <StatusPill
            label={`Fallback: ${data.fallbackGate.decision_status}`}
            tone="warning"
          />
          <StatusPill
            label={`${blockedAttempts.length} blocked attempts`}
            tone="danger"
          />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Vendor allowlists",
            body: "Primary vendors are explicitly named and fallback remains gated until the tracked decision allows it.",
          },
          {
            title: "Receipt discipline",
            body: "Financial outcome and receipt evidence remain separate states, which prevents false-positive operator assumptions.",
          },
          {
            title: "Reconciliation pressure",
            body: "Unknown execution states stay visible until correlation proves final truth.",
          },
        ].map((card) => (
          <section
            key={card.title}
            className="rounded-[24px] border border-[#d8e6dd] bg-white p-6 shadow-sm"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
              Policy family
            </div>
            <h2 className="mt-3 text-xl font-bold text-[#0f1720]">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#475569]">{card.body}</p>
          </section>
        ))}
      </div>

      <section className="rounded-[28px] border border-[#d8e6dd] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
              Blocked attempts
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#0f1720]">
              Reasons are never hidden.
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e4ece9] text-[#64748b]">
              <tr>
                <th className="py-3 pr-4 font-semibold">Attempt</th>
                <th className="py-3 pr-4 font-semibold">Vendor</th>
                <th className="py-3 pr-4 font-semibold">Reason</th>
                <th className="py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef3f0]">
              {blockedAttempts.length === 0 ? (
                <tr>
                  <td className="py-6 text-[#64748b]" colSpan={4}>
                    No blocked attempts are recorded right now.
                  </td>
                </tr>
              ) : (
                blockedAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="py-4 pr-4 font-medium text-[#0f1720]">
                      {attempt.id}
                    </td>
                    <td className="py-4 pr-4 text-[#475569]">
                      {attempt.vendorId}
                    </td>
                    <td className="py-4 pr-4 text-[#475569]">
                      {attempt.blockedReason ?? "Blocked by policy engine"}
                    </td>
                    <td className="py-4">
                      <StatusPill
                        label={attempt.financialOutcome}
                        tone="danger"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ConsoleShell>
  );
}
