ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "onchain_address" text;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "wallet_provider" text;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "provider_wallet_id" text;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "chain_id" integer;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "created_by_operator_id" text;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "verified_at" text;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "rotated_at" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agents_wallet_provider_check'
  ) THEN
    ALTER TABLE "agents"
      ADD CONSTRAINT "agents_wallet_provider_check"
      CHECK (
        "wallet_provider" IS NULL
        OR "wallet_provider" IN ('privy', 'external', 'managed')
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agents_onchain_address_format_check'
  ) THEN
    ALTER TABLE "agents"
      ADD CONSTRAINT "agents_onchain_address_format_check"
      CHECK (
        "onchain_address" IS NULL
        OR "onchain_address" ~ '^0x[0-9a-fA-F]{40}$'
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agents_chain_id_positive_check'
  ) THEN
    ALTER TABLE "agents"
      ADD CONSTRAINT "agents_chain_id_positive_check"
      CHECK ("chain_id" IS NULL OR "chain_id" > 0);
  END IF;
END
$$;
