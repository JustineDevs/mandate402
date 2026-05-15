import { describe, expect, it } from "vitest";

import type { FallbackGate } from "@/lib/domain/types";
import { fallbackGateAllowsWrapper } from "@/lib/infrastructure/fallback-gate";

const baseGate: FallbackGate = {
  decision_status: "fallback_approved",
  reviewed_at: "2026-05-14T00:00:00.000Z",
  cutoff_date: "2026-05-01",
  primary_targets: [
    {
      name: "A",
      vendor_type: "x402-paid HTTP API",
      expected_capabilities: ["receipt"],
      integration_owner: "lane-a",
      status: "failed_validation",
    },
    {
      name: "B",
      vendor_type: "x402-paid HTTP API",
      expected_capabilities: ["receipt"],
      integration_owner: "lane-b",
      status: "failed_validation",
    },
  ],
  attempt_log: [
    {
      target_name: "A",
      attempted_at: "2026-05-14T00:00:00.000Z",
      channel_or_endpoint: "https://a.example",
      result: "failed",
      blocker_type: "missing_receipt",
      blocker_summary: "No receipt support.",
      evidence_ref: "docs/a.md",
      next_action: "Stop",
    },
    {
      target_name: "B",
      attempted_at: "2026-05-14T00:00:00.000Z",
      channel_or_endpoint: "https://b.example",
      result: "failed",
      blocker_type: "missing_receipt",
      blocker_summary: "No receipt support.",
      evidence_ref: "docs/b.md",
      next_action: "Stop",
    },
  ],
  approval_rationale: "Both targets failed validation.",
  review_owner: "lane-a",
  evidence_links: ["docs/a.md", "docs/b.md"],
};

describe("fallbackGateAllowsWrapper", () => {
  it("allows fallback only when all gate rules are satisfied", () => {
    expect(fallbackGateAllowsWrapper(baseGate)).toBe(true);
  });

  it("blocks fallback before cutoff", () => {
    expect(
      fallbackGateAllowsWrapper({
        ...baseGate,
        cutoff_date: "3026-05-01",
      }),
    ).toBe(false);
  });

  it("blocks fallback with missing attempt evidence", () => {
    expect(
      fallbackGateAllowsWrapper({
        ...baseGate,
        attempt_log: [
          {
            ...baseGate.attempt_log[0],
            result: "pending",
          },
          baseGate.attempt_log[1],
        ],
      }),
    ).toBe(false);
  });

  it("blocks fallback when attempts do not cover every declared target", () => {
    expect(
      fallbackGateAllowsWrapper({
        ...baseGate,
        attempt_log: [
          baseGate.attempt_log[0],
          {
            ...baseGate.attempt_log[0],
            evidence_ref: "docs/a-duplicate.md",
          },
        ],
      }),
    ).toBe(false);
  });
});
