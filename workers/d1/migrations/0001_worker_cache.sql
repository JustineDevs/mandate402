CREATE TABLE IF NOT EXISTS worker_control_events (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  correlation_id TEXT,
  worker_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_worker_control_events_created_at
  ON worker_control_events (created_at);

CREATE TABLE IF NOT EXISTS worker_policy_snapshots (
  mandate_id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  policy_json TEXT NOT NULL,
  source_version TEXT NOT NULL,
  refreshed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_worker_policy_snapshots_agent_id
  ON worker_policy_snapshots (agent_id);

CREATE TABLE IF NOT EXISTS cached_mandates (
  mandate_id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL,
  budget_cap_cents INTEGER NOT NULL,
  reserved_cents INTEGER NOT NULL,
  consumed_cents INTEGER NOT NULL,
  source_version TEXT NOT NULL,
  refreshed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cached_mandates_agent_id
  ON cached_mandates (agent_id);

CREATE TABLE IF NOT EXISTS cached_attempts (
  attempt_id TEXT PRIMARY KEY,
  mandate_id TEXT NOT NULL,
  payment_identifier TEXT NOT NULL,
  status TEXT NOT NULL,
  financial_outcome TEXT NOT NULL,
  correlation_id TEXT,
  source_version TEXT NOT NULL,
  refreshed_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cached_attempts_payment_identifier
  ON cached_attempts (payment_identifier);

CREATE INDEX IF NOT EXISTS idx_cached_attempts_mandate_id
  ON cached_attempts (mandate_id);

CREATE TABLE IF NOT EXISTS cached_domain_events (
  event_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  correlation_id TEXT,
  source_version TEXT NOT NULL,
  occurred_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cached_domain_events_entity
  ON cached_domain_events (entity_type, entity_id);
