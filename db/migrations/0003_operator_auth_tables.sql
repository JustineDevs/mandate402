CREATE TABLE IF NOT EXISTS "operator_profiles" (
  "auth_user_id" uuid PRIMARY KEY,
  "role" text NOT NULL DEFAULT 'operator',
  "status" text NOT NULL DEFAULT 'active',
  "email" text,
  "full_name" text,
  "wallet_address" text,
  "primary_auth_provider" text,
  "last_sign_in_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT timezone('utc', now()),
  "updated_at" timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT "operator_profiles_auth_user_id_auth_users_fk"
    FOREIGN KEY ("auth_user_id") REFERENCES auth.users("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "operator_auth_identities" (
  "id" uuid PRIMARY KEY,
  "operator_id" uuid NOT NULL,
  "provider" text NOT NULL,
  "provider_subject" text NOT NULL,
  "email" text,
  "wallet_address" text,
  "identity_data_json" text NOT NULL,
  "last_sign_in_at" timestamptz,
  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  CONSTRAINT "operator_auth_identities_operator_id_operator_profiles_fk"
    FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("auth_user_id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "operator_auth_identities_provider_subject_idx"
  ON "operator_auth_identities" ("provider", "provider_subject");

ALTER TABLE "operator_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "operator_auth_identities" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "operator_profiles_select_own" ON "operator_profiles";
CREATE POLICY "operator_profiles_select_own"
  ON "operator_profiles"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "operator_profiles_update_own" ON "operator_profiles";
CREATE POLICY "operator_profiles_update_own"
  ON "operator_profiles"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "operator_auth_identities_select_own" ON "operator_auth_identities";
CREATE POLICY "operator_auth_identities_select_own"
  ON "operator_auth_identities"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = operator_id);

CREATE OR REPLACE FUNCTION public.sync_operator_profile_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.operator_profiles (
    auth_user_id,
    role,
    status,
    email,
    full_name,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    CASE
      WHEN NEW.raw_app_meta_data ->> 'role' IN ('operator', 'platform_admin')
        THEN NEW.raw_app_meta_data ->> 'role'
      ELSE 'operator'
    END,
    COALESCE(NULLIF(NEW.raw_app_meta_data ->> 'status', ''), 'active'),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.last_sign_in_at,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET role = EXCLUDED.role,
      status = EXCLUDED.status,
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      last_sign_in_at = EXCLUDED.last_sign_in_at,
      updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_operator_identity_from_auth_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  resolved_wallet text;
BEGIN
  resolved_wallet := COALESCE(
    NULLIF(NEW.identity_data ->> 'wallet_address', ''),
    NULLIF(NEW.identity_data ->> 'address', ''),
    CASE
      WHEN NEW.provider IN ('ethereum', 'solana', 'web3')
        THEN NULLIF(NEW.provider_id, '')
      ELSE NULL
    END
  );

  INSERT INTO public.operator_auth_identities (
    id,
    operator_id,
    provider,
    provider_subject,
    email,
    wallet_address,
    identity_data_json,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.user_id,
    NEW.provider,
    NEW.provider_id,
    NEW.email,
    resolved_wallet,
    NEW.identity_data::text,
    NEW.last_sign_in_at,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE
  SET provider = EXCLUDED.provider,
      provider_subject = EXCLUDED.provider_subject,
      email = EXCLUDED.email,
      wallet_address = EXCLUDED.wallet_address,
      identity_data_json = EXCLUDED.identity_data_json,
      last_sign_in_at = EXCLUDED.last_sign_in_at,
      updated_at = EXCLUDED.updated_at;

  UPDATE public.operator_profiles
  SET primary_auth_provider = NEW.provider,
      wallet_address = COALESCE(resolved_wallet, wallet_address),
      updated_at = GREATEST(updated_at, NEW.updated_at)
  WHERE auth_user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_operator_identity_from_auth_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  DELETE FROM public.operator_auth_identities
  WHERE id = OLD.id;

  UPDATE public.operator_profiles
  SET primary_auth_provider = identities.provider,
      wallet_address = identities.wallet_address,
      updated_at = timezone('utc', now())
  FROM (
    SELECT provider, wallet_address
    FROM public.operator_auth_identities
    WHERE operator_id = OLD.user_id
    ORDER BY last_sign_in_at DESC NULLS LAST, updated_at DESC
    LIMIT 1
  ) AS identities
  WHERE auth_user_id = OLD.user_id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_synced_to_operator_profile ON auth.users;
CREATE TRIGGER on_auth_user_synced_to_operator_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_operator_profile_from_auth_user();

DROP TRIGGER IF EXISTS on_auth_identity_synced_to_operator_identities ON auth.identities;
CREATE TRIGGER on_auth_identity_synced_to_operator_identities
  AFTER INSERT OR UPDATE ON auth.identities
  FOR EACH ROW EXECUTE FUNCTION public.sync_operator_identity_from_auth_identity();

DROP TRIGGER IF EXISTS on_auth_identity_deleted_from_operator_identities ON auth.identities;
CREATE TRIGGER on_auth_identity_deleted_from_operator_identities
  AFTER DELETE ON auth.identities
  FOR EACH ROW EXECUTE FUNCTION public.delete_operator_identity_from_auth_identity();

INSERT INTO public.operator_profiles (
  auth_user_id,
  role,
  status,
  email,
  full_name,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  users.id,
  CASE
    WHEN users.raw_app_meta_data ->> 'role' IN ('operator', 'platform_admin')
      THEN users.raw_app_meta_data ->> 'role'
    ELSE 'operator'
  END,
  COALESCE(NULLIF(users.raw_app_meta_data ->> 'status', ''), 'active'),
  users.email,
  NULLIF(users.raw_user_meta_data ->> 'full_name', ''),
  users.last_sign_in_at,
  users.created_at,
  users.updated_at
FROM auth.users AS users
ON CONFLICT (auth_user_id) DO UPDATE
SET role = EXCLUDED.role,
    status = EXCLUDED.status,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.operator_auth_identities (
  id,
  operator_id,
  provider,
  provider_subject,
  email,
  wallet_address,
  identity_data_json,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  identities.id,
  identities.user_id,
  identities.provider,
  identities.provider_id,
  identities.email,
  COALESCE(
    NULLIF(identities.identity_data ->> 'wallet_address', ''),
    NULLIF(identities.identity_data ->> 'address', ''),
    CASE
      WHEN identities.provider IN ('ethereum', 'solana', 'web3')
        THEN NULLIF(identities.provider_id, '')
      ELSE NULL
    END
  ),
  identities.identity_data::text,
  identities.last_sign_in_at,
  identities.created_at,
  identities.updated_at
FROM auth.identities AS identities
ON CONFLICT (id) DO UPDATE
SET provider = EXCLUDED.provider,
    provider_subject = EXCLUDED.provider_subject,
    email = EXCLUDED.email,
    wallet_address = EXCLUDED.wallet_address,
    identity_data_json = EXCLUDED.identity_data_json,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = EXCLUDED.updated_at;
