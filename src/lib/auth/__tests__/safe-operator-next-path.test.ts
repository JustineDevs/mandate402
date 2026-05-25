import { describe, expect, it } from "vitest";

import { sanitizeOperatorNextPath } from "@/lib/auth/safe-operator-next-path";

describe("sanitizeOperatorNextPath", () => {
  it("allows known console prefixes", () => {
    expect(sanitizeOperatorNextPath("/settings")).toBe("/settings");
    expect(sanitizeOperatorNextPath("/mandates/m-1")).toBe("/mandates/m-1");
    expect(sanitizeOperatorNextPath("/policy-registry")).toBe(
      "/policy-registry",
    );
    expect(sanitizeOperatorNextPath("%2Fsettings")).toBe("/settings");
    expect(sanitizeOperatorNextPath(encodeURIComponent("/agents"))).toBe(
      "/agents",
    );
  });

  it("rejects open redirects and schemes", () => {
    expect(sanitizeOperatorNextPath("//evil.com")).toBeUndefined();
    expect(sanitizeOperatorNextPath("https://evil.com")).toBeUndefined();
    expect(sanitizeOperatorNextPath("/evil")).toBeUndefined();
    expect(sanitizeOperatorNextPath("javascript:alert(1)")).toBeUndefined();
    expect(sanitizeOperatorNextPath("/operator")).toBeUndefined();
    expect(sanitizeOperatorNextPath("/operator/sign-up")).toBeUndefined();
    expect(sanitizeOperatorNextPath("/")).toBeUndefined();
  });
});
