-- Migration: Prevent users from self-granting admin
-- The profiles UPDATE policy allowed any user to set is_admin = true
-- on their own row, bypassing all admin-only RLS guards.
-- See: https://github.com/foosball-tracker/foosball-tracker/issues/35

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()) AND is_admin = false);
