import { afterEach, describe, expect, it, vi } from "vitest";

import {
  type WorkerEnv,
  handleWorkerFetch,
  handleWorkerQueue,
} from "@/workers/mandate402";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("mandate402 Cloudflare Worker", () => {
  it("reports Worker control-plane health without requiring queues", async () => {
    const response = await handleWorkerFetch(
      new Request("https://worker.example/health"),
      {
        MANDATE402_CONTROL_API_URL: "https://control.example",
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        service: "mandate402-worker",
        executionQueueConfigured: false,
        reconciliationQueueConfigured: false,
        controlApiConfigured: true,
        dlqConfigured: true,
        maxRetries: 3,
        retryDelaySeconds: 30,
      },
    });
  });

  it("enqueues execution work through the configured queue binding", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const response = await handleWorkerFetch(
      new Request("https://worker.example/queues/execute", {
        method: "POST",
        headers: {
          authorization: "Bearer worker-token",
          "x-correlation-id": "corr_worker_test",
        },
      }),
      {
        MANDATE402_WORKER_TOKEN: "worker-token",
        EXECUTION_QUEUE: { send },
      },
    );

    expect(response.status).toBe(202);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "dispatch_attempt",
        correlationId: "corr_worker_test",
      }),
    );
  });

  it("rejects unauthenticated control requests", async () => {
    const response = await handleWorkerFetch(
      new Request("https://worker.example/control/execute", {
        method: "POST",
      }),
      {
        MANDATE402_WORKER_TOKEN: "worker-token",
        MANDATE402_CONTROL_API_URL: "https://control.example/",
      },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Unauthorized worker request.",
    });
  });

  it("forwards queue messages to the internal worker control route", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const ack = vi.fn();
    const retry = vi.fn();
    const env = {
      MANDATE402_CONTROL_API_URL: "https://control.example/",
      MANDATE402_WORKER_TOKEN: "worker-token",
    } satisfies WorkerEnv;

    await handleWorkerQueue(
      {
        queue: "mandate402-execution",
        messages: [
          {
            body: {
              kind: "dispatch_attempt",
              workerId: "cloudflare-queue-execution",
              correlationId: null,
              commandId: "cmd_test_1",
              issuedAt: "2026-01-01T00:00:00.000Z",
            },
            ack,
            retry,
          },
        ],
      },
      env,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://control.example/api/internal/workers/execute",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer worker-token",
          "x-worker-id": "cloudflare-queue-execution",
        }),
      }),
    );
    expect(ack).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
  });
});
