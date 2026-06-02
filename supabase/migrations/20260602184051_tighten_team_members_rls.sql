-- Migration: Tighten team_members RLS, backfill player-team links
-- Addresses Codex review comments on PR #55:
--   P1: team_members full-access RLS bypasses participant check
--   P2: trigger doesn't create player-type team on signup
--   P2: no backfill for existing auth users
-- See: https://github.com/foosball-tracker/foosball-tracker/issues/35

-- =====================================================
-- 1. TIGHTEN team_members RLS
--    Close the hole where any authenticated user can
--    insert themselves into an active match's team and
--    then pass is_match_participant().
-- =====================================================

DROP POLICY IF EXISTS "Enables full access for authenticated Users" ON public.team_members;

CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (player_id = public.current_player_id());

CREATE POLICY "Users can leave teams" ON public.team_members
  FOR DELETE TO authenticated
  USING (player_id = public.current_player_id());

CREATE POLICY "Users can view team members" ON public.team_members
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can manage all team memberships" ON public.team_members
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- 2. UPDATE TRIGGER: also create player-type team
--    Auth-created players need a matching team row so
--    they can be used in match setup and satisfy the
--    participant-aware match RLS.
-- =====================================================

CREATE OR REPLACE FUNCTION public.insert_profile_on_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  player_name text;
  v_player_id bigint;
BEGIN
  INSERT INTO public.profiles (user_id, is_admin)
  VALUES (NEW.id, false);

  player_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );

  INSERT INTO public.players (name, user_id)
  VALUES (player_name, NEW.id)
  RETURNING id INTO v_player_id;

  INSERT INTO public.teams (name, type, player_id)
  VALUES (player_name, 'player', v_player_id);

  RETURN NEW;
END;
$$;

-- =====================================================
-- 3. UPDATE team-management RPCs for tightened RLS
--    These run as SECURITY DEFINER so they can manage
--    other users' memberships without being blocked by
--    the new "only own player_id" RLS.
-- =====================================================

-- 3a. update_team_with_members: needs to bypass team_members RLS
CREATE OR REPLACE FUNCTION public.update_team_with_members(
    target_team_id bigint,
    target_name text,
    target_player_ids bigint[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.teams
  SET name = target_name
  WHERE id = target_team_id
    AND type = 'team';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Editable team % not found', target_team_id;
  END IF;

  DELETE FROM public.team_members
  WHERE team_id = target_team_id;

  IF coalesce(array_length(target_player_ids, 1), 0) > 0 THEN
    INSERT INTO public.team_members (player_id, team_id)
    SELECT player_id, target_team_id
    FROM unnest(target_player_ids) AS player_id;
  END IF;
END;
$$;

-- 3b. delete_player_with_linked_team: needs to bypass players RLS
CREATE OR REPLACE FUNCTION public.delete_player_with_linked_team(target_player_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  DELETE FROM public.teams
  WHERE player_id = target_player_id
    AND type = 'player';

  DELETE FROM public.players
  WHERE id = target_player_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player % not found', target_player_id;
  END IF;
END;
$$;

-- =====================================================
-- 4. BACKFILL existing auth users
--    Link auth users who don't yet have a player to a
--    new player row + matching player-type team so they
--    are not locked out of match participation.
-- =====================================================

DO $$
DECLARE
  u RECORD;
  v_player_id bigint;
  v_player_name text;
BEGIN
  FOR u IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (
      SELECT user_id FROM public.players WHERE user_id IS NOT NULL
    )
  LOOP
    v_player_name := COALESCE(u.raw_user_meta_data->>'name', u.email);

    INSERT INTO public.players (name, user_id)
    VALUES (v_player_name, u.id)
    RETURNING id INTO v_player_id;

    INSERT INTO public.teams (name, type, player_id)
    VALUES (v_player_name, 'player', v_player_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;
