export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
};

export type D1Database = {
  prepare(sql: string): D1PreparedStatement;
};

export type WorkerControlEventInput = {
  id: string;
  kind: string;
  correlationId: string | null;
  workerId: string;
  status: "queued" | "forwarded" | "retrying" | "dead_letter";
  commandId?: string | null;
  attemptCount?: number | null;
  createdAt: string;
};

export type WorkerCacheStorage = {
  recordControlEvent(input: WorkerControlEventInput): Promise<void>;
};

class NoopWorkerCacheStorage implements WorkerCacheStorage {
  async recordControlEvent() {}
}

class D1WorkerCacheStorage implements WorkerCacheStorage {
  constructor(private readonly db: D1Database) {}

  async recordControlEvent(input: WorkerControlEventInput) {
    await this.db
      .prepare(
        `
          INSERT INTO worker_control_events (
            id, kind, correlation_id, worker_id, status, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
      )
      .bind(
        input.id,
        input.kind,
        input.correlationId,
        input.workerId,
        input.status,
        input.createdAt,
      )
      .run();
  }
}

export function createWorkerCacheStorage(db?: D1Database): WorkerCacheStorage {
  if (!db) {
    return new NoopWorkerCacheStorage();
  }

  return new D1WorkerCacheStorage(db);
}
