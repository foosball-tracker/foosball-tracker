-- Migration: Fix NULL comparison + add team management RPCs
-- Addresses Codex review comments on PR #55:
--   P1: NULL player ownership bypass in delete_player_with_linked_team
--   P2: createTeam/deleteTeam broken by tightened team_members RLS
-- See: https://github.com/foosball-tracker/foosball-tracker/issues/35

-- =====================================================
-- 1. FIX NULL comparison in delete_player_with_linked_team
--    In PL/pgSQL, "target_player_id != v_player_id" when
--    v_player_id IS NULL evaluates to NULL (not TRUE), so
--    the IF condition silently passes. Use IS DISTINCT FROM.
-- =====================================================

CREATE OR REPLACE FUNCTION public.delete_player_with_linked_team(target_player_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_player_id bigint;
BEGIN
  v_player_id := public.current_player_id();

  IF NOT public.is_admin() AND target_player_id IS DISTINCT FROM v_player_id THEN
    RAISE EXCEPTION 'You can only delete your own player';
  END IF;

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
-- 2. CREATE team-with-members RPC
--    createTeam() in the frontend directly inserted
--    team_members rows, which is blocked by the new
--    "only own player_id" RLS. Route through this
--    SECURITY DEFINER RPC instead.
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_team_with_members(
  p_name text,
  p_player_ids bigint[]
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_team_id bigint;
BEGIN
  INSERT INTO public.teams (name, type)
  VALUES (p_name, 'team')
  RETURNING id INTO v_team_id;

  IF coalesce(array_length(p_player_ids, 1), 0) > 0 THEN
    INSERT INTO public.team_members (player_id, team_id)
    SELECT player_id, v_team_id
    FROM unnest(p_player_ids) AS player_id;
  END IF;

  RETURN v_team_id;
END;
$$;

-- =====================================================
-- 3. HARDEN update_team_with_members: block active-match edits
--    The RPC is SECURITY DEFINER so it bypasses the
--    team_members INSERT policy. Even with auth checks,
--    a team member could add/remove players during an
--    active match, which would bypass is_match_participant().
-- =====================================================

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
DECLARE
  v_player_id bigint;
BEGIN
  v_player_id := public.current_player_id();

  IF NOT public.is_admin() AND (
    v_player_id IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = target_team_id AND player_id = v_player_id
    )
  ) THEN
    RAISE EXCEPTION 'You must be a member of team % to edit it', target_team_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.matches
    WHERE (home_team_id = target_team_id OR away_team_id = target_team_id)
      AND in_progress = true
  ) THEN
    RAISE EXCEPTION 'Cannot modify team % while it is in an active match', target_team_id;
  END IF;

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

-- =====================================================
-- 4. DELETE team RPC (with active-match guard)
--    deleteTeam() in the frontend directly deleted
--    team_members rows, which is now blocked by the
--    tightened RLS. Route through this SECURITY DEFINER
--    RPC with member/admin authorization.
-- =====================================================

CREATE OR REPLACE FUNCTION public.delete_team(target_team_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_player_id bigint;
BEGIN
  v_player_id := public.current_player_id();

  IF NOT public.is_admin() AND (
    v_player_id IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = target_team_id AND player_id = v_player_id
    )
  ) THEN
    RAISE EXCEPTION 'You must be a member of team % to delete it', target_team_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.matches
    WHERE (home_team_id = target_team_id OR away_team_id = target_team_id)
      AND in_progress = true
  ) THEN
    RAISE EXCEPTION 'Cannot delete team % while it is in an active match', target_team_id;
  END IF;

  DELETE FROM public.team_members WHERE team_id = target_team_id;
  DELETE FROM public.teams WHERE id = target_team_id AND type = 'team';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team % not found or is not a custom team', target_team_id;
  END IF;
END;
$$;
