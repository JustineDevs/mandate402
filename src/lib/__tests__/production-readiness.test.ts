import { describe, expect, it, vi } from "vitest";

import type { BlockchainRuntimeHealth } from "@/lib/blockchain/health";
import type { FallbackGate } from "@/lib/domain/types";
import { buildProductionReadiness } from "@/lib/infrastructure/production-readiness";
import type { StoreIntegrityReport } from "@/lib/infrastructure/store-integrity";

const fallbackGate: FallbackGate = {
  decision_status: "primary_only",
  reviewed_at: "2026-01-01T00:00:00.000Z",
  cutoff_date: "2026-01-01T00:00:00.000Z",
  primary_targets: [],
  attempt_log: [],
  approval_rationale: "test",
  review_owner: "test",
  evidence_links: [],
};

const blockchainReady: BlockchainRuntimeHealth = {
  status: "ready",
  network: {
    key: "morph-mainnet",
    label: "Morph",
    chainId: 2818,
    rpcUrl: "https://rpc.example",
    explorerUrl: "https://explorer.example",
    environmentExpectations: [],
  },
  contracts: {
    mandateRegistryAddress: "0xabc",
    treasuryAddress: "0xdef",
    pythOracleAddress: null,
  },
  rpcConfigured: true,
  rpcProbeAttempted: false,
  rpcReachable: null,
  configuredChainId: 2818,
  observedChainId: null,
  chainIdMatches: null,
  lastObservedBlock: null,
  signerReady: true,
  anchoringReady: true,
  treasuryPrepared: true,
  treasuryEnforcementMode: "enabled",
  treasuryAgentMappings: { mapped: [], unmapped: [] },
  warnings: [],
};

const integrityOk: StoreIntegrityReport = {
  status: "ok",
  issues: [],
};

describe("buildProductionReadiness", () => {
  it("exposes explicit readiness booleans", async () => {
    vi.stubEnv("APP_ENV", "test");
    vi.stubEnv("MANDATE402_PERSISTENCE_MODE", "sqlite");
    vi.stubEnv("MANDATE402_WORKER_TOKEN", "worker-token");
    vi.stubEnv("MANDATE402_CONTROL_API_URL", "https://app.example");

    const readiness = await buildProductionReadiness({
      integrity: integrityOk,
      blockchain: blockchainReady,
      fallbackGate,
      missingPrimaryVendors: [],
      localOnlyPrimaryVendors: [],
      staleUnknownAttempts: 0,
      unknownAttempts: 0,
      queuedDispatchTasks: 0,
      queuedReconciliationTasks: 0,
    });

    expect(readiness).toMatchObject({
      postgresReady: false,
      operatorAuthReady: true,
      morphAnchoringReady: true,
      treasuryEnforcementMode: "enabled",
      primaryVendorsReady: true,
      workerReady: false,
      fallbackExecutionEnabled: false,
      agents: {
        label: "governed_identities",
        agentExecutionApiEnabled: false,
      },
    });
    expect(
      readiness.degradedReasons.some(
        (r) => r.code === "postgres_persistence_required",
      ),
    ).toBe(false);
    expect(
      readiness.degradedReasons.some(
        (r) => r.code === "fallback_execution_disabled",
      ),
    ).toBe(true);
  });

  it("treats localhost demo vendors as rehearsal warnings in production dev", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MANDATE402_PERSISTENCE_MODE", "postgres");
    vi.stubEnv("MANDATE402_DATABASE_URL", "");
    vi.stubEnv("MANDATE402_WORKER_TOKEN", "worker-token");
    vi.stubEnv("MANDATE402_CONTROL_API_URL", "https://app.example");
    vi.stubEnv("MANDATE402_WORKER_DLQ_CONFIGURED", "true");

    const readiness = await buildProductionReadiness({
      integrity: integrityOk,
      blockchain: blockchainReady,
      fallbackGate,
      missingPrimaryVendors: [],
      localOnlyPrimaryVendors: ["morph-market-data", "morph-research-net"],
      staleUnknownAttempts: 0,
      unknownAttempts: 0,
      queuedDispatchTasks: 0,
      queuedReconciliationTasks: 0,
    });

    const localOnly = readiness.degradedReasons.find(
      (r) => r.code === "primary_vendor_local_only",
    );
    expect(localOnly?.severity).toBe("warning");
    expect(readiness.primaryVendorsReady).toBe(true);
    expect(
      readiness.degradedReasons.some(
        (r) =>
          r.code === "primary_vendor_local_only" && r.severity === "critical",
      ),
    ).toBe(false);
  });
});
