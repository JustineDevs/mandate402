ALTER TABLE "operator_treasury_wallet_accounts"
  ADD COLUMN IF NOT EXISTS "provider_user_id" text;

ALTER TABLE "operator_treasury_wallet_accounts"
  ADD COLUMN IF NOT EXISTS "provider_wallet_id" text;

ALTER TABLE "operator_treasury_wallet_accounts"
  ADD COLUMN IF NOT EXISTS "wallet_client_type" text;

ALTER TABLE "operator_treasury_wallet_accounts"
  ADD COLUMN IF NOT EXISTS "orchestrator_address" text;

ALTER TABLE "operator_treasury_wallet_accounts"
  ADD COLUMN IF NOT EXISTS "orchestrator_kind" text;

ALTER TABLE "operator_treasury_wallet_accounts"
  ADD COLUMN IF NOT EXISTS "delegation_contract_address" text;

ALTER TABLE "operator_treasury_wallet_accounts"
  ADD COLUMN IF NOT EXISTS "last_sync_error" text;

UPDATE "operator_treasury_wallet_accounts"
SET "orchestrator_address" = "address"
WHERE "orchestrator_address" IS NULL;

UPDATE "operator_treasury_wallet_accounts"
SET "orchestrator_kind" =
  CASE
    WHEN "provider" = 'privy' THEN 'biconomy_nexus_7702'
    WHEN "provider" = 'external' THEN 'browser_wallet'
    ELSE 'managed_signer'
  END
WHERE "orchestrator_kind" IS NULL;
