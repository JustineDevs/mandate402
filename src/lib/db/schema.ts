import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const mandates = pgTable("mandates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  agentId: text("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "restrict" }),
  agentName: text("agent_name").notNull(),
  status: text("status").notNull(),
  budgetCapCents: integer("budget_cap_cents").notNull(),
  reservedCents: integer("reserved_cents").notNull(),
  consumedCents: integer("consumed_cents").notNull(),
  requiresReceiptCapability: boolean("requires_receipt_capability").notNull(),
  morphIssueTxId: text("morph_issue_tx_id").notNull(),
  morphRevokeTxId: text("morph_revoke_tx_id"),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const mandateApprovedVendors = pgTable(
  "mandate_approved_vendors",
  {
    mandateId: text("mandate_id")
      .notNull()
      .references(() => mandates.id, { onDelete: "cascade" }),
    vendorId: text("vendor_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.mandateId, table.vendorId] }),
  }),
);

export const attempts = pgTable("attempts", {
  id: text("id").primaryKey(),
  mandateId: text("mandate_id")
    .notNull()
    .references(() => mandates.id, { onDelete: "cascade" }),
  vendorId: text("vendor_id").notNull(),
  amountCents: integer("amount_cents").notNull(),
  operatorId: text("operator_id").notNull(),
  status: text("status").notNull(),
  financialOutcome: text("financial_outcome").notNull(),
  receiptEvidence: text("receipt_evidence").notNull(),
  blockedReason: text("blocked_reason"),
  chargeReference: text("charge_reference"),
  paymentIdentifier: text("payment_identifier").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const workerTasks = pgTable("worker_tasks", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  mandateId: text("mandate_id")
    .notNull()
    .references(() => mandates.id, { onDelete: "cascade" }),
  operatorId: text("operator_id"),
  correlationId: text("correlation_id"),
  leaseOwner: text("lease_owner"),
  leaseExpiresAt: text("lease_expires_at"),
  availableAt: text("available_at").notNull(),
  status: text("status").notNull(),
  attemptCount: integer("attempt_count").notNull(),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
});

export const auditEntries = pgTable("audit_entries", {
  id: text("id").primaryKey(),
  mandateId: text("mandate_id")
    .notNull()
    .references(() => mandates.id, { onDelete: "cascade" }),
  attemptId: text("attempt_id"),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

export const domainEvents = pgTable("domain_events", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  eventType: text("event_type").notNull(),
  correlationId: text("correlation_id"),
  occurredAt: text("occurred_at").notNull(),
  metadataJson: text("metadata_json").notNull(),
});
