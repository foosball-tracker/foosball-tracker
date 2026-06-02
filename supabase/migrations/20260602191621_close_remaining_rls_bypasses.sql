-- Migration: Close remaining participant-check bypass vectors
-- Addresses Codex P1 review comments on PR #55:
--   - Prevent self-joins to teams in active matches
--   - Add authorization to update_team_with_members RPC
--   - Add authorization to delete_player_with_linked_team RPC
-- See: https://github.com/foosball-tracker/foosball-tracker/issues/35

-- =====================================================
-- 1. BLOCK self-joins to teams in active matches
--    A user could still INSERT their own player_id into
--    a team that is currently in an active match, then
--    pass is_match_participant(). Prevent that.
-- =====================================================

DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;

CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    player_id = public.current_player_id()
    AND NOT EXISTS (
      SELECT 1 FROM public.matches
      WHERE (home_team_id = team_id OR away_team_id = team_id)
        AND in_progress = true
    )
  );

-- =====================================================
-- 2. AUTHORIZE update_team_with_members RPC
--    Now runs as SECURITY DEFINER but had no permission
--    check — any authenticated caller could replace the
--    members of any custom team. Require team membership
--    or admin.
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
-- 3. AUTHORIZE delete_player_with_linked_team RPC
--    Now runs as SECURITY DEFINER but had no permission
--    check — any caller could delete any player. Require
--    player ownership or admin.
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

  IF NOT public.is_admin() AND target_player_id != v_player_id THEN
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
