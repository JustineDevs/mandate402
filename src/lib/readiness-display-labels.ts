import type {
  ProductionReadiness,
  ReadinessReason,
  ReadinessSeverity,
} from "@/lib/infrastructure/production-readiness";
import { formatOperatorToken } from "@/lib/operator-display-labels";

export type ReadinessCheckKey =
  | "postgres"
  | "operatorAuth"
  | "morphAnchoring"
  | "primaryVendors"
  | "worker"
  | "fallback";

const CHECK_LABELS: Record<ReadinessCheckKey, string> = {
  postgres: "Database",
  operatorAuth: "Operator sign-in",
  morphAnchoring: "Chain anchoring",
  primaryVendors: "Primary vendors",
  worker: "Background workers",
  fallback: "Backup vendor routes",
};

const REASON_HEADLINES: Record<string, string> = {
  postgres_persistence_required: "Production database mode is required",
  postgres_url_missing: "Database connection is missing",
  postgres_unreachable: "Database is unreachable",
  operator_auth_not_configured: "Operator sign-in is not configured",
  morph_anchoring_not_ready: "Chain anchoring is incomplete",
  treasury_enforcement_not_configured: "Treasury enforcement is incomplete",
  primary_vendor_urls_missing: "Primary vendor endpoints are missing",
  primary_vendor_local_only: "Primary vendors use localhost URLs",
  fallback_execution_disabled: "Backup vendor routes are disabled",
  worker_token_missing: "Worker authentication is missing",
  worker_control_api_missing: "Worker control URL is missing",
  worker_dlq_not_configured: "Failed-job queues are not configured",
  worker_dispatch_backlog: "Dispatch queue has pending work",
  worker_reconciliation_backlog: "Reconciliation queue has pending work",
  stale_execution_unknown: "Charges need review (unknown too long)",
  execution_unknown_open: "Some charges still have unknown status",
  blockchain_warning: "Chain runtime warning",
};

function normalizeReasonCode(code: string) {
  if (code.startsWith("store_integrity_")) {
    return "store_integrity";
  }
  return code;
}

export function formatReadinessCheckLabel(key: ReadinessCheckKey): string {
  return CHECK_LABELS[key];
}

export function formatReadinessStatusLabel(
  status: ProductionReadiness["status"],
): string {
  return status === "ok" ? "Healthy" : "Needs attention";
}

export function formatReadinessReasonHeadline(reason: ReadinessReason): string {
  const normalized = normalizeReasonCode(reason.code);
  return (
    REASON_HEADLINES[normalized] ??
    REASON_HEADLINES[reason.code] ??
    formatOperatorToken(reason.code.replace(/^store_integrity_/, ""))
  );
}

export function formatReadinessReasonDetail(reason: ReadinessReason): string {
  const headline = formatReadinessReasonHeadline(reason);
  const detail = humanizeReasonMessage(reason.message);
  if (detail.toLowerCase().startsWith(headline.toLowerCase())) {
    return detail;
  }
  return detail || headline;
}

function humanizeReasonMessage(message: string): string {
  return message
    .replaceAll(/MANDATE402_[A-Z0-9_]+/g, "a required setting")
    .replaceAll(/NEXT_PUBLIC_SUPABASE_[A-Z_]+/g, "Supabase settings")
    .replaceAll(/execution_unknown/g, "charge status unknown")
    .replaceAll(/Cloudflare queue dead-letter queues/gi, "failed-job queues")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatSeverityLabel(severity: ReadinessSeverity): string {
  return severity === "critical" ? "Critical" : "Warning";
}

export function formatTreasuryEnforcementLabel(
  mode: ProductionReadiness["treasuryEnforcementMode"],
): string {
  return formatOperatorToken(mode);
}

export function summarizeReadiness(readiness: ProductionReadiness) {
  const checks: { key: ReadinessCheckKey; ready: boolean }[] = [
    { key: "postgres", ready: readiness.postgresReady },
    { key: "operatorAuth", ready: readiness.operatorAuthReady },
    { key: "morphAnchoring", ready: readiness.morphAnchoringReady },
    { key: "primaryVendors", ready: readiness.primaryVendorsReady },
    { key: "worker", ready: readiness.workerReady },
    { key: "fallback", ready: readiness.fallbackExecutionEnabled },
  ];

  const passingCount = checks.filter((check) => check.ready).length;
  const totalCount = checks.length;

  const headline =
    readiness.status === "ok"
      ? "Ready for governed payments"
      : "Some runtime checks need attention";

  const subline =
    passingCount === totalCount
      ? "All core systems passed their health checks."
      : `${passingCount} of ${totalCount} checks passing. Open details below for guidance.`;

  return { checks, passingCount, totalCount, headline, subline };
}

export function formatWorkerRuntimeSummary(
  worker: ProductionReadiness["worker"],
): string {
  const parts: string[] = [];

  if (!worker.dlqConfigured) {
    parts.push("Failed-job handling is not configured.");
  }
  if (worker.queuedDispatchTasks > 0) {
    parts.push(
      `${worker.queuedDispatchTasks} payment dispatch task${worker.queuedDispatchTasks === 1 ? "" : "s"} waiting.`,
    );
  }
  if (worker.queuedReconciliationTasks > 0) {
    parts.push(
      `${worker.queuedReconciliationTasks} reconciliation task${worker.queuedReconciliationTasks === 1 ? "" : "s"} waiting.`,
    );
  }
  if (parts.length === 0) {
    parts.push("Queues are clear and retry policy is in place.");
  }

  return parts.join(" ");
}

export function formatAgentsPostureLabel(
  agents: ProductionReadiness["agents"],
): string {
  return agents.agentExecutionApiEnabled
    ? "Autonomous agent payments enabled"
    : "Agents spend only through mandates you create";
}
