import { describe, expect, it } from "vitest";

import {
  availableBudgetCents,
  canTransitionAttempt,
  canTransitionMandate,
  mandateCanReserve,
} from "@/lib/domain/state-machines";
import type { Mandate } from "@/lib/domain/types";

const baseMandate: Mandate = {
  id: "mdt",
  name: "Base",
  agentId: "agent_research_alpha",
  agentName: "Agent",
  status: "issued_active",
  budgetCapCents: 5000,
  reservedCents: 0,
  consumedCents: 1000,
  requiresReceiptCapability: true,
  approvedVendorIds: ["vendor-a"],
  morphIssueTxId: "0x1",
  morphRevokeTxId: null,
  expiresAt: "2026-05-30T00:00:00.000Z",
  createdAt: "2026-05-14T00:00:00.000Z",
  updatedAt: "2026-05-14T00:00:00.000Z",
};

describe("mandate state machine", () => {
  it("allows active to reserved", () => {
    expect(canTransitionMandate("issued_active", "issued_reserved")).toBe(true);
  });

  it("blocks revoked back to active", () => {
    expect(canTransitionMandate("revoked", "issued_active")).toBe(false);
  });

  it("computes available budget from reserved and consumed", () => {
    expect(
      availableBudgetCents({
        ...baseMandate,
        reservedCents: 500,
      }),
    ).toBe(3500);
  });

  it("allows reservation only when active and no existing reservation", () => {
    expect(mandateCanReserve(baseMandate)).toBe(true);
    expect(
      mandateCanReserve({
        ...baseMandate,
        reservedCents: 100,
      }),
    ).toBe(false);
  });
});

describe("payment attempt state machine", () => {
  it("supports dispatching to execution unknown", () => {
    expect(canTransitionAttempt("dispatching", "execution_unknown")).toBe(true);
  });

  it("supports reconciling unknown to succeeded", () => {
    expect(
      canTransitionAttempt("execution_unknown", "executed_charge_succeeded"),
    ).toBe(true);
  });

  it("blocks reserved straight to success", () => {
    expect(canTransitionAttempt("reserved", "executed_charge_succeeded")).toBe(
      false,
    );
  });
});
