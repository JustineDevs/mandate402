DROP POLICY IF EXISTS "operator_profiles_insert_own" ON "operator_profiles";
CREATE POLICY "operator_profiles_insert_own"
  ON "operator_profiles"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);
