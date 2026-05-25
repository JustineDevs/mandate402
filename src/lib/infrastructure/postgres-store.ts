import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import type { PoolClient } from "pg";
import { Pool } from "pg";

import type { StoreData } from "@/lib/domain/types";
import { getDatabaseDirectUrl, getDatabaseUrl } from "@/lib/infrastructure/env";
import { assertStoreIntegrity } from "@/lib/infrastructure/store-integrity";

const POSTGRES_LOCK_KEY = 402001;
const runtimeMigrationsDir = path.join(process.cwd(), "db", "migrations");

let pool: Pool | null = null;
let schemaPool: Pool | null = null;
let schemaReady = false;
let schemaEnsurePromise: Promise<void> | null = null;

function isSupabasePoolerConnection(connectionString: string) {
  try {
    const host = new URL(connectionString).hostname.toLowerCase();
    return host.includes("pooler.supabase.com");
  } catch {
    return false;
  }
}

function buildPool(connectionString: string) {
  const useSupabaseSsl =
    isSupabasePoolerConnection(connectionString) ||
    connectionString.toLowerCase().includes("supabase.co");

  return new Pool({
    connectionString,
    max: Number(process.env.MANDATE402_DB_POOL_MAX ?? 10),
    idleTimeoutMillis: Number(
      process.env.MANDATE402_DB_IDLE_TIMEOUT_MS ?? 10_000,
    ),
    allowExitOnIdle: true,
    ssl: useSupabaseSsl ? { rejectUnauthorized: false } : undefined,
  });
}

function getPool() {
  if (pool) {
    return pool;
  }

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      "Postgres persistence mode requires MANDATE402_DATABASE_URL or DATABASE_URL.",
    );
  }

  pool = buildPool(connectionString);
  return pool;
}

function getSchemaPool() {
  if (schemaPool) {
    return schemaPool;
  }

  const connectionString = getDatabaseDirectUrl() ?? getDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      "Postgres schema setup requires MANDATE402_DATABASE_DIRECT_URL, DATABASE_DIRECT_URL, MANDATE402_DATABASE_URL, or DATABASE_URL.",
    );
  }

  schemaPool = buildPool(connectionString);
  return schemaPool;
}

async function ensureSchema() {
  // Validate the primary runtime connection first so config errors surface
  // from the main store contract before schema bootstrap details.
  getPool();

  if (schemaReady) {
    return;
  }

  if (schemaEnsurePromise) {
    await schemaEnsurePromise;
    return;
  }

  schemaEnsurePromise = (async () => {
    const client = await getSchemaPool().connect();
    try {
      await client.query("BEGIN");
      await client.query(`
        CREATE TABLE IF NOT EXISTS mandate402_schema_migrations (
          name text PRIMARY KEY,
          applied_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        )
      `);

      const migrationFiles = readdirSync(runtimeMigrationsDir)
        .filter((file) => file.endsWith(".sql"))
        .sort();
      const applied = await readAppliedBootstrapMigrations(client);

      for (const file of migrationFiles) {
        if (applied.has(file)) {
          continue;
        }

        const sql = readFileSync(path.join(runtimeMigrationsDir, file), "utf8");
        await client.query(sql);
        await client.query(
          "INSERT INTO mandate402_schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
          [file],
        );
      }

      await client.query("COMMIT");
      schemaReady = true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })();

  try {
    await schemaEnsurePromise;
  } finally {
    schemaEnsurePromise = null;
  }
}

async function tableExists(client: PoolClient, tableName: string) {
  const result = await client.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists
    `,
    [tableName],
  );

  return result.rows[0]?.exists === true;
}

async function columnExists(
  client: PoolClient,
  tableName: string,
  columnName: string,
) {
  const result = await client.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name = $2
      ) AS exists
    `,
    [tableName, columnName],
  );

  return result.rows[0]?.exists === true;
}

async function readAppliedBootstrapMigrations(client: PoolClient) {
  const appliedRows = await client.query<{ name: string }>(
    "SELECT name FROM mandate402_schema_migrations",
  );
  const applied = new Set(appliedRows.rows.map((row) => row.name));

  if (applied.size > 0) {
    return applied;
  }

  const inferred = new Set<string>();

  if (
    (await tableExists(client, "agents")) &&
    (await tableExists(client, "mandates")) &&
    (await tableExists(client, "attempts")) &&
    (await tableExists(client, "worker_tasks"))
  ) {
    inferred.add("0001_store.sql");
  }

  if (
    (await columnExists(client, "worker_tasks", "operator_id")) &&
    (await columnExists(client, "worker_tasks", "correlation_id")) &&
    (await columnExists(client, "worker_tasks", "lease_owner"))
  ) {
    inferred.add("0002_worker_task_context.sql");
  }

  if (
    (await tableExists(client, "operator_profiles")) &&
    (await tableExists(client, "operator_auth_identities"))
  ) {
    inferred.add("0003_operator_auth_tables.sql");
  }

  if (
    (await tableExists(client, "operator_treasury_wallet_accounts")) &&
    (await columnExists(client, "operator_profiles", "onboarding_state"))
  ) {
    inferred.add("0004_operator_treasury_wallets.sql");
  }

  if (
    (await columnExists(
      client,
      "operator_treasury_wallet_accounts",
      "provider_user_id",
    )) &&
    (await columnExists(
      client,
      "operator_treasury_wallet_accounts",
      "orchestrator_address",
    ))
  ) {
    inferred.add("0005_operator_wallet_runtime_state.sql");
  }

  for (const file of inferred) {
    await client.query(
      "INSERT INTO mandate402_schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      [file],
    );
  }

  return inferred;
}

export async function readStorePostgres(): Promise<StoreData> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    return readStoreFromClient(client);
  } finally {
    client.release();
  }
}

export async function writeStorePostgres(data: StoreData) {
  assertStoreIntegrity(data);
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await writeStoreToClient(client, data);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function withPostgresStoreLock<T>(
  work: (data: StoreData) => Promise<T>,
) {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [POSTGRES_LOCK_KEY]);
    const data = await readStoreFromClient(client);
    const result = await work(data);
    await writeStoreToClient(client, data);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function readStoreFromClient(client: PoolClient): Promise<StoreData> {
  const agentsResult = await client.query<{
    id: string;
    name: string;
    status: "active" | "revoked";
    created_at: string;
    updated_at: string;
  }>(
    `
      SELECT id, name, status, created_at, updated_at
      FROM agents
      ORDER BY created_at DESC
    `,
  );

  const approvedVendorRows = await client.query<{
    mandate_id: string;
    vendor_id: string;
  }>(
    `
      SELECT mandate_id, vendor_id
      FROM mandate_approved_vendors
      ORDER BY vendor_id ASC
    `,
  );

  const approvedByMandate = new Map<string, string[]>();
  for (const row of approvedVendorRows.rows) {
    const current = approvedByMandate.get(row.mandate_id) ?? [];
    current.push(row.vendor_id);
    approvedByMandate.set(row.mandate_id, current);
  }

  const mandatesResult = await client.query<{
    id: string;
    name: string;
    agent_id: string;
    agent_name: string;
    status: StoreData["mandates"][number]["status"];
    budget_cap_cents: number | string;
    reserved_cents: number | string;
    consumed_cents: number | string;
    requires_receipt_capability: boolean;
    morph_issue_tx_id: string;
    morph_revoke_tx_id: string | null;
    expires_at: string;
    created_at: string;
    updated_at: string;
  }>(
    `
      SELECT
        id, name, agent_id, agent_name, status, budget_cap_cents,
        reserved_cents, consumed_cents, requires_receipt_capability,
        morph_issue_tx_id, morph_revoke_tx_id, expires_at, created_at, updated_at
      FROM mandates
      ORDER BY created_at DESC
    `,
  );

  const attemptsResult = await client.query<{
    id: string;
    mandate_id: string;
    vendor_id: string;
    amount_cents: number | string;
    operator_id: string;
    status: StoreData["attempts"][number]["status"];
    financial_outcome: StoreData["attempts"][number]["financialOutcome"];
    receipt_evidence: StoreData["attempts"][number]["receiptEvidence"];
    blocked_reason: string | null;
    charge_reference: string | null;
    payment_identifier: string;
    created_at: string;
    updated_at: string;
  }>(
    `
      SELECT
        id, mandate_id, vendor_id, amount_cents, operator_id, status,
        financial_outcome, receipt_evidence, blocked_reason, charge_reference,
        payment_identifier, created_at, updated_at
      FROM attempts
      ORDER BY created_at DESC
    `,
  );

  const workerTaskResult = await client.query<{
    id: string;
    kind: StoreData["workerTasks"][number]["kind"];
    attempt_id: string;
    mandate_id: string;
    operator_id: string | null;
    correlation_id: string | null;
    lease_owner: string | null;
    lease_expires_at: string | null;
    available_at: string;
    status: StoreData["workerTasks"][number]["status"];
    attempt_count: number | string;
    last_error: string | null;
    created_at: string;
    updated_at: string;
    started_at: string | null;
    completed_at: string | null;
  }>(
    `
      SELECT
        id, kind, attempt_id, mandate_id, operator_id, correlation_id,
        lease_owner, lease_expires_at, available_at, status, attempt_count,
        last_error, created_at, updated_at, started_at, completed_at
      FROM worker_tasks
      ORDER BY created_at DESC
    `,
  );

  const auditResult = await client.query<{
    id: string;
    mandate_id: string;
    attempt_id: string | null;
    type: StoreData["auditEntries"][number]["type"];
    message: string;
    created_at: string;
  }>(
    `
      SELECT id, mandate_id, attempt_id, type, message, created_at
      FROM audit_entries
      ORDER BY created_at DESC
    `,
  );

  const eventResult = await client.query<{
    id: string;
    entity_type: StoreData["domainEvents"][number]["entityType"];
    entity_id: string;
    event_type: string;
    correlation_id: string | null;
    occurred_at: string;
    metadata_json: string;
  }>(
    `
      SELECT
        id, entity_type, entity_id, event_type, correlation_id, occurred_at, metadata_json
      FROM domain_events
      ORDER BY occurred_at DESC
    `,
  );

  const store = {
    agents: agentsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    mandates: mandatesResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      agentId: row.agent_id,
      agentName: row.agent_name,
      status: row.status,
      budgetCapCents: Number(row.budget_cap_cents),
      reservedCents: Number(row.reserved_cents),
      consumedCents: Number(row.consumed_cents),
      requiresReceiptCapability: row.requires_receipt_capability,
      approvedVendorIds: approvedByMandate.get(row.id) ?? [],
      morphIssueTxId: row.morph_issue_tx_id,
      morphRevokeTxId: row.morph_revoke_tx_id,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    attempts: attemptsResult.rows.map((row) => ({
      id: row.id,
      mandateId: row.mandate_id,
      vendorId: row.vendor_id,
      amountCents: Number(row.amount_cents),
      operatorId: row.operator_id,
      status: row.status,
      financialOutcome: row.financial_outcome,
      receiptEvidence: row.receipt_evidence,
      blockedReason: row.blocked_reason,
      chargeReference: row.charge_reference,
      paymentIdentifier: row.payment_identifier,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    workerTasks: workerTaskResult.rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      attemptId: row.attempt_id,
      mandateId: row.mandate_id,
      operatorId: row.operator_id,
      correlationId: row.correlation_id,
      leaseOwner: row.lease_owner,
      leaseExpiresAt: row.lease_expires_at,
      availableAt: row.available_at,
      status: row.status,
      attemptCount: Number(row.attempt_count),
      lastError: row.last_error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    })),
    auditEntries: auditResult.rows.map((row) => ({
      id: row.id,
      mandateId: row.mandate_id,
      attemptId: row.attempt_id,
      type: row.type,
      message: row.message,
      createdAt: row.created_at,
    })),
    domainEvents: eventResult.rows.map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      eventType: row.event_type,
      correlationId: row.correlation_id,
      occurredAt: row.occurred_at,
      metadata: JSON.parse(row.metadata_json ?? "{}") as Record<
        string,
        string | number | boolean | null
      >,
    })),
  };

  assertStoreIntegrity(store);
  return store;
}

async function writeStoreToClient(client: PoolClient, data: StoreData) {
  assertStoreIntegrity(data);
  for (const agent of data.agents) {
    await client.query(
      `
        INSERT INTO agents (id, name, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          status = EXCLUDED.status,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      `,
      [agent.id, agent.name, agent.status, agent.createdAt, agent.updatedAt],
    );
  }

  for (const mandate of data.mandates) {
    await client.query(
      `
        INSERT INTO mandates (
          id, name, agent_id, agent_name, status, budget_cap_cents,
          reserved_cents, consumed_cents, requires_receipt_capability,
          morph_issue_tx_id, morph_revoke_tx_id, expires_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          agent_id = EXCLUDED.agent_id,
          agent_name = EXCLUDED.agent_name,
          status = EXCLUDED.status,
          budget_cap_cents = EXCLUDED.budget_cap_cents,
          reserved_cents = EXCLUDED.reserved_cents,
          consumed_cents = EXCLUDED.consumed_cents,
          requires_receipt_capability = EXCLUDED.requires_receipt_capability,
          morph_issue_tx_id = EXCLUDED.morph_issue_tx_id,
          morph_revoke_tx_id = EXCLUDED.morph_revoke_tx_id,
          expires_at = EXCLUDED.expires_at,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      `,
      [
        mandate.id,
        mandate.name,
        mandate.agentId,
        mandate.agentName,
        mandate.status,
        mandate.budgetCapCents,
        mandate.reservedCents,
        mandate.consumedCents,
        mandate.requiresReceiptCapability,
        mandate.morphIssueTxId,
        mandate.morphRevokeTxId,
        mandate.expiresAt,
        mandate.createdAt,
        mandate.updatedAt,
      ],
    );

    await client.query(
      "DELETE FROM mandate_approved_vendors WHERE mandate_id = $1",
      [mandate.id],
    );
    for (const vendorId of mandate.approvedVendorIds) {
      await client.query(
        `
          INSERT INTO mandate_approved_vendors (mandate_id, vendor_id)
          VALUES ($1, $2)
          ON CONFLICT (mandate_id, vendor_id) DO NOTHING
        `,
        [mandate.id, vendorId],
      );
    }
  }

  for (const attempt of data.attempts) {
    await client.query(
      `
        INSERT INTO attempts (
          id, mandate_id, vendor_id, amount_cents, operator_id, status,
          financial_outcome, receipt_evidence, blocked_reason, charge_reference,
          payment_identifier, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          mandate_id = EXCLUDED.mandate_id,
          vendor_id = EXCLUDED.vendor_id,
          amount_cents = EXCLUDED.amount_cents,
          operator_id = EXCLUDED.operator_id,
          status = EXCLUDED.status,
          financial_outcome = EXCLUDED.financial_outcome,
          receipt_evidence = EXCLUDED.receipt_evidence,
          blocked_reason = EXCLUDED.blocked_reason,
          charge_reference = EXCLUDED.charge_reference,
          payment_identifier = EXCLUDED.payment_identifier,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      `,
      [
        attempt.id,
        attempt.mandateId,
        attempt.vendorId,
        attempt.amountCents,
        attempt.operatorId,
        attempt.status,
        attempt.financialOutcome,
        attempt.receiptEvidence,
        attempt.blockedReason,
        attempt.chargeReference,
        attempt.paymentIdentifier,
        attempt.createdAt,
        attempt.updatedAt,
      ],
    );
  }

  for (const workerTask of data.workerTasks) {
    await client.query(
      `
        INSERT INTO worker_tasks (
          id, kind, attempt_id, mandate_id, operator_id, correlation_id,
          lease_owner, lease_expires_at, available_at, status, attempt_count,
          last_error, created_at, updated_at, started_at, completed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          kind = EXCLUDED.kind,
          attempt_id = EXCLUDED.attempt_id,
          mandate_id = EXCLUDED.mandate_id,
          operator_id = EXCLUDED.operator_id,
          correlation_id = EXCLUDED.correlation_id,
          lease_owner = EXCLUDED.lease_owner,
          lease_expires_at = EXCLUDED.lease_expires_at,
          available_at = EXCLUDED.available_at,
          status = EXCLUDED.status,
          attempt_count = EXCLUDED.attempt_count,
          last_error = EXCLUDED.last_error,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at,
          started_at = EXCLUDED.started_at,
          completed_at = EXCLUDED.completed_at
      `,
      [
        workerTask.id,
        workerTask.kind,
        workerTask.attemptId,
        workerTask.mandateId,
        workerTask.operatorId,
        workerTask.correlationId,
        workerTask.leaseOwner,
        workerTask.leaseExpiresAt,
        workerTask.availableAt,
        workerTask.status,
        workerTask.attemptCount,
        workerTask.lastError,
        workerTask.createdAt,
        workerTask.updatedAt,
        workerTask.startedAt,
        workerTask.completedAt,
      ],
    );
  }

  for (const audit of data.auditEntries) {
    await client.query(
      `
        INSERT INTO audit_entries (id, mandate_id, attempt_id, type, message, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          mandate_id = EXCLUDED.mandate_id,
          attempt_id = EXCLUDED.attempt_id,
          type = EXCLUDED.type,
          message = EXCLUDED.message,
          created_at = EXCLUDED.created_at
      `,
      [
        audit.id,
        audit.mandateId,
        audit.attemptId,
        audit.type,
        audit.message,
        audit.createdAt,
      ],
    );
  }

  for (const event of data.domainEvents) {
    await client.query(
      `
        INSERT INTO domain_events (
          id, entity_type, entity_id, event_type, correlation_id, occurred_at, metadata_json
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          entity_type = EXCLUDED.entity_type,
          entity_id = EXCLUDED.entity_id,
          event_type = EXCLUDED.event_type,
          correlation_id = EXCLUDED.correlation_id,
          occurred_at = EXCLUDED.occurred_at,
          metadata_json = EXCLUDED.metadata_json
      `,
      [
        event.id,
        event.entityType,
        event.entityId,
        event.eventType,
        event.correlationId,
        event.occurredAt,
        JSON.stringify(event.metadata),
      ],
    );
  }

  await client.query("DELETE FROM domain_events WHERE id <> ALL($1::text[])", [
    data.domainEvents.map((event) => event.id),
  ]);
  await client.query("DELETE FROM audit_entries WHERE id <> ALL($1::text[])", [
    data.auditEntries.map((audit) => audit.id),
  ]);
  await client.query("DELETE FROM worker_tasks WHERE id <> ALL($1::text[])", [
    data.workerTasks.map((workerTask) => workerTask.id),
  ]);
  await client.query("DELETE FROM attempts WHERE id <> ALL($1::text[])", [
    data.attempts.map((attempt) => attempt.id),
  ]);
  await client.query("DELETE FROM mandates WHERE id <> ALL($1::text[])", [
    data.mandates.map((mandate) => mandate.id),
  ]);
  await client.query("DELETE FROM agents WHERE id <> ALL($1::text[])", [
    data.agents.map((agent) => agent.id),
  ]);
}

export async function resetPostgresStoreForTests() {
  schemaReady = false;
  const shutdowns: Promise<void>[] = [];
  if (pool) {
    const current = pool;
    pool = null;
    shutdowns.push(current.end());
  }
  if (schemaPool) {
    const current = schemaPool;
    schemaPool = null;
    shutdowns.push(current.end());
  }
  await Promise.all(shutdowns);
}

mkdirSync(runtimeMigrationsDir, { recursive: true });
