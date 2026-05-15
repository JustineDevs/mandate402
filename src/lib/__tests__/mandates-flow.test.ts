import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createSeedStoreData,
  resetStoreForTests,
} from "@/lib/infrastructure/store";
import {
  listAuditEntries,
  listMandates,
  reconcileAttempt,
  runAttempt,
} from "@/lib/modules/mandates";

beforeEach(async () => {
  await resetStoreForTests(createSeedStoreData());
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("mandate flow", () => {
  it("does not mark execution_unknown as reconciled before correlation", async () => {
    vi.stubEnv("MORPH_MARKET_DATA_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          const error = new Error("Timed out");
          error.name = "AbortError";
          reject(error);
        }) as Promise<Response>,
    );

    const [mandate] = await listMandates();
    const attempt = await runAttempt({
      mandateId: mandate.id,
      vendorId: "morph-market-data",
      amountCents: 1300,
      operatorId: "operator_demo",
      paymentIdentifier: "pid_unknown",
    });

    expect(attempt.status).toBe("execution_unknown");

    const audits = await listAuditEntries();
    const related = audits.filter((entry) => entry.attemptId === attempt.id);

    expect(
      related.some((entry) => entry.type === "attempt_reconciliation_started"),
    ).toBe(true);
    expect(related.some((entry) => entry.type === "attempt_reconciled")).toBe(
      false,
    );
  });

  it("reconciles unknown attempts from correlated vendor truth", async () => {
    vi.stubEnv("MORPH_MARKET_DATA_URL", "https://example.com/vendor");
    vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            const error = new Error("Timed out");
            error.name = "AbortError";
            reject(error);
          }) as Promise<Response>,
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "executed_charge_succeeded",
            chargeReference: "charge_corr_1",
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

    const [mandate] = await listMandates();
    const attempt = await runAttempt({
      mandateId: mandate.id,
      vendorId: "morph-market-data",
      amountCents: 1300,
      operatorId: "operator_demo",
      paymentIdentifier: "pid_corr",
    });

    const reconciled = await reconcileAttempt({
      mandateId: mandate.id,
      attemptId: attempt.id,
    });

    expect(reconciled.status).toBe("executed_charge_succeeded");
    expect(reconciled.receiptEvidence).toBe("received_valid");

    const refreshedMandates = await listMandates();
    expect(refreshedMandates[0].reservedCents).toBe(0);
    expect(refreshedMandates[0].consumedCents).toBe(2500);
  });
});
