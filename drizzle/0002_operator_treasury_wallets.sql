ALTER TABLE "operator_profiles"
  ADD COLUMN IF NOT EXISTS "onboarding_state" text NOT NULL DEFAULT 'needs_treasury_connection';

ALTER TABLE "operator_profiles"
  ADD COLUMN IF NOT EXISTS "preferred_treasury_mode" text;

ALTER TABLE "operator_profiles"
  ADD COLUMN IF NOT EXISTS "preferred_wallet_provider" text;

CREATE TABLE IF NOT EXISTS "operator_treasury_wallet_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "operator_id" uuid NOT NULL,
  "provider" text NOT NULL,
  "mode" text NOT NULL,
  "label" text,
  "address" text NOT NULL,
  "chain_namespace" text NOT NULL DEFAULT 'eip155',
  "chain_id" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'verified',
  "verification_source" text NOT NULL DEFAULT 'manual',
  "is_primary" boolean NOT NULL DEFAULT true,
  "last_verified_at" timestamptz,
  "last_seen_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT timezone('utc', now()),
  "updated_at" timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT "operator_treasury_wallet_accounts_operator_id_operator_profiles_fk"
    FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("auth_user_id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "operator_treasury_wallet_accounts_operator_wallet_idx"
  ON "operator_treasury_wallet_accounts" (
    "operator_id",
    "provider",
    "address",
    "chain_namespace",
    "chain_id"
  );

ALTER TABLE "operator_treasury_wallet_accounts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "operator_treasury_wallet_accounts_select_own" ON "operator_treasury_wallet_accounts";
CREATE POLICY "operator_treasury_wallet_accounts_select_own"
  ON "operator_treasury_wallet_accounts"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = operator_id);

DROP POLICY IF EXISTS "operator_treasury_wallet_accounts_insert_own" ON "operator_treasury_wallet_accounts";
CREATE POLICY "operator_treasury_wallet_accounts_insert_own"
  ON "operator_treasury_wallet_accounts"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = operator_id);

DROP POLICY IF EXISTS "operator_treasury_wallet_accounts_update_own" ON "operator_treasury_wallet_accounts";
CREATE POLICY "operator_treasury_wallet_accounts_update_own"
  ON "operator_treasury_wallet_accounts"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = operator_id)
  WITH CHECK (auth.uid() = operator_id);

INSERT INTO "operator_treasury_wallet_accounts" (
  "operator_id",
  "provider",
  "mode",
  "label",
  "address",
  "chain_namespace",
  "chain_id",
  "status",
  "verification_source",
  "is_primary",
  "last_verified_at",
  "last_seen_at",
  "created_at",
  "updated_at"
)
SELECT
  "auth_user_id",
  COALESCE("preferred_wallet_provider", 'external'),
  COALESCE("preferred_treasury_mode", 'external_fusion'),
  'Primary treasury lane',
  "wallet_address",
  'eip155',
  2818,
  'verified',
  'manual',
  true,
  timezone('utc', now()),
  timezone('utc', now()),
  timezone('utc', now()),
  timezone('utc', now())
FROM "operator_profiles"
WHERE "wallet_address" IS NOT NULL
ON CONFLICT (
  "operator_id",
  "provider",
  "address",
  "chain_namespace",
  "chain_id"
) DO NOTHING;

UPDATE "operator_profiles"
SET "onboarding_state" =
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM "operator_treasury_wallet_accounts" AS accounts
      WHERE accounts."operator_id" = "operator_profiles"."auth_user_id"
    )
      THEN 'complete'
    ELSE 'needs_treasury_connection'
  END
WHERE "onboarding_state" <> 'complete';
