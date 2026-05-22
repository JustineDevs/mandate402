import { afterEach, describe, expect, it, vi } from "vitest";

import type { Vendor } from "@/lib/domain/types";
import { resetPaymentFetchForTests } from "@/lib/infrastructure/x402-client";
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

const TEST_PRIVATE_KEY =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  resetPaymentFetchForTests();
});

describe("dispatchAttempt", () => {
  it("rejects primary dispatch when no live endpoint is configured", async () => {
    await expect(
      dispatchAttempt({
        vendor: primaryVendor,
        amountCents: 1200,
        paymentIdentifier: "pid_1",
        mandateId: "mdt_1",
      }),
    ).rejects.toThrow(
      "Primary vendor endpoint is not configured for morph-market-data.",
    );
  });

  it("marks dispatch as unknown on timeout", async () => {
    vi.stubEnv("MORPH_PRIVATE_KEY", TEST_PRIVATE_KEY);
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
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
    vi.stubEnv("MORPH_PRIVATE_KEY", TEST_PRIVATE_KEY);
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
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

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/vendor/status",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "content-type": "application/json",
          "x-payment-identifier": "pid_3",
        }),
      }),
    );
    expect(result).toEqual({
      status: "executed_charge_succeeded",
      chargeReference: "charge_live_1",
      receiptEvidence: "received_valid",
    });
  });

  it("includes status auth when configured", async () => {
    vi.stubEnv("MANDATE402_STATUS_TOKEN", "status-token");
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://example.com/vendor");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "executed_charge_succeeded",
          chargeReference: "charge_live_2",
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

    await correlateAttemptStatus({
      vendor: primaryVendor,
      paymentIdentifier: "pid_4",
      chargeReference: null,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/vendor/status",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer status-token",
          "x-payment-identifier": "pid_4",
        }),
      }),
    );
  });
});
