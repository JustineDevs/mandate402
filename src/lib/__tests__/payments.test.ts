import { afterEach, describe, expect, it, vi } from "vitest";

import type { Vendor } from "@/lib/domain/types";
import {
  correlateAttemptStatus,
  dispatchAttempt,
} from "@/lib/modules/payments";

const primaryVendor: Vendor = {
  id: "morph-market-data",
  name: "Morph Market Data",
  mode: "primary",
  status: "unknown",
  morphNative: true,
  receiptCapability: true,
  adapterKey: "primary",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("dispatchAttempt", () => {
  it("fails primary dispatch when no live endpoint is configured", async () => {
    const result = await dispatchAttempt({
      vendor: primaryVendor,
      amountCents: 1200,
      paymentIdentifier: "pid_1",
      mandateId: "mdt_1",
    });

    expect(result).toEqual({
      status: "executed_charge_failed",
      chargeReference: null,
      receiptEvidence: "missing_timeout",
    });
  });

  it("marks dispatch as unknown on timeout", async () => {
    vi.stubEnv("MORPH_MARKET_DATA_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          const error = new Error("Timed out");
          error.name = "AbortError";
          reject(error);
        }) as Promise<Response>,
    );

    const result = await dispatchAttempt({
      vendor: primaryVendor,
      amountCents: 1200,
      paymentIdentifier: "pid_2",
      mandateId: "mdt_2",
    });

    expect(result).toEqual({
      status: "execution_unknown",
      chargeReference: null,
      receiptEvidence: "required_pending",
    });
  });

  it("correlates vendor status by payment identifier", async () => {
    vi.stubEnv("MORPH_MARKET_DATA_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "executed_charge_succeeded",
          chargeReference: "charge_live_1",
          receiptEvidence: "received_valid",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const result = await correlateAttemptStatus({
      vendor: primaryVendor,
      paymentIdentifier: "pid_3",
      chargeReference: null,
    });

    expect(result).toEqual({
      status: "executed_charge_succeeded",
      chargeReference: "charge_live_1",
      receiptEvidence: "received_valid",
    });
  });
});
