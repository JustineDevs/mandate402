import { describe, expect, it } from "vitest";

import { DEMO_OPERATOR_TOKEN } from "@/lib/infrastructure/env";
import { AuthError, requireOperator } from "@/lib/modules/auth";

function makeRequest(headers: Record<string, string>) {
  return new Request("http://localhost/api/test", {
    headers,
  });
}

describe("requireOperator", () => {
  it("accepts the configured demo token", () => {
    expect(
      requireOperator(
        makeRequest({
          "x-operator-token": DEMO_OPERATOR_TOKEN,
        }),
      ),
    ).toEqual({
      operatorId: "operator_demo",
      role: "operator",
    });
  });

  it("rejects missing credentials", () => {
    expect(() => requireOperator(makeRequest({}))).toThrow(AuthError);
  });
});
