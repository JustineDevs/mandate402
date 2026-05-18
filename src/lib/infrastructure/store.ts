import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { StoreData } from "@/lib/domain/types";
import { nowIso } from "@/lib/infrastructure/clock";
import {
  getDatabaseUrl,
  getPersistenceMode,
  isProductionEnv,
} from "@/lib/infrastructure/env";
import {
  readStorePostgres,
  resetPostgresStoreForTests,
  withPostgresStoreLock,
  writeStorePostgres,
} from "@/lib/infrastructure/postgres-store";

const dataDir = path.join(process.cwd(), "data");
const testDataDir = path.join(process.cwd(), ".tmp", "test-sqlite");

function getSqlitePath() {
  const workerId = process.env.VITEST_POOL_ID;
  if (workerId) {
    mkdirSync(testDataDir, { recursive: true });
    return path.join(testDataDir, `mandate402-${workerId}.sqlite`);
  }

  return path.join(dataDir, "mandate402.sqlite");
}

const seedData: StoreData = {
  agents: [
    {
      id: "agent_research_alpha",
      name: "Research Alpha",
      status: "active",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ],
  mandates: [
    {
      id: "mdt_demo_001",
      name: "Research Agent Spend",
      agentId: "agent_research_alpha",
      agentName: "Research Alpha",
      status: "issued_active",
      budgetCapCents: 5000,
      reservedCents: 0,
      consumedCents: 1200,
      requiresReceiptCapability: true,
      approvedVendorIds: ["morph-market-data", "morph-research-net"],
      morphIssueTxId: "0xmorphissue001",
      morphRevokeTxId: null,
      expiresAt: "2026-05-29T23:59:00.000Z",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ],
  attempts: [
    {
      id: "att_demo_success",
      mandateId: "mdt_demo_001",
      vendorId: "morph-market-data",
      amountCents: 1200,
      operatorId: "operator_demo",
      status: "executed_charge_succeeded",
      financialOutcome: "executed_charge_succeeded",
      receiptEvidence: "received_valid",
      blockedReason: null,
      chargeReference: "charge_morph_001",
      paymentIdentifier: "pid_demo_success",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "att_demo_blocked",
      mandateId: "mdt_demo_001",
      vendorId: "rogue-vendor",
      amountCents: 1800,
      operatorId: "operator_demo",
      status: "policy_denied",
      financialOutcome: "policy_denied",
      receiptEvidence: "not_required",
      blockedReason: "vendor_not_allowlisted",
      chargeReference: null,
      paymentIdentifier: "pid_demo_blocked",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ],
  auditEntries: [
    {
      id: "audit_issue_demo",
      mandateId: "mdt_demo_001",
      attemptId: null,
      type: "mandate_issued",
      message: "Mandate anchored on Morph.",
      createdAt: nowIso(),
    },
  ],
  domainEvents: [
    {
      id: "evt_issue_demo",
      entityType: "mandate",
      entityId: "mdt_demo_001",
      eventType: "mandate_issued",
      correlationId: null,
      occurredAt: nowIso(),
      metadata: {
        morphIssueTxId: "0xmorphissue001",
        status: "issued_active",
      },
    },
  ],
};

let lock = Promise.resolve();
let database: DatabaseSync | null = null;

function ensureDatabase() {
  const persistenceMode = getPersistenceMode();

  if (isProductionEnv() && persistenceMode !== "postgres") {
    throw new Error(
      "Production mode requires postgres persistence. SQLite is demo-only.",
    );
  }

  if (persistenceMode === "postgres") {
    if (!getDatabaseUrl()) {
      throw new Error(
        "Postgres persistence mode requires MANDATE402_DATABASE_URL or DATABASE_URL.",
      );
    }
  }

  if (database) {
    return database;
  }

  mkdirSync(dataDir, { recursive: true });
  database = new DatabaseSync(getSqlitePath());
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mandates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      status TEXT NOT NULL,
      budget_cap_cents INTEGER NOT NULL,
      reserved_cents INTEGER NOT NULL,
      consumed_cents INTEGER NOT NULL,
      requires_receipt_capability INTEGER NOT NULL,
      morph_issue_tx_id TEXT NOT NULL,
      morph_revoke_tx_id TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS mandate_approved_vendors (
      mandate_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      PRIMARY KEY (mandate_id, vendor_id),
      FOREIGN KEY (mandate_id) REFERENCES mandates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      mandate_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      operator_id TEXT NOT NULL,
      status TEXT NOT NULL,
      financial_outcome TEXT NOT NULL,
      receipt_evidence TEXT NOT NULL,
      blocked_reason TEXT,
      charge_reference TEXT,
      payment_identifier TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (mandate_id) REFERENCES mandates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_entries (
      id TEXT PRIMARY KEY,
      mandate_id TEXT NOT NULL,
      attempt_id TEXT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (mandate_id) REFERENCES mandates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS domain_events (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      correlation_id TEXT,
      occurred_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL
    );
  `);

  const count = database
    .prepare("SELECT COUNT(*) as count FROM agents")
    .get() as { count: number };
  if (count.count === 0) {
    writeStoreSync(seedData);
  }

  return database;
}

function writeStoreSync(data: StoreData) {
  const db = ensureDatabase();
  const store = storeDataClone(data);
  db.exec("BEGIN");
  try {
    db.exec(`
      DELETE FROM domain_events;
      DELETE FROM audit_entries;
      DELETE FROM attempts;
      DELETE FROM mandate_approved_vendors;
      DELETE FROM mandates;
      DELETE FROM agents;
    `);

    const insertAgent = db.prepare(`
      INSERT INTO agents (id, name, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const agent of store.agents) {
      insertAgent.run(
        agent.id,
        agent.name,
        agent.status,
        agent.createdAt,
        agent.updatedAt,
      );
    }

    const insertMandate = db.prepare(`
      INSERT INTO mandates (
        id, name, agent_id, agent_name, status, budget_cap_cents,
        reserved_cents, consumed_cents, requires_receipt_capability,
        morph_issue_tx_id, morph_revoke_tx_id, expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertApprovedVendor = db.prepare(`
      INSERT INTO mandate_approved_vendors (mandate_id, vendor_id)
      VALUES (?, ?)
    `);
    for (const mandate of store.mandates) {
      insertMandate.run(
        mandate.id,
        mandate.name,
        mandate.agentId,
        mandate.agentName,
        mandate.status,
        mandate.budgetCapCents,
        mandate.reservedCents,
        mandate.consumedCents,
        mandate.requiresReceiptCapability ? 1 : 0,
        mandate.morphIssueTxId,
        mandate.morphRevokeTxId,
        mandate.expiresAt,
        mandate.createdAt,
        mandate.updatedAt,
      );
      for (const vendorId of mandate.approvedVendorIds) {
        insertApprovedVendor.run(mandate.id, vendorId);
      }
    }

    const insertAttempt = db.prepare(`
      INSERT INTO attempts (
        id, mandate_id, vendor_id, amount_cents, operator_id, status,
        financial_outcome, receipt_evidence, blocked_reason, charge_reference,
        payment_identifier, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const attempt of store.attempts) {
      insertAttempt.run(
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
      );
    }

    const insertAudit = db.prepare(`
      INSERT INTO audit_entries (id, mandate_id, attempt_id, type, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const audit of store.auditEntries) {
      insertAudit.run(
        audit.id,
        audit.mandateId,
        audit.attemptId,
        audit.type,
        audit.message,
        audit.createdAt,
      );
    }

    const insertDomainEvent = db.prepare(`
      INSERT INTO domain_events (
        id, entity_type, entity_id, event_type, correlation_id, occurred_at, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const event of store.domainEvents) {
      insertDomainEvent.run(
        event.id,
        event.entityType,
        event.entityId,
        event.eventType,
        event.correlationId,
        event.occurredAt,
        JSON.stringify(event.metadata),
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function storeDataClone(data: StoreData): StoreData {
  return structuredClone(data);
}

export function createSeedStoreData(): StoreData {
  return structuredClone(seedData);
}

export async function readStore(): Promise<StoreData> {
  if (getPersistenceMode() === "postgres") {
    return readStorePostgres();
  }

  const db = ensureDatabase();

  const agents = db
    .prepare(`
    SELECT id, name, status, created_at, updated_at
    FROM agents
    ORDER BY created_at DESC
  `)
    .all() as Array<{
    id: string;
    name: string;
    status: "active" | "revoked";
    created_at: string;
    updated_at: string;
  }>;

  const approvedVendorRows = db
    .prepare(`
    SELECT mandate_id, vendor_id
    FROM mandate_approved_vendors
    ORDER BY vendor_id ASC
  `)
    .all() as Array<{ mandate_id: string; vendor_id: string }>;
  const approvedByMandate = new Map<string, string[]>();
  for (const row of approvedVendorRows) {
    const current = approvedByMandate.get(row.mandate_id) ?? [];
    current.push(row.vendor_id);
    approvedByMandate.set(row.mandate_id, current);
  }

  const mandates = db
    .prepare(`
    SELECT
      id, name, agent_id, agent_name, status, budget_cap_cents,
      reserved_cents, consumed_cents, requires_receipt_capability,
      morph_issue_tx_id, morph_revoke_tx_id, expires_at, created_at, updated_at
    FROM mandates
    ORDER BY created_at DESC
  `)
    .all() as Array<Record<string, string | number | null>>;

  const attempts = db
    .prepare(`
    SELECT
      id, mandate_id, vendor_id, amount_cents, operator_id, status,
      financial_outcome, receipt_evidence, blocked_reason, charge_reference,
      payment_identifier, created_at, updated_at
    FROM attempts
    ORDER BY created_at DESC
  `)
    .all() as Array<Record<string, string | number | null>>;

  const auditEntries = db
    .prepare(`
    SELECT id, mandate_id, attempt_id, type, message, created_at
    FROM audit_entries
    ORDER BY created_at DESC
  `)
    .all() as Array<Record<string, string | null>>;

  const domainEvents = db
    .prepare(`
    SELECT
      id, entity_type, entity_id, event_type, correlation_id, occurred_at, metadata_json
    FROM domain_events
    ORDER BY occurred_at DESC
  `)
    .all() as Array<Record<string, string | null>>;

  return {
    agents: agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
    })),
    mandates: mandates.map((mandate) => ({
      id: mandate.id as string,
      name: mandate.name as string,
      agentId: mandate.agent_id as string,
      agentName: mandate.agent_name as string,
      status: mandate.status as StoreData["mandates"][number]["status"],
      budgetCapCents: Number(mandate.budget_cap_cents),
      reservedCents: Number(mandate.reserved_cents),
      consumedCents: Number(mandate.consumed_cents),
      requiresReceiptCapability:
        Number(mandate.requires_receipt_capability) === 1,
      approvedVendorIds: approvedByMandate.get(mandate.id as string) ?? [],
      morphIssueTxId: mandate.morph_issue_tx_id as string,
      morphRevokeTxId: mandate.morph_revoke_tx_id as string | null,
      expiresAt: mandate.expires_at as string,
      createdAt: mandate.created_at as string,
      updatedAt: mandate.updated_at as string,
    })),
    attempts: attempts.map((attempt) => ({
      id: attempt.id as string,
      mandateId: attempt.mandate_id as string,
      vendorId: attempt.vendor_id as string,
      amountCents: Number(attempt.amount_cents),
      operatorId: attempt.operator_id as string,
      status: attempt.status as StoreData["attempts"][number]["status"],
      financialOutcome:
        attempt.financial_outcome as StoreData["attempts"][number]["financialOutcome"],
      receiptEvidence:
        attempt.receipt_evidence as StoreData["attempts"][number]["receiptEvidence"],
      blockedReason: attempt.blocked_reason as string | null,
      chargeReference: attempt.charge_reference as string | null,
      paymentIdentifier: attempt.payment_identifier as string,
      createdAt: attempt.created_at as string,
      updatedAt: attempt.updated_at as string,
    })),
    auditEntries: auditEntries.map((entry) => ({
      id: entry.id as string,
      mandateId: entry.mandate_id as string,
      attemptId: entry.attempt_id as string | null,
      type: entry.type as StoreData["auditEntries"][number]["type"],
      message: entry.message as string,
      createdAt: entry.created_at as string,
    })),
    domainEvents: domainEvents.map((event) => ({
      id: event.id as string,
      entityType:
        event.entity_type as StoreData["domainEvents"][number]["entityType"],
      entityId: event.entity_id as string,
      eventType: event.event_type as string,
      correlationId: event.correlation_id as string | null,
      occurredAt: event.occurred_at as string,
      metadata: JSON.parse((event.metadata_json as string) ?? "{}") as Record<
        string,
        string | number | boolean | null
      >,
    })),
  };
}

export async function writeStore(data: StoreData) {
  if (getPersistenceMode() === "postgres") {
    return writeStorePostgres(data);
  }

  writeStoreSync(data);
}

export async function resetStoreForTests(
  data: StoreData = createSeedStoreData(),
) {
  if (getPersistenceMode() === "postgres") {
    await writeStorePostgres(data);
    return;
  }

  writeStoreSync(data);
}

export async function withStoreLock<T>(work: (data: StoreData) => Promise<T>) {
  if (getPersistenceMode() === "postgres") {
    return withPostgresStoreLock(work);
  }

  const previous = lock;
  let release!: () => void;
  lock = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    const data = await readStore();
    const result = await work(data);
    writeStoreSync(data);
    return result;
  } finally {
    release();
  }
}

export async function resetPersistenceForTests() {
  await resetPostgresStoreForTests();
  database = null;
}
