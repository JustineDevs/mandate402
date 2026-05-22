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
    data.mandates[0].approvedVendorIds.push("missing-vendor");
    data.mandates[0].reservedCents = 4500;
    data.attempts[0].paymentIdentifier = data.attempts[1].paymentIdentifier;
    data.auditEntries[0].attemptId = "missing-attempt";

    const report = buildStoreIntegrityReport(data);

    expect(report.status).toBe("degraded");
    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "agent_name_mismatch",
        "unknown_approved_vendor",
        "budget_overflow",
        "duplicate_payment_identifier",
        "missing_audit_attempt_reference",
      ]),
    );
  });
});
