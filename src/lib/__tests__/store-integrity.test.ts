import { describe, expect, it } from "vitest";

import { createTestStoreData } from "@/lib/infrastructure/store";
import { buildStoreIntegrityReport } from "@/lib/infrastructure/store-integrity";

describe("store integrity report", () => {
  it("reports ok for the seed store", () => {
    const report = buildStoreIntegrityReport(createTestStoreData());

    expect(report.status).toBe("ok");
    expect(report.issues).toHaveLength(0);
  });

  it("reports degraded when references or semantic totals drift", () => {
    const data = createTestStoreData();

    data.mandates[0].agentName = "Spoofed Agent";
    data.agents[0].onchainAddress = "not-an-address";
    data.agents[0].walletProvider = "invalid" as never;
    data.agents[0].verifiedAt = "not-a-date";
    data.mandates[0].approvedVendorIds.push("missing-vendor");
    data.mandates[0].reservedCents = 4500;
    data.attempts[0].paymentIdentifier = data.attempts[1].paymentIdentifier;
    data.auditEntries[0].attemptId = "missing-attempt";

    const report = buildStoreIntegrityReport(data);

    expect(report.status).toBe("degraded");
    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "agent_name_mismatch",
        "invalid_agent_onchain_address",
        "invalid_agent_wallet_provider",
        "invalid_agent_verified_at",
        "unknown_approved_vendor",
        "budget_overflow",
        "duplicate_payment_identifier",
        "missing_audit_attempt_reference",
      ]),
    );
  });

  it("requires complete identity when an agent is marked verified", () => {
    const data = createTestStoreData();

    data.agents[0].verifiedAt = "2026-05-30T00:00:00.000Z";

    const report = buildStoreIntegrityReport(data);

    expect(report.status).toBe("degraded");
    expect(report.issues.map((issue) => issue.code)).toContain(
      "incomplete_verified_agent_identity",
    );
  });
});
