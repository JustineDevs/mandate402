import { readFallbackGate } from "@/lib/infrastructure/fallback-gate";
import { readStore } from "@/lib/infrastructure/store";
import { getSystemStatus } from "@/lib/infrastructure/system-status";
import {
  listAgents,
  listAttempts,
  listDomainEvents,
  listMandates,
} from "@/lib/modules/mandates";
import { listAuditEntries } from "@/lib/modules/mandates";
import { buildVendorRuntimeRegistry } from "@/lib/vendor-registry";

const UNKNOWN_ATTEMPT_ESCALATION_MS = 15 * 60 * 1000;

export type DashboardIncident = {
  id: string;
  severity: "warning" | "danger";
  kind: "execution_unknown" | "reconciliation_failed";
  title: string;
  detail: string;
  attemptId: string;
  taskId: string | null;
  createdAt: string;
};

export type DashboardData = {
  agents: Awaited<ReturnType<typeof listAgents>>;
  mandates: Awaited<ReturnType<typeof listMandates>>;
  attempts: Awaited<ReturnType<typeof listAttempts>>;
  auditEntries: Awaited<ReturnType<typeof listAuditEntries>>;
  domainEvents: Awaited<ReturnType<typeof listDomainEvents>>;
  vendors: ReturnType<typeof buildVendorRuntimeRegistry>;
  fallbackGate: Awaited<ReturnType<typeof readFallbackGate>>;
  incidents: DashboardIncident[];
  systemStatus: Awaited<ReturnType<typeof getSystemStatus>>;
  metrics: {
    liveMandates: number;
    spendReservedPlusConsumed: number;
    blockedAttempts: number;
  };
};

function buildDashboardIncidents(
  store: Awaited<ReturnType<typeof readStore>>,
): DashboardIncident[] {
  const unknownAttemptIncidents = store.attempts
    .filter((attempt) => attempt.status === "execution_unknown")
    .map((attempt) => ({
      id: `incident_${attempt.id}`,
      severity:
        Number.isFinite(Date.parse(attempt.updatedAt)) &&
        Date.now() - Date.parse(attempt.updatedAt) >=
          UNKNOWN_ATTEMPT_ESCALATION_MS
          ? ("danger" as const)
          : ("warning" as const),
      kind: "execution_unknown" as const,
      title:
        Number.isFinite(Date.parse(attempt.updatedAt)) &&
        Date.now() - Date.parse(attempt.updatedAt) >=
          UNKNOWN_ATTEMPT_ESCALATION_MS
          ? "Attempt exceeded the reconciliation window"
          : "Attempt awaiting reconciliation",
      detail: `${attempt.vendorId} is still unresolved for payment ${attempt.paymentIdentifier}.`,
      attemptId: attempt.id,
      taskId:
        store.workerTasks.find(
          (task) =>
            task.attemptId === attempt.id &&
            task.kind === "reconcile_attempt" &&
            (task.status === "queued" || task.status === "leased"),
        )?.id ?? null,
      createdAt: attempt.updatedAt,
    }));

  const failedReconciliationIncidents = store.workerTasks
    .filter(
      (task) => task.kind === "reconcile_attempt" && task.status === "failed",
    )
    .map((task) => ({
      id: `incident_${task.id}`,
      severity: "danger" as const,
      kind: "reconciliation_failed" as const,
      title: "Reconciliation exhausted retries",
      detail:
        task.lastError ??
        `Reconciliation worker failed for attempt ${task.attemptId}.`,
      attemptId: task.attemptId,
      taskId: task.id,
      createdAt: task.updatedAt,
    }));

  return [...failedReconciliationIncidents, ...unknownAttemptIncidents].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    agents,
    mandates,
    attempts,
    auditEntries,
    domainEvents,
    fallbackGate,
    store,
    systemStatus,
  ] = await Promise.all([
    listAgents(),
    listMandates(),
    listAttempts(),
    listAuditEntries(),
    listDomainEvents(),
    readFallbackGate(),
    readStore(),
    getSystemStatus(),
  ]);

  return {
    agents,
    mandates,
    attempts,
    auditEntries,
    domainEvents,
    vendors: buildVendorRuntimeRegistry({
      runtimeEndpoints: systemStatus.vendorRuntime.endpoints,
      fallbackGate,
    }),
    fallbackGate,
    incidents: buildDashboardIncidents(store),
    systemStatus,
    metrics: {
      liveMandates: mandates.filter((entry) => entry.status === "issued_active")
        .length,
      spendReservedPlusConsumed: mandates.reduce(
        (sum, entry) => sum + entry.consumedCents + entry.reservedCents,
        0,
      ),
      blockedAttempts: attempts.filter(
        (entry) => entry.status === "policy_denied",
      ).length,
    },
  };
}
