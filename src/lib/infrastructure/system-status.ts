import { getBlockchainRuntimeHealth } from "@/lib/blockchain/health";
import {
  getVendorRuntimeEndpointSummary,
  isProductionEnv,
} from "@/lib/infrastructure/env";
import { readFallbackGate } from "@/lib/infrastructure/fallback-gate";
import { readStore } from "@/lib/infrastructure/store";
import { buildStoreIntegrityReport } from "@/lib/infrastructure/store-integrity";

const UNKNOWN_ATTEMPT_ESCALATION_MS = 15 * 60 * 1000;

export async function getSystemStatus() {
  const [store, fallbackGate] = await Promise.all([
    readStore(),
    readFallbackGate(),
  ]);

  const integrity = buildStoreIntegrityReport(store);
  const blockchain = await getBlockchainRuntimeHealth(
    store.agents.map((agent) => agent.id),
  );
  const vendorRuntime = getVendorRuntimeEndpointSummary();
  const missingPrimaryVendors = vendorRuntime
    .filter((vendor) => !vendor.configured)
    .map((vendor) => vendor.id);
  const localOnlyPrimaryVendors = vendorRuntime
    .filter((vendor) => vendor.localOnly)
    .map((vendor) => vendor.id);
  const unknownAttempts = store.attempts.filter(
    (attempt) => attempt.status === "execution_unknown",
  ).length;
  const staleUnknownAttempts = store.attempts.filter((attempt) => {
    if (attempt.status !== "execution_unknown") {
      return false;
    }

    const updatedAt = Date.parse(attempt.updatedAt);
    return (
      Number.isFinite(updatedAt) &&
      Date.now() - updatedAt >= UNKNOWN_ATTEMPT_ESCALATION_MS
    );
  }).length;
  const activeMandates = store.mandates.filter(
    (mandate) => mandate.status === "issued_active",
  ).length;
  const queuedDispatchTasks = store.workerTasks.filter(
    (task) => task.kind === "dispatch_attempt" && task.status === "queued",
  ).length;
  const queuedReconciliationTasks = store.workerTasks.filter(
    (task) => task.kind === "reconcile_attempt" && task.status === "queued",
  ).length;
  const queuedAttempts = queuedDispatchTasks + queuedReconciliationTasks;

  const status =
    integrity.status === "ok" &&
    blockchain.status === "ready" &&
    unknownAttempts === 0 &&
    staleUnknownAttempts === 0 &&
    queuedAttempts === 0 &&
    (!isProductionEnv() ||
      (missingPrimaryVendors.length === 0 &&
        localOnlyPrimaryVendors.length === 0))
      ? "ok"
      : "degraded";

  return {
    status,
    agents: store.agents.length,
    mandates: store.mandates.length,
    activeMandates,
    attempts: store.attempts.length,
    auditEntries: store.auditEntries.length,
    domainEvents: store.domainEvents.length,
    unknownAttempts,
    staleUnknownAttempts,
    unknownAttemptEscalationMinutes: UNKNOWN_ATTEMPT_ESCALATION_MS / 60_000,
    queuedAttempts,
    workerTasks: store.workerTasks.length,
    queuedDispatchTasks,
    queuedReconciliationTasks,
    vendorRuntime: {
      primaryConfigured: missingPrimaryVendors.length === 0,
      missingPrimaryVendors,
      localOnlyPrimaryVendors,
      fallbackEnabled: false,
      endpoints: vendorRuntime,
    },
    fallbackDecision: fallbackGate.decision_status,
    integrity,
    blockchain,
  };
}
