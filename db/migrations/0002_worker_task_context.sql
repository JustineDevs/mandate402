ALTER TABLE worker_tasks
  ADD COLUMN IF NOT EXISTS operator_id TEXT;

ALTER TABLE worker_tasks
  ADD COLUMN IF NOT EXISTS correlation_id TEXT;
