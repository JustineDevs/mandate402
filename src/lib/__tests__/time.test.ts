import { describe, expect, it } from "vitest";

import { isFutureIsoTimestamp } from "@/lib/domain/time";

describe("isFutureIsoTimestamp", () => {
  it("accepts a future ISO timestamp", () => {
    expect(isFutureIsoTimestamp("3026-01-01T00:00:00.000Z")).toBe(true);
  });

  it("rejects a past ISO timestamp", () => {
    expect(isFutureIsoTimestamp("2000-01-01T00:00:00.000Z")).toBe(false);
  });

  it("rejects non-ISO parseable strings", () => {
    expect(isFutureIsoTimestamp("3026-01-01")).toBe(false);
  });
});
