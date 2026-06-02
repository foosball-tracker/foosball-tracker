-- Migration: Auth-to-player schema and profiles model cleanup
-- Goal: players as canonical game identity linked to auth.users,
-- profiles as account metadata only, with trigger creating both.
-- See: https://github.com/foosball-tracker/foosball-tracker/issues/53
--
-- Identity model:
--   auth.users  — Supabase Auth (source of truth for email)
--   profiles     — account metadata (is_admin)
--   players      — gameplay identity (name, user_id link to auth)

-- =====================================================
-- 1. ADD players.user_id
-- =====================================================

ALTER TABLE public.players
  ADD COLUMN user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.players.user_id IS
  'Links a gameplay player to an auth account. NULL for guest/anonymous players.';

-- =====================================================
-- 2. CLEAN UP profiles
-- =====================================================

DELETE FROM public.profiles WHERE user_id IS NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS first_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS last_name;

ALTER TABLE public.profiles ADD PRIMARY KEY (user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

COMMENT ON TABLE public.profiles IS 'Account metadata for authenticated users. One row per auth user.';

-- =====================================================
-- 3. UPDATE AUTH TRIGGER
-- Replace the trigger function to create both a profile
-- and a player for every new auth user.
-- =====================================================

CREATE OR REPLACE FUNCTION public.insert_profile_on_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  player_name text;
BEGIN
  INSERT INTO public.profiles (user_id, is_admin)
  VALUES (NEW.id, false);

  player_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );

  INSERT INTO public.players (name, user_id)
  VALUES (player_name, NEW.id);

  RETURN NEW;
END;
$$;

-- =====================================================
-- 4. current_player_id() HELPER
-- Resolves auth.uid() → players.id for RLS policies.
-- Returns NULL if the authenticated user has no linked player.
-- =====================================================

CREATE OR REPLACE FUNCTION public.current_player_id()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO ''
AS $$
DECLARE
  v_player_id bigint;
BEGIN
  SELECT id INTO v_player_id
  FROM public.players
  WHERE user_id = auth.uid()
  LIMIT 1;
  RETURN v_player_id;
END;
$$;

COMMENT ON FUNCTION public.current_player_id IS
  'Returns the player id for the current authenticated user, or NULL if not linked. Use in RLS policies to identify match participants.';

GRANT EXECUTE ON FUNCTION public.current_player_id() TO authenticated, anon;

-- =====================================================
-- 5. UPDATE RLS POLICIES
-- =====================================================

-- 5a. Players: replace wide-open policy with scoped policies.
--     Authenticated users can view and create players (needed for
--     match setup, player lists, leaderboard, guest players).
--     Only the linked user or admin can modify their own player row.
DROP POLICY IF EXISTS "Enables full access for authenticated Users" ON public.players;

CREATE POLICY "Authenticated users can view all players" ON public.players
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create players" ON public.players
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own player" ON public.players
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR user_id = (SELECT auth.uid()))
  WITH CHECK (public.is_admin() OR user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own player" ON public.players
  FOR DELETE TO authenticated
  USING (public.is_admin() OR user_id = (SELECT auth.uid()));

-- 5b. Profiles: add SELECT and UPDATE policies.
--     INSERT is handled by the SECURITY DEFINER trigger.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admin can manage all profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- NOTES: Match, goal, and match_event policies remain as-is
-- for now (authenticated users can track active matches).
-- The new players.user_id column and current_player_id() RPC
-- enable future participant-aware tightening.
-- =====================================================
