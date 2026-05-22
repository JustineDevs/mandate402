import { getBlockchainRuntimeHealth } from "@/lib/blockchain/health";
import { readFallbackGate } from "@/lib/infrastructure/fallback-gate";
import { readStore } from "@/lib/infrastructure/store";
import { buildStoreIntegrityReport } from "@/lib/infrastructure/store-integrity";

export async function getSystemStatus() {
  const [store, fallbackGate] = await Promise.all([
    readStore(),
    readFallbackGate(),
  ]);
  const blockchain = await getBlockchainRuntimeHealth(
    store.agents.map((agent) => agent.id),
  );

  const unknownAttempts = store.attempts.filter(
    (attempt) => attempt.status === "execution_unknown",
  ).length;
  const queuedAttempts = store.attempts.filter(
    (attempt) => attempt.status === "dispatch_queued",
  ).length;
  const dispatchingAttempts = store.attempts.filter(
    (attempt) => attempt.status === "dispatching",
  ).length;
  const queuedDispatchTasks = store.workerTasks.filter(
    (task) => task.kind === "dispatch_attempt" && task.status === "queued",
  ).length;
  const leasedDispatchTasks = store.workerTasks.filter(
    (task) => task.kind === "dispatch_attempt" && task.status === "leased",
  ).length;
  const queuedReconciliationTasks = store.workerTasks.filter(
    (task) => task.kind === "reconcile_attempt" && task.status === "queued",
  ).length;
  const leasedReconciliationTasks = store.workerTasks.filter(
    (task) => task.kind === "reconcile_attempt" && task.status === "leased",
  ).length;
  const activeMandates = store.mandates.filter(
    (mandate) =>
      mandate.status === "issued_active" ||
      mandate.status === "issued_reserved",
  ).length;
  const reservedCents = store.mandates.reduce(
    (total, mandate) => total + mandate.reservedCents,
    0,
  );
  const consumedCents = store.mandates.reduce(
    (total, mandate) => total + mandate.consumedCents,
    0,
  );
  const integrity = buildStoreIntegrityReport(store);

  return {
    status:
      integrity.status === "ok" && blockchain.status !== "degraded"
        ? "ok"
        : "degraded",
    agents: store.agents.length,
    mandates: store.mandates.length,
    activeMandates,
    attempts: store.attempts.length,
    workerTasks: store.workerTasks.length,
    auditEntries: store.auditEntries.length,
    domainEvents: store.domainEvents.length,
    queuedAttempts,
    dispatchingAttempts,
    queuedDispatchTasks,
    leasedDispatchTasks,
    queuedReconciliationTasks,
    leasedReconciliationTasks,
    unknownAttempts,
    reservedCents,
    consumedCents,
    fallbackDecision: fallbackGate.decision_status,
    integrity,
    blockchain,
  };
}
