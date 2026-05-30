import type { BlockchainRuntimeHealth } from "@/lib/blockchain/health";
import type { FallbackGate } from "@/lib/domain/types";
import {
  getDatabaseUrl,
  getPersistenceMode,
  getSupabaseRuntimeConfig,
  getWorkerControlApiUrl,
  getWorkerQueueRuntimeConfig,
  getWorkerToken,
  isLocalVendorRehearsalAllowed,
  isProductionEnv,
  isTestRuntime,
} from "@/lib/infrastructure/env";
import { fallbackGateAllowsWrapper } from "@/lib/infrastructure/fallback-gate";
import { probePostgresConnection } from "@/lib/infrastructure/postgres-store";
import type { StoreIntegrityReport } from "@/lib/infrastructure/store-integrity";

export type ReadinessSeverity = "warning" | "critical";

export type ReadinessReason = {
  code: string;
  message: string;
  severity: ReadinessSeverity;
};

export type TreasuryEnforcementMode =
  | "enabled"
  | "prepared_only"
  | "not_configured";

export type ProductionReadiness = {
  status: "ok" | "degraded";
  postgresReady: boolean;
  operatorAuthReady: boolean;
  morphAnchoringReady: boolean;
  treasuryEnforcementMode: TreasuryEnforcementMode;
  primaryVendorsReady: boolean;
  workerReady: boolean;
  fallbackExecutionEnabled: boolean;
  degradedReasons: ReadinessReason[];
  worker: {
    tokenConfigured: boolean;
    controlApiConfigured: boolean;
    dlqConfigured: boolean;
    maxRetries: number;
    retryDelaySeconds: number;
    queuedDispatchTasks: number;
    queuedReconciliationTasks: number;
  };
  agents: {
    /** Governed spend identities in the mandate store (not an LLM execution surface yet). */
    label: "governed_identities";
    agentExecutionApiEnabled: boolean;
  };
};

export function isOperatorAuthConfigured() {
  const supabase = getSupabaseRuntimeConfig();
  return Boolean(supabase.url && supabase.anonKey);
}

type BuildProductionReadinessInput = {
  integrity: StoreIntegrityReport;
  blockchain: BlockchainRuntimeHealth;
  fallbackGate: FallbackGate;
  missingPrimaryVendors: string[];
  localOnlyPrimaryVendors: string[];
  staleUnknownAttempts: number;
  unknownAttempts: number;
  queuedDispatchTasks: number;
  queuedReconciliationTasks: number;
};

export async function buildProductionReadiness(
  input: BuildProductionReadinessInput,
): Promise<ProductionReadiness> {
  const degradedReasons: ReadinessReason[] = [];
  const persistenceMode = getPersistenceMode();
  const databaseUrlConfigured = Boolean(getDatabaseUrl()?.trim());
  const postgresProbe =
    persistenceMode === "postgres" && databaseUrlConfigured
      ? await probePostgresConnection()
      : { ok: false, error: "Postgres is not configured." };

  const postgresReady =
    persistenceMode === "postgres" && databaseUrlConfigured && postgresProbe.ok;

  if (isProductionEnv() && persistenceMode !== "postgres") {
    degradedReasons.push({
      code: "postgres_persistence_required",
      message: "Production requires MANDATE402_PERSISTENCE_MODE=postgres.",
      severity: "critical",
    });
  }

  if (persistenceMode === "postgres" && !databaseUrlConfigured) {
    degradedReasons.push({
      code: "postgres_url_missing",
      message: "MANDATE402_DATABASE_URL is not configured.",
      severity: "critical",
    });
  }

  if (
    persistenceMode === "postgres" &&
    databaseUrlConfigured &&
    !postgresProbe.ok
  ) {
    degradedReasons.push({
      code: "postgres_unreachable",
      message: postgresProbe.error ?? "Postgres connectivity probe failed.",
      severity: "critical",
    });
  }

  const operatorAuthReady = isOperatorAuthConfigured();
  if (isProductionEnv() && !operatorAuthReady) {
    degradedReasons.push({
      code: "operator_auth_not_configured",
      message:
        "Supabase operator auth requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      severity: "critical",
    });
  }

  const morphAnchoringReady = input.blockchain.anchoringReady;
  if (!morphAnchoringReady) {
    degradedReasons.push({
      code: "morph_anchoring_not_ready",
      message:
        "Morph anchoring needs RPC, chain id, mandate registry address, and signer configuration.",
      severity: isProductionEnv() ? "critical" : "warning",
    });
  }

  const treasuryEnforcementMode = input.blockchain.treasuryEnforcementMode;
  if (treasuryEnforcementMode === "not_configured") {
    degradedReasons.push({
      code: "treasury_enforcement_not_configured",
      message:
        "Treasury enforcement contracts or runtime mapping are incomplete.",
      severity: "warning",
    });
  }

  const localVendorsBlockProduction =
    isProductionEnv() &&
    !isLocalVendorRehearsalAllowed() &&
    input.localOnlyPrimaryVendors.length > 0;

  const primaryVendorsReady =
    !isProductionEnv() ||
    (input.missingPrimaryVendors.length === 0 && !localVendorsBlockProduction);

  if (input.missingPrimaryVendors.length > 0) {
    degradedReasons.push({
      code: "primary_vendor_urls_missing",
      message: `Primary vendor URLs are missing: ${input.missingPrimaryVendors.join(", ")}.`,
      severity: isProductionEnv() ? "critical" : "warning",
    });
  }

  if (input.localOnlyPrimaryVendors.length > 0) {
    const rehearsal = isLocalVendorRehearsalAllowed();
    degradedReasons.push({
      code: "primary_vendor_local_only",
      message: rehearsal
        ? `Demo vendors on localhost (${input.localOnlyPrimaryVendors.join(", ")}). Expected while rehearsing locally; use public HTTPS vendor URLs before a deployed production cutover.`
        : `Primary vendors are local-only in production: ${input.localOnlyPrimaryVendors.join(", ")}.`,
      severity: rehearsal ? "warning" : "critical",
    });
  }

  const fallbackExecutionEnabled = fallbackGateAllowsWrapper(
    input.fallbackGate,
  );
  if (!fallbackExecutionEnabled) {
    degradedReasons.push({
      code: "fallback_execution_disabled",
      message:
        "Wrapper fallback execution stays disabled until the gate artifact and dispatch path are both approved.",
      severity: "warning",
    });
  }

  const workerQueue = getWorkerQueueRuntimeConfig();
  const tokenConfigured = Boolean(getWorkerToken());
  const controlApiConfigured = Boolean(getWorkerControlApiUrl());

  if (!tokenConfigured) {
    degradedReasons.push({
      code: "worker_token_missing",
      message: "MANDATE402_WORKER_TOKEN is not configured.",
      severity: "critical",
    });
  }

  if (!controlApiConfigured) {
    degradedReasons.push({
      code: "worker_control_api_missing",
      message:
        "MANDATE402_CONTROL_API_URL (or MANDATE402_WORKER_CONTROL_URL) is not configured.",
      severity: "critical",
    });
  }

  if (!workerQueue.dlqConfigured && !isTestRuntime()) {
    degradedReasons.push({
      code: "worker_dlq_not_configured",
      message:
        "Cloudflare queue dead-letter queues are not marked ready. Set MANDATE402_WORKER_DLQ_CONFIGURED=true after wrangler DLQ bindings are deployed.",
      severity: "critical",
    });
  }

  if (input.queuedDispatchTasks > 0) {
    degradedReasons.push({
      code: "worker_dispatch_backlog",
      message: `${input.queuedDispatchTasks} dispatch worker task(s) are still queued.`,
      severity: "warning",
    });
  }

  if (input.queuedReconciliationTasks > 0) {
    degradedReasons.push({
      code: "worker_reconciliation_backlog",
      message: `${input.queuedReconciliationTasks} reconciliation worker task(s) are still queued.`,
      severity: "warning",
    });
  }

  if (input.staleUnknownAttempts > 0) {
    degradedReasons.push({
      code: "stale_execution_unknown",
      message: `${input.staleUnknownAttempts} attempt(s) remain execution_unknown past the escalation window.`,
      severity: "critical",
    });
  } else if (input.unknownAttempts > 0) {
    degradedReasons.push({
      code: "execution_unknown_open",
      message: `${input.unknownAttempts} attempt(s) are still execution_unknown.`,
      severity: "warning",
    });
  }

  if (input.integrity.status !== "ok") {
    for (const issue of input.integrity.issues) {
      degradedReasons.push({
        code: `store_integrity_${issue.code}`,
        message: issue.message,
        severity: "critical",
      });
    }
  }

  for (const warning of input.blockchain.warnings) {
    degradedReasons.push({
      code: "blockchain_warning",
      message: warning,
      severity: "warning",
    });
  }

  const workerReady =
    postgresReady &&
    tokenConfigured &&
    controlApiConfigured &&
    workerQueue.dlqConfigured &&
    input.queuedDispatchTasks === 0 &&
    input.queuedReconciliationTasks === 0 &&
    input.staleUnknownAttempts === 0;

  const readinessFlags = [
    postgresReady,
    operatorAuthReady,
    morphAnchoringReady,
    primaryVendorsReady,
    workerReady,
  ];

  const hasCritical = degradedReasons.some(
    (reason) => reason.severity === "critical",
  );
  const status: ProductionReadiness["status"] =
    hasCritical || readinessFlags.some((flag) => !flag) ? "degraded" : "ok";

  return {
    status,
    postgresReady,
    operatorAuthReady,
    morphAnchoringReady,
    treasuryEnforcementMode,
    primaryVendorsReady,
    workerReady,
    fallbackExecutionEnabled,
    degradedReasons,
    worker: {
      tokenConfigured,
      controlApiConfigured,
      dlqConfigured: workerQueue.dlqConfigured,
      maxRetries: workerQueue.maxRetries,
      retryDelaySeconds: workerQueue.retryDelaySeconds,
      queuedDispatchTasks: input.queuedDispatchTasks,
      queuedReconciliationTasks: input.queuedReconciliationTasks,
    },
    agents: {
      label: "governed_identities",
      agentExecutionApiEnabled: false,
    },
  };
}
