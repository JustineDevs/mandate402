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

export default async function SettingsPage() {
  const data = await getDashboardData();
  const { systemStatus } = data;

  return (
    <ConsoleShell
      activeTab="Settings"
      eyebrow="Runtime and Settings"
      title="Surface readiness before operators have to guess."
      summary="This page keeps chain, worker, store, and fallback posture visible so degraded runtime conditions are explicit and actionable."
      actions={
        <>
          <StatusPill
            label={systemStatus.status}
            tone={systemStatus.status === "ok" ? "success" : "warning"}
          />
          <StatusPill
            label={systemStatus.blockchain.status}
            tone={
              systemStatus.blockchain.status === "ready" ? "success" : "warning"
            }
          />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-[24px] border border-[#d8e6dd] bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
            Queue health
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#64748b]">Queued dispatch tasks</dt>
              <dd className="font-semibold text-[#0f1720]">
                {systemStatus.queuedDispatchTasks}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#64748b]">Queued reconciliation tasks</dt>
              <dd className="font-semibold text-[#0f1720]">
                {systemStatus.queuedReconciliationTasks}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#64748b]">Execution unknown attempts</dt>
              <dd className="font-semibold text-[#0f1720]">
                {systemStatus.unknownAttempts}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[24px] border border-[#d8e6dd] bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
            Treasury state
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#64748b]">Reserved</dt>
              <dd className="font-semibold text-[#0f1720]">
                {formatUsd(systemStatus.reservedCents)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#64748b]">Consumed</dt>
              <dd className="font-semibold text-[#0f1720]">
                {formatUsd(systemStatus.consumedCents)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#64748b]">Fallback decision</dt>
              <dd className="font-semibold text-[#0f1720]">
                {systemStatus.fallbackDecision}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[24px] border border-[#d8e6dd] bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
            Blockchain readiness
          </div>
          <div className="mt-4 space-y-3 text-sm text-[#475569]">
            <p>Network: {systemStatus.blockchain.network.label}</p>
            <p>
              Anchoring ready:{" "}
              {systemStatus.blockchain.anchoringReady ? "Yes" : "No"}
            </p>
            <p>
              Signer ready: {systemStatus.blockchain.signerReady ? "Yes" : "No"}
            </p>
            <p>
              Treasury mode: {systemStatus.blockchain.treasuryEnforcementMode}
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-[#d8e6dd] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
              Integrity
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#0f1720]">
              Runtime warnings and integrity
            </h2>
          </div>
          <StatusPill
            label={systemStatus.integrity.status}
            tone={
              systemStatus.integrity.status === "ok" ? "success" : "warning"
            }
          />
        </div>
        <div className="space-y-3">
          {[
            ...systemStatus.blockchain.warnings,
            ...systemStatus.integrity.issues.map((issue) => issue.message),
          ].length === 0 ? (
            <p className="text-sm text-[#64748b]">
              No warnings are currently recorded.
            </p>
          ) : (
            [
              ...systemStatus.blockchain.warnings,
              ...systemStatus.integrity.issues.map((issue) => issue.message),
            ].map((warning) => (
              <div
                key={warning}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                {warning}
              </div>
            ))
          )}
        </div>
      </section>
    </ConsoleShell>
  );
}
