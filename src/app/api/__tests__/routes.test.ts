import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as reconcileAttempt } from "@/app/api/mandates/[mandateId]/attempts/[attemptId]/reconcile/route";
import { POST as createAttempt } from "@/app/api/mandates/[mandateId]/attempts/route";
import { POST as revokeMandate } from "@/app/api/mandates/[mandateId]/revoke/route";
import { POST as createMandate } from "@/app/api/mandates/route";
import { GET as getSystem } from "@/app/api/system/route";
import { DEMO_OPERATOR_TOKEN } from "@/lib/infrastructure/env";
import {
  createSeedStoreData,
  resetStoreForTests,
} from "@/lib/infrastructure/store";
import { resetPaymentFetchForTests } from "@/lib/infrastructure/x402-client";

function jsonRequest(
  url: string,
  body: unknown,
  extraHeaders?: Record<string, string>,
) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-operator-token": DEMO_OPERATOR_TOKEN,
      "x-correlation-id": "corr_routes_test",
      ...(extraHeaders ?? {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  await resetStoreForTests(createSeedStoreData());
  vi.stubEnv(
    "MORPH_PRIVATE_KEY",
    "0x1111111111111111111111111111111111111111111111111111111111111111",
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  resetPaymentFetchForTests();
});

describe("API routes", () => {
  it("rejects unauthorized mandate creation", async () => {
    const request = new Request("http://localhost/api/mandates", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "Bad Mandate",
        agentId: "agent_research_alpha",
        agentName: "Research Alpha",
        budgetCapCents: 1000,
        expiresAt: "3026-01-01T00:00:00.000Z",
        approvedVendorIds: ["morph-market-data"],
        requiresReceiptCapability: true,
      }),
    });

    const response = await createMandate(request);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Unauthorized operator request.",
    });
  });

  it("supports create -> attempt -> reconcile -> revoke through route handlers", async () => {
    const mandateResponse = await createMandate(
      jsonRequest("http://localhost/api/mandates", {
        name: "Routes Mandate",
        agentId: "agent_research_alpha",
        agentName: "Research Alpha",
        budgetCapCents: 3000,
        expiresAt: "3026-01-01T00:00:00.000Z",
        approvedVendorIds: ["morph-market-data", "morph-research-net"],
        requiresReceiptCapability: true,
      }),
    );
    expect(mandateResponse.status).toBe(201);
    const mandateJson = await mandateResponse.json();
    const mandateId = mandateJson.data.mandate.id as string;

    vi.stubEnv("MORPH_RESEARCH_NET_URL", "https://example.com/research");
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
            chargeReference: "charge_routes_1",
            receiptEvidence: "received_valid",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    const attemptResponse = await createAttempt(
      jsonRequest(`http://localhost/api/mandates/${mandateId}/attempts`, {
        vendorId: "morph-research-net",
        amountCents: 1200,
        paymentIdentifier: "pid_routes_1",
      }),
      {
        params: Promise.resolve({ mandateId }),
      },
    );
    expect(attemptResponse.status).toBe(201);
    const attemptJson = await attemptResponse.json();
    expect(attemptJson.data.attempt.status).toBe("execution_unknown");

    const reconcileResponse = await reconcileAttempt(
      jsonRequest(
        `http://localhost/api/mandates/${mandateId}/attempts/${attemptJson.data.attempt.id}/reconcile`,
        {},
      ),
      {
        params: Promise.resolve({
          mandateId,
          attemptId: attemptJson.data.attempt.id as string,
        }),
      },
    );
    expect(reconcileResponse.status).toBe(200);
    const reconcileJson = await reconcileResponse.json();
    expect(reconcileJson.data.attempt.status).toBe("executed_charge_succeeded");

    const revokeResponse = await revokeMandate(
      jsonRequest(`http://localhost/api/mandates/${mandateId}/revoke`, {}),
      {
        params: Promise.resolve({ mandateId }),
      },
    );
    expect(revokeResponse.status).toBe(200);

    const systemResponse = await getSystem();
    expect(systemResponse.status).toBe(200);
    const systemJson = await systemResponse.json();
    expect(systemJson.ok).toBe(true);
    expect(systemJson.data.mandates).toBeGreaterThanOrEqual(1);
    expect(systemJson.data.domainEvents).toBeGreaterThanOrEqual(1);
  });
});
