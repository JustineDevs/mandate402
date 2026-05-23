CREATE TABLE IF NOT EXISTS "agents" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "status" text NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "mandates" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "agent_id" text NOT NULL,
  "agent_name" text NOT NULL,
  "status" text NOT NULL,
  "budget_cap_cents" integer NOT NULL,
  "reserved_cents" integer NOT NULL,
  "consumed_cents" integer NOT NULL,
  "requires_receipt_capability" boolean NOT NULL,
  "morph_issue_tx_id" text NOT NULL,
  "morph_revoke_tx_id" text,
  "expires_at" text NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "mandate_approved_vendors" (
  "mandate_id" text NOT NULL,
  "vendor_id" text NOT NULL,
  PRIMARY KEY("mandate_id", "vendor_id")
);

CREATE TABLE IF NOT EXISTS "attempts" (
  "id" text PRIMARY KEY NOT NULL,
  "mandate_id" text NOT NULL,
  "vendor_id" text NOT NULL,
  "amount_cents" integer NOT NULL,
  "operator_id" text NOT NULL,
  "status" text NOT NULL,
  "financial_outcome" text NOT NULL,
  "receipt_evidence" text NOT NULL,
  "blocked_reason" text,
  "charge_reference" text,
  "payment_identifier" text NOT NULL UNIQUE,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "worker_tasks" (
  "id" text PRIMARY KEY NOT NULL,
  "kind" text NOT NULL,
  "attempt_id" text NOT NULL,
  "mandate_id" text NOT NULL,
  "operator_id" text,
  "correlation_id" text,
  "lease_owner" text,
  "lease_expires_at" text,
  "available_at" text NOT NULL,
  "status" text NOT NULL,
  "attempt_count" integer NOT NULL,
  "last_error" text,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  "started_at" text,
  "completed_at" text
);

CREATE TABLE IF NOT EXISTS "audit_entries" (
  "id" text PRIMARY KEY NOT NULL,
  "mandate_id" text NOT NULL,
  "attempt_id" text,
  "type" text NOT NULL,
  "message" text NOT NULL,
  "created_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "domain_events" (
  "id" text PRIMARY KEY NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL,
  "event_type" text NOT NULL,
  "correlation_id" text,
  "occurred_at" text NOT NULL,
  "metadata_json" text NOT NULL
);

ALTER TABLE "mandates"
  ADD CONSTRAINT "mandates_agent_id_agents_id_fk"
  FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT;

ALTER TABLE "mandate_approved_vendors"
  ADD CONSTRAINT "mandate_approved_vendors_mandate_id_mandates_id_fk"
  FOREIGN KEY ("mandate_id") REFERENCES "mandates"("id") ON DELETE CASCADE;

ALTER TABLE "attempts"
  ADD CONSTRAINT "attempts_mandate_id_mandates_id_fk"
  FOREIGN KEY ("mandate_id") REFERENCES "mandates"("id") ON DELETE CASCADE;

ALTER TABLE "worker_tasks"
  ADD CONSTRAINT "worker_tasks_attempt_id_attempts_id_fk"
  FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE CASCADE;

ALTER TABLE "worker_tasks"
  ADD CONSTRAINT "worker_tasks_mandate_id_mandates_id_fk"
  FOREIGN KEY ("mandate_id") REFERENCES "mandates"("id") ON DELETE CASCADE;

ALTER TABLE "audit_entries"
  ADD CONSTRAINT "audit_entries_mandate_id_mandates_id_fk"
  FOREIGN KEY ("mandate_id") REFERENCES "mandates"("id") ON DELETE CASCADE;
