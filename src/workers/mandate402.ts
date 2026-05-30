import { type D1Database, createWorkerCacheStorage } from "@/workers/storage";

type QueueName = "dispatch_attempt" | "reconcile_attempt";

type QueueMessage = {
  body: unknown;
  attempts?: number;
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
};

type MessageBatch = {
  queue: string;
  messages: QueueMessage[];
};

type WorkerExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type WorkerQueue = {
  send(message: WorkerQueueEnvelope): Promise<void>;
};

type DurableObjectTransaction = {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
};

type DurableObjectStorage = {
  transaction<T>(
    work: (transaction: DurableObjectTransaction) => Promise<T>,
  ): Promise<T>;
};

type DurableObjectState = {
  storage: DurableObjectStorage;
};

export type WorkerEnv = {
  MANDATE402_CONTROL_API_URL?: string;
  MANDATE402_WORKER_TOKEN?: string;
  MANDATE402_WORKER_CACHE?: D1Database;
  EXECUTION_QUEUE?: WorkerQueue;
  RECONCILIATION_QUEUE?: WorkerQueue;
};

type WorkerQueueEnvelope = {
  kind: QueueName;
  workerId: string;
  correlationId: string | null;
  commandId: string;
  issuedAt: string;
};

const WORKER_MAX_RETRIES = 3;
const WORKER_RETRY_DELAY_SECONDS = 30;

type BudgetState = {
  reservedCents: number;
  consumedCents: number;
  processedCommandIds: string[];
};

type BudgetCommand = {
  commandId: string;
  amountCents: number;
};

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

function requireControlRequest(request: Request, env: WorkerEnv) {
  const expected = env.MANDATE402_WORKER_TOKEN?.trim();
  if (!expected) {
    return json(
      { ok: false, error: "Worker control auth is not configured." },
      { status: 503 },
    );
  }

  const bearer = request.headers.get("authorization");
  const presented = bearer?.startsWith("Bearer ")
    ? bearer.slice("Bearer ".length)
    : request.headers.get("x-worker-token");

  if (!presented || presented !== expected) {
    return json(
      { ok: false, error: "Unauthorized worker request." },
      { status: 401 },
    );
  }

  return null;
}

function requireWorkerConfig(env: WorkerEnv) {
  if (!env.MANDATE402_CONTROL_API_URL || !env.MANDATE402_WORKER_TOKEN) {
    throw new Error(
      "Worker control API forwarding requires MANDATE402_CONTROL_API_URL and MANDATE402_WORKER_TOKEN.",
    );
  }

  return {
    controlApiUrl: env.MANDATE402_CONTROL_API_URL.replace(/\/$/, ""),
    workerToken: env.MANDATE402_WORKER_TOKEN,
  };
}

async function forwardWorkerRoute(
  env: WorkerEnv,
  path: "/api/internal/workers/execute" | "/api/internal/workers/reconcile",
  workerId: string,
) {
  const config = requireWorkerConfig(env);
  const response = await fetch(`${config.controlApiUrl}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.workerToken}`,
      "x-worker-id": workerId,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Worker control route ${path} failed with ${response.status}.`,
    );
  }

  return response.json() as Promise<unknown>;
}

function readQueueEnvelope(message: QueueMessage): WorkerQueueEnvelope | null {
  if (!message.body || typeof message.body !== "object") {
    return null;
  }

  const body = message.body as Partial<WorkerQueueEnvelope>;
  if (
    (body.kind !== "dispatch_attempt" && body.kind !== "reconcile_attempt") ||
    typeof body.commandId !== "string"
  ) {
    return null;
  }

  return {
    kind: body.kind,
    workerId:
      typeof body.workerId === "string" ? body.workerId : "cloudflare-queue",
    correlationId:
      typeof body.correlationId === "string" ? body.correlationId : null,
    commandId: body.commandId,
    issuedAt:
      typeof body.issuedAt === "string"
        ? body.issuedAt
        : new Date().toISOString(),
  };
}

function isDeadLetterQueueBatch(batch: MessageBatch) {
  return batch.queue.endsWith("-dlq");
}

async function enqueueRequest(
  queue: WorkerQueue | undefined,
  kind: QueueName,
  request: Request,
  env: WorkerEnv,
) {
  if (!queue) {
    return json(
      {
        ok: false,
        error: `${kind} queue is not configured.`,
      },
      { status: 503 },
    );
  }

  const now = new Date().toISOString();
  const correlationId = request.headers.get("x-correlation-id");
  const commandId = crypto.randomUUID();
  await queue.send({
    kind,
    workerId: "cloudflare-control-api",
    correlationId,
    commandId,
    issuedAt: now,
  });
  await createWorkerCacheStorage(
    env.MANDATE402_WORKER_CACHE,
  ).recordControlEvent({
    id: crypto.randomUUID(),
    kind,
    correlationId,
    workerId: "cloudflare-control-api",
    commandId,
    status: "queued",
    createdAt: now,
  });

  return json({ ok: true, data: { queued: true, kind } }, { status: 202 });
}

async function runScheduledDrain(env: WorkerEnv) {
  await Promise.all([
    forwardWorkerRoute(
      env,
      "/api/internal/workers/execute",
      "cloudflare-cron-execution",
    ),
    forwardWorkerRoute(
      env,
      "/api/internal/workers/reconcile",
      "cloudflare-cron-reconciliation",
    ),
  ]);
}

export async function handleWorkerFetch(request: Request, env: WorkerEnv) {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/health") {
    return json({
      ok: true,
      data: {
        service: "mandate402-worker",
        executionQueueConfigured: Boolean(env.EXECUTION_QUEUE),
        reconciliationQueueConfigured: Boolean(env.RECONCILIATION_QUEUE),
        controlApiConfigured: Boolean(env.MANDATE402_CONTROL_API_URL),
        dlqConfigured: true,
        maxRetries: WORKER_MAX_RETRIES,
        retryDelaySeconds: WORKER_RETRY_DELAY_SECONDS,
      },
    });
  }

  const authError = requireControlRequest(request, env);
  if (authError) {
    return authError;
  }

  if (request.method === "POST" && url.pathname === "/control/execute") {
    const data = await forwardWorkerRoute(
      env,
      "/api/internal/workers/execute",
      "cloudflare-control-execution",
    );
    return json({ ok: true, data });
  }

  if (request.method === "POST" && url.pathname === "/control/reconcile") {
    const data = await forwardWorkerRoute(
      env,
      "/api/internal/workers/reconcile",
      "cloudflare-control-reconciliation",
    );
    return json({ ok: true, data });
  }

  if (request.method === "POST" && url.pathname === "/queues/execute") {
    return enqueueRequest(
      env.EXECUTION_QUEUE,
      "dispatch_attempt",
      request,
      env,
    );
  }

  if (request.method === "POST" && url.pathname === "/queues/reconcile") {
    return enqueueRequest(
      env.RECONCILIATION_QUEUE,
      "reconcile_attempt",
      request,
      env,
    );
  }

  return json({ ok: false, error: "Route not found." }, { status: 404 });
}

export async function handleWorkerQueue(batch: MessageBatch, env: WorkerEnv) {
  const cache = createWorkerCacheStorage(env.MANDATE402_WORKER_CACHE);

  if (isDeadLetterQueueBatch(batch)) {
    for (const message of batch.messages) {
      const envelope = readQueueEnvelope(message);
      const now = new Date().toISOString();
      await cache.recordControlEvent({
        id: crypto.randomUUID(),
        kind: envelope?.kind ?? "invalid",
        correlationId: envelope?.correlationId ?? null,
        workerId: "cloudflare-dlq",
        commandId: envelope?.commandId ?? null,
        attemptCount: message.attempts ?? null,
        status: "dead_letter",
        createdAt: now,
      });
      message.ack();
    }
    return;
  }

  for (const message of batch.messages) {
    const envelope = readQueueEnvelope(message);
    const kind = envelope?.kind ?? null;
    const now = new Date().toISOString();
    try {
      if (kind === "dispatch_attempt") {
        await forwardWorkerRoute(
          env,
          "/api/internal/workers/execute",
          envelope?.workerId ?? "cloudflare-queue-execution",
        );
      } else if (kind === "reconcile_attempt") {
        await forwardWorkerRoute(
          env,
          "/api/internal/workers/reconcile",
          envelope?.workerId ?? "cloudflare-queue-reconciliation",
        );
      } else {
        throw new Error("Queue message kind is missing or invalid.");
      }
      await cache.recordControlEvent({
        id: crypto.randomUUID(),
        kind,
        correlationId: envelope?.correlationId ?? null,
        workerId: envelope?.workerId ?? "cloudflare-queue",
        commandId: envelope?.commandId ?? null,
        attemptCount: message.attempts ?? null,
        status: "forwarded",
        createdAt: now,
      });
      message.ack();
    } catch {
      await cache.recordControlEvent({
        id: crypto.randomUUID(),
        kind: kind ?? "invalid",
        correlationId: envelope?.correlationId ?? null,
        workerId: envelope?.workerId ?? "cloudflare-queue",
        commandId: envelope?.commandId ?? null,
        attemptCount: message.attempts ?? null,
        status: "retrying",
        createdAt: now,
      });
      message.retry({ delaySeconds: WORKER_RETRY_DELAY_SECONDS });
    }
  }
}

export class MandateBudgetLockDurableObject {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request) {
    const url = new URL(request.url);
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, { status: 405 });
    }

    if (url.pathname === "/reserve") {
      return this.applyBudgetCommand(request, "reserve");
    }

    if (url.pathname === "/consume") {
      return this.applyBudgetCommand(request, "consume");
    }

    if (url.pathname === "/release") {
      return this.applyBudgetCommand(request, "release");
    }

    return json({ ok: false, error: "Route not found." }, { status: 404 });
  }

  private async applyBudgetCommand(
    request: Request,
    command: "reserve" | "consume" | "release",
  ) {
    const input = (await request.json()) as Partial<BudgetCommand>;
    const commandId =
      typeof input.commandId === "string" ? input.commandId : "";
    const amountCents =
      typeof input.amountCents === "number" ? input.amountCents : Number.NaN;
    if (!commandId || !Number.isInteger(amountCents) || amountCents <= 0) {
      return json(
        { ok: false, error: "Invalid budget command." },
        { status: 400 },
      );
    }

    const data = await this.state.storage.transaction(async (transaction) => {
      const state = (await transaction.get<BudgetState>("budget")) ?? {
        reservedCents: 0,
        consumedCents: 0,
        processedCommandIds: [],
      };

      if (state.processedCommandIds.includes(commandId)) {
        return state;
      }

      if (command === "reserve") {
        state.reservedCents += amountCents;
      } else if (command === "consume") {
        state.reservedCents = Math.max(0, state.reservedCents - amountCents);
        state.consumedCents += amountCents;
      } else {
        state.reservedCents = Math.max(0, state.reservedCents - amountCents);
      }

      state.processedCommandIds = [
        ...state.processedCommandIds.slice(-99),
        commandId,
      ];
      await transaction.put("budget", state);
      return state;
    });

    return json({ ok: true, data });
  }
}

export default {
  fetch(request: Request, env: WorkerEnv) {
    return handleWorkerFetch(request, env);
  },
  queue(batch: MessageBatch, env: WorkerEnv) {
    return handleWorkerQueue(batch, env);
  },
  scheduled(_event: unknown, env: WorkerEnv, ctx: WorkerExecutionContext) {
    ctx.waitUntil(runScheduledDrain(env));
  },
};
