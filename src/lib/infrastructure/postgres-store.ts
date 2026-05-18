import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { PoolClient } from "pg";
import { Pool } from "pg";

import type { StoreData } from "@/lib/domain/types";

const POSTGRES_LOCK_KEY = 402001;
const migrationsDir = path.join(process.cwd(), "db", "migrations");

let pool: Pool | null = null;
let schemaReady = false;

function getPool() {
  if (pool) {
    return pool;
  }

  const connectionString =
    process.env.MANDATE402_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Postgres persistence mode requires MANDATE402_DATABASE_URL or DATABASE_URL.",
    );
  }

  pool = new Pool({
    connectionString,
  });

  return pool;
}

async function ensureSchema() {
  if (schemaReady) {
    return;
  }

  const sql = readFileSync(path.join(migrationsDir, "0001_store.sql"), "utf8");
  const client = await getPool().connect();
  try {
    await client.query(sql);
    schemaReady = true;
  } finally {
    client.release();
  }
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

  return {
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
}

async function writeStoreToClient(client: PoolClient, data: StoreData) {
  await client.query(`
    DELETE FROM domain_events;
    DELETE FROM audit_entries;
    DELETE FROM attempts;
    DELETE FROM mandate_approved_vendors;
    DELETE FROM mandates;
    DELETE FROM agents;
  `);

  for (const agent of data.agents) {
    await client.query(
      `
        INSERT INTO agents (id, name, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
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

    for (const vendorId of mandate.approvedVendorIds) {
      await client.query(
        `
          INSERT INTO mandate_approved_vendors (mandate_id, vendor_id)
          VALUES ($1, $2)
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

  for (const audit of data.auditEntries) {
    await client.query(
      `
        INSERT INTO audit_entries (id, mandate_id, attempt_id, type, message, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
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
}

export function resetPostgresStoreForTests() {
  schemaReady = false;
  if (pool) {
    const current = pool;
    pool = null;
    return current.end();
  }

  return Promise.resolve();
}

mkdirSync(migrationsDir, { recursive: true });
