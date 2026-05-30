import { describe, expect, it } from "vitest";

import type { ProductionReadiness } from "@/lib/infrastructure/production-readiness";
import {
  formatReadinessReasonDetail,
  formatReadinessReasonHeadline,
  summarizeReadiness,
} from "@/lib/readiness-display-labels";

const baseReadiness: ProductionReadiness = {
  status: "degraded",
  postgresReady: true,
  operatorAuthReady: true,
  morphAnchoringReady: false,
  treasuryEnforcementMode: "prepared_only",
  primaryVendorsReady: true,
  workerReady: false,
  fallbackExecutionEnabled: false,
  degradedReasons: [
    {
      code: "worker_token_missing",
      message: "MANDATE402_WORKER_TOKEN is not configured.",
      severity: "critical",
    },
  ],
  worker: {
    tokenConfigured: false,
    controlApiConfigured: true,
    dlqConfigured: false,
    maxRetries: 3,
    retryDelaySeconds: 30,
    queuedDispatchTasks: 0,
    queuedReconciliationTasks: 0,
  },
  agents: {
    label: "governed_identities",
    agentExecutionApiEnabled: false,
  },
};

describe("readiness display labels", () => {
  it("summarizes checks without API syntax", () => {
    const summary = summarizeReadiness(baseReadiness);
    expect(summary.headline).toBe("Some runtime checks need attention");
    expect(summary.subline).toContain("of 6 checks passing");
    expect(summary.checks[0]?.key).toBe("postgres");
  });

  it("humanizes degraded reason copy for operators", () => {
    const [reason] = baseReadiness.degradedReasons;
    if (!reason) {
      throw new Error("Expected a degraded readiness reason fixture.");
    }

    expect(formatReadinessReasonHeadline(reason)).toBe(
      "Worker authentication is missing",
    );
    expect(formatReadinessReasonDetail(reason)).not.toContain("MANDATE402_");
  });
});
