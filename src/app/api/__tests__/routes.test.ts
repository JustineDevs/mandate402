import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET as getConsoleRuntime } from "@/app/api/console/runtime/route";
import { GET as getFallbackGate } from "@/app/api/fallback-gate/route";
import { POST as reconcileAttempt } from "@/app/api/mandates/[mandateId]/attempts/[attemptId]/reconcile/route";
import { POST as createAttempt } from "@/app/api/mandates/[mandateId]/attempts/route";
import { POST as revokeMandate } from "@/app/api/mandates/[mandateId]/revoke/route";
import { GET as getMandates } from "@/app/api/mandates/route";
import { POST as createMandate } from "@/app/api/mandates/route";
import { GET as getOperatorDashboard } from "@/app/api/operator/dashboard/route";
import { GET as getSystem } from "@/app/api/system/route";
import { GET as getVendors } from "@/app/api/vendors/route";
import {
  createTestStoreData,
  readStore,
  resetStoreForTests,
} from "@/lib/infrastructure/store";
import { resetPaymentFetchForTests } from "@/lib/infrastructure/x402-client";
import {
  processExecutionQueue,
  processReconciliationQueue,
} from "@/lib/modules/execution-worker";

vi.mock("@/lib/infrastructure/supabase-server", () => ({
  createSupabaseRequestClient: () => ({
    from: (table: string) => {
      if (table === "operator_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  auth_user_id: "operator_fixture",
                  role: "operator",
                  status: "active",
                  primary_auth_provider: "email",
                  email: "operator@example.com",
                  full_name: "Operator Fixture",
                  wallet_address: null,
                  onboarding_state: "complete",
                  preferred_treasury_mode: null,
                  preferred_wallet_provider: null,
                  last_sign_in_at: null,
                },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "operator_treasury_wallet_accounts") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                order: () => ({
                  returns: async () => ({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table mock: ${table}`);
    },
  }),
  getOperatorProfile: vi.fn().mockResolvedValue({
    auth_user_id: "operator_fixture",
    role: "operator",
    status: "active",
    primary_auth_provider: "email",
    email: "operator@example.com",
    full_name: "Operator Fixture",
    wallet_address: null,
  }),
  getSupabaseRole: () => "operator",
  getSupabaseServerClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "operator_fixture",
            app_metadata: { role: "operator" },
          },
        },
        error: null,
      }),
    },
  }),
}));
vi.mock("@/lib/modules/morph-anchor", () => ({
  issueMandateAnchor: vi.fn().mockResolvedValue("0xtest_issue_anchor"),
  revokeMandateAnchor: vi.fn().mockResolvedValue("0xtest_revoke_anchor"),
}));
vi.mock("@/lib/blockchain/clients", () => ({
  getMorphPublicClient: () => ({
    getChainId: vi.fn().mockResolvedValue(2818),
    getBlockNumber: vi.fn().mockResolvedValue(123456n),
  }),
  getMorphWalletClient: vi.fn(),
  getMorphSignerAccount: vi.fn(),
  hasMorphSigner: () => true,
}));

function jsonRequest(
  url: string,
  body: unknown,
  extraHeaders?: Record<string, string>,
) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer fixture-token",
      "x-correlation-id": "corr_routes_test",
      ...(extraHeaders ?? {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  await resetStoreForTests(createTestStoreData());
  vi.stubEnv("APP_ENV", "test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  vi.stubEnv("MORPH_RPC_URL", "https://rpc.example");
  vi.stubEnv("MORPH_EXPLORER_URL", "https://explorer.example");
  vi.stubEnv("MORPH_CHAIN_ID", "2818");
  vi.stubEnv(
    "MORPH_PRIVATE_KEY",
    "0x1111111111111111111111111111111111111111111111111111111111111111",
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  resetPaymentFetchForTests();
});

describe("API routes", () => {
  it("rejects unauthorized mandate listing", async () => {
    const response = await getMandates(
      new Request("http://localhost/api/mandates", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Unauthorized operator request.",
    });
  });

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

  it("rejects unauthorized system status access", async () => {
    const response = await getSystem(
      new Request("http://localhost/api/system", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Unauthorized operator request.",
    });
  });

  it("returns public console runtime chrome without auth", async () => {
    const response = await getConsoleRuntime(
      new Request("http://localhost/api/console/runtime", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.data).toMatchObject({
      environmentLabel: expect.any(String),
      chainLabel: expect.any(String),
      apiOrigin: "http://localhost",
      status: expect.stringMatching(/^(ok|degraded)$/),
      syncedAt: expect.any(String),
    });
  });

  it("rejects unauthorized fallback gate access", async () => {
    const response = await getFallbackGate(
      new Request("http://localhost/api/fallback-gate", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Unauthorized operator request.",
    });
  });

  it("rejects unauthorized operator dashboard access", async () => {
    const response = await getOperatorDashboard(
      new Request("http://localhost/api/operator/dashboard", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Unauthorized operator request.",
    });
  });

  it("rejects unauthorized vendors access", async () => {
    const response = await getVendors(
      new Request("http://localhost/api/vendors", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Unauthorized operator request.",
    });
  });
  it("returns 400 for invalid mandate creation payloads", async () => {
    const response = await createMandate(
      jsonRequest("http://localhost/api/mandates", {
        name: "",
        agentId: "agent_research_alpha",
        budgetCapCents: 1000,
        expiresAt: "3026-01-01T00:00:00.000Z",
        approvedVendorIds: ["morph-market-data"],
        requiresReceiptCapability: true,
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Invalid request body.",
    });
  });

  it("returns 404 when creating an attempt for a missing mandate", async () => {
    const response = await createAttempt(
      jsonRequest("http://localhost/api/mandates/missing_mandate/attempts", {
        vendorId: "morph-market-data",
        amountCents: 100,
      }),
      {
        params: Promise.resolve({ mandateId: "missing_mandate" }),
      },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Mandate not found.",
    });
  });

  it("returns 409 when a non-unknown attempt is queued for reconciliation", async () => {
    const mandateResponse = await createMandate(
      jsonRequest("http://localhost/api/mandates", {
        name: "Routes Mandate",
        agentId: "agent_research_alpha",
        agentName: "Research Alpha",
        budgetCapCents: 1000,
        expiresAt: "3026-01-01T00:00:00.000Z",
        approvedVendorIds: ["morph-market-data"],
        requiresReceiptCapability: true,
      }),
    );
    const mandateJson = await mandateResponse.json();
    const mandateId = mandateJson.data.mandate.id as string;
    const attemptResponse = await createAttempt(
      jsonRequest(`http://localhost/api/mandates/${mandateId}/attempts`, {
        vendorId: "morph-market-data",
        amountCents: 1200,
      }),
      {
        params: Promise.resolve({ mandateId }),
      },
    );
    const attemptJson = await attemptResponse.json();
    expect(attemptJson.data.attempt.status).toBe("policy_denied");

    const response = await reconcileAttempt(
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

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      ok: false,
      error:
        "Only execution_unknown attempts can be queued for reconciliation.",
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

    vi.stubEnv("PRIMARY_X402_VENDOR_B_URL", "https://example.com/research");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(null, {
          status: 402,
          headers: {
            "PAYMENT-REQUIRED": Buffer.from(
              JSON.stringify({
                x402Version: 2,
                accepts: [
                  {
                    scheme: "exact",
                    network: "eip155:2818",
                    maxAmountRequired: "1200",
                    resource: "https://example.com/research",
                    description: "Research vendor",
                    mimeType: "application/json",
                    outputSchema: null,
                    payTo: "0x867a2e06e2ecbcc4d4aacc2f92353e51c0c8305f",
                    maxTimeoutSeconds: 15,
                    asset: "0x7433b41c6c5e1d58d4da99483609520255ab661b",
                    amount: "1200",
                    extra: {
                      name: "USDC",
                      version: "1.0",
                    },
                  },
                ],
              }),
            ).toString("base64"),
          },
        }),
      )
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
    expect(attemptJson.data.attempt.status).toBe("dispatch_queued");
    const storeAfterAttempt = await readStore();
    const dispatchTask = storeAfterAttempt.workerTasks.find(
      (task) => task.attemptId === attemptJson.data.attempt.id,
    );
    expect(dispatchTask).toMatchObject({
      kind: "dispatch_attempt",
      operatorId: "operator_fixture",
      correlationId: "corr_routes_test",
    });

    const workerResult = await processExecutionQueue();
    expect(workerResult).toMatchObject({
      processed: 1,
      unresolved: 1,
    });

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
    expect(reconcileResponse.status).toBe(202);
    const reconcileJson = await reconcileResponse.json();
    expect(reconcileJson.data.attempt.status).toBe("execution_unknown");
    expect(reconcileJson.data.task.kind).toBe("reconcile_attempt");
    expect(reconcileJson.data.task.operatorId).toBe("operator_fixture");
    expect(reconcileJson.data.task.correlationId).toBe("corr_routes_test");

    const reconciliationWorkerResult = await processReconciliationQueue();
    expect(reconciliationWorkerResult).toMatchObject({
      processed: 1,
      completed: 1,
    });

    const revokeResponse = await revokeMandate(
      jsonRequest(`http://localhost/api/mandates/${mandateId}/revoke`, {}),
      {
        params: Promise.resolve({ mandateId }),
      },
    );
    expect(revokeResponse.status).toBe(200);

    const systemResponse = await getSystem(
      new Request("http://localhost/api/system", {
        method: "GET",
        headers: {
          authorization: "Bearer fixture-token",
        },
      }),
    );
    expect(systemResponse.status).toBe(200);
    const systemJson = await systemResponse.json();
    expect(systemJson.ok).toBe(true);
    expect(systemJson.data.status).toBe("degraded");
    expect(systemJson.data.mandates).toBeGreaterThanOrEqual(1);
    expect(systemJson.data.activeMandates).toBeGreaterThanOrEqual(0);
    expect(systemJson.data.domainEvents).toBeGreaterThanOrEqual(1);
    expect(systemJson.data.queuedAttempts).toBe(0);
    expect(systemJson.data.workerTasks).toBeGreaterThanOrEqual(2);
    expect(systemJson.data.queuedDispatchTasks).toBe(0);
    expect(systemJson.data.queuedReconciliationTasks).toBe(0);
    expect(systemJson.data.integrity.status).toBe("ok");
    expect(systemJson.data.integrity.issues).toEqual([]);
    expect(systemJson.data.blockchain.status).toBe("degraded");
    expect(systemJson.data.blockchain.network.key).toBe("morph-mainnet");
    expect(systemJson.data.blockchain.rpcProbeAttempted).toBe(false);
    expect(
      systemJson.data.blockchain.contracts.mandateRegistryAddress,
    ).toBeNull();
    expect(systemJson.data.blockchain.anchoringReady).toBe(false);
  });

  it("returns protected operator dashboard data for an authenticated operator", async () => {
    const response = await getOperatorDashboard(
      new Request("http://localhost/api/operator/dashboard", {
        method: "GET",
        headers: {
          authorization: "Bearer fixture-token",
        },
      }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.data.operator).toEqual({
      operatorId: "operator_fixture",
      role: "operator",
      onboardingState: "complete",
      preferredTreasuryMode: null,
      preferredWalletProvider: null,
    });
    expect(Array.isArray(json.data.dashboard.mandates)).toBe(true);
    expect(Array.isArray(json.data.dashboard.incidents)).toBe(true);
    expect(json.data.dashboard.systemStatus).toMatchObject({
      integrity: {
        status: "ok",
      },
    });
  });

  it("marks stale execution_unknown attempts as degraded system state", async () => {
    const data = createTestStoreData();
    const staleTime = "2000-01-01T00:00:00.000Z";

    data.attempts.unshift({
      id: "att_stale_unknown",
      mandateId: "mdt_fixture_001",
      vendorId: "morph-market-data",
      amountCents: 900,
      operatorId: "operator_fixture",
      status: "execution_unknown",
      financialOutcome: "execution_unknown",
      receiptEvidence: "required_pending",
      blockedReason: null,
      chargeReference: "charge_stale_1",
      paymentIdentifier: "pid_stale_unknown",
      createdAt: staleTime,
      updatedAt: staleTime,
    });
    await resetStoreForTests(data);

    const response = await getSystem(
      new Request("http://localhost/api/system", {
        method: "GET",
        headers: {
          authorization: "Bearer fixture-token",
        },
      }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe("degraded");
    expect(json.data.unknownAttempts).toBeGreaterThanOrEqual(1);
    expect(json.data.staleUnknownAttempts).toBe(1);
    expect(json.data.unknownAttemptEscalationMinutes).toBe(15);
  });

  it("reports vendor runtime readiness details in system status", async () => {
    vi.stubEnv("PRIMARY_X402_VENDOR_A_URL", "https://vendor-a.example");
    vi.stubEnv("PRIMARY_X402_VENDOR_B_URL", "https://vendor-b.example");

    const response = await getSystem(
      new Request("http://localhost/api/system", {
        method: "GET",
        headers: {
          authorization: "Bearer fixture-token",
        },
      }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.data.vendorRuntime).toMatchObject({
      primaryConfigured: true,
      missingPrimaryVendors: [],
      localOnlyPrimaryVendors: [],
      fallbackEnabled: false,
    });
    expect(json.data.readiness).toMatchObject({
      operatorAuthReady: true,
      morphAnchoringReady: false,
      primaryVendorsReady: true,
      fallbackExecutionEnabled: false,
      agents: {
        label: "governed_identities",
        agentExecutionApiEnabled: false,
      },
    });
    expect(Array.isArray(json.data.readiness.degradedReasons)).toBe(true);
    expect(Array.isArray(json.data.vendorRuntime.endpoints)).toBe(true);
  });
});
