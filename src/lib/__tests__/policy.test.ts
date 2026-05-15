import { describe, expect, it } from "vitest";

import type { Mandate, Vendor } from "@/lib/domain/types";
import { evaluatePolicy } from "@/lib/modules/policy";

const mandate: Mandate = {
  id: "mdt",
  name: "Research",
  agentId: "agent_research_alpha",
  agentName: "Agent",
  status: "issued_active",
  budgetCapCents: 5000,
  reservedCents: 0,
  consumedCents: 500,
  requiresReceiptCapability: true,
  approvedVendorIds: ["vendor-a"],
  morphIssueTxId: "0x1",
  morphRevokeTxId: null,
  expiresAt: "2026-05-30T00:00:00.000Z",
  createdAt: "2026-05-14T00:00:00.000Z",
  updatedAt: "2026-05-14T00:00:00.000Z",
};

const vendor: Vendor = {
  id: "vendor-a",
  name: "Vendor A",
  mode: "primary",
  status: "available",
  morphNative: true,
  receiptCapability: true,
  adapterKey: "primary",
};

describe("policy evaluation", () => {
  it("allows an approved vendor within budget", () => {
    expect(
      evaluatePolicy({
        mandate,
        vendor,
        amountCents: 1200,
      }),
    ).toEqual({ ok: true });
  });

  it("denies a vendor not on the allowlist", () => {
    expect(
      evaluatePolicy({
        mandate,
        vendor: {
          ...vendor,
          id: "rogue",
        },
        amountCents: 1200,
      }),
    ).toEqual({
      ok: false,
      reason: "vendor_not_allowlisted",
    });
  });

  it("denies missing receipt capability", () => {
    expect(
      evaluatePolicy({
        mandate,
        vendor: {
          ...vendor,
          receiptCapability: false,
        },
        amountCents: 1200,
      }),
    ).toEqual({
      ok: false,
      reason: "receipt_capability_missing",
    });
  });

  it("denies over-budget attempts", () => {
    expect(
      evaluatePolicy({
        mandate,
        vendor,
        amountCents: 10000,
      }),
    ).toEqual({
      ok: false,
      reason: "budget_exceeded",
    });
  });

  it("denies expired mandates", () => {
    expect(
      evaluatePolicy({
        mandate: {
          ...mandate,
          expiresAt: "2000-01-01T00:00:00.000Z",
        },
        vendor,
        amountCents: 1000,
      }),
    ).toEqual({
      ok: false,
      reason: "mandate_not_active",
    });
  });
});
