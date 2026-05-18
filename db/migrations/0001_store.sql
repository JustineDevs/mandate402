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
  requires_receipt_capability BOOLEAN NOT NULL,
  morph_issue_tx_id TEXT NOT NULL,
  morph_revoke_tx_id TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE RESTRICT
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
