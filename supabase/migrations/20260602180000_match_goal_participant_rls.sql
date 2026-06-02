-- Migration: Participant-aware match/goal/event RLS
-- Tightens policies so only participants + admins can mutate
-- matches, goals, and match_events.
-- Depends on players.user_id and current_player_id() from
-- 20260602151255_auth_player_profiles_cleanup.sql.
-- See: https://github.com/foosball-tracker/foosball-tracker/issues/35

-- =====================================================
-- 1. is_match_participant() HELPER
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_match_participant(p_match_id bigint)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO ''
AS $$
DECLARE
  v_player_id bigint;
  v_home_team_id bigint;
  v_away_team_id bigint;
BEGIN
  v_player_id := public.current_player_id();
  IF v_player_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT home_team_id, away_team_id INTO v_home_team_id, v_away_team_id
  FROM public.matches
  WHERE id = p_match_id;

  IF v_home_team_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = v_home_team_id AND player_id = v_player_id
    ) THEN
      RETURN true;
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = v_home_team_id AND player_id = v_player_id
    ) THEN
      RETURN true;
    END IF;
  END IF;

  IF v_away_team_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = v_away_team_id AND player_id = v_player_id
    ) THEN
      RETURN true;
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = v_away_team_id AND player_id = v_player_id
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

COMMENT ON FUNCTION public.is_match_participant IS
  'Returns true if the current authenticated user is linked to a player on either team of the given match. Used in RLS policies for participant-aware access control.';

GRANT EXECUTE ON FUNCTION public.is_match_participant TO authenticated, anon;

-- =====================================================
-- 2. MATCHES — participant-aware mutations
-- =====================================================

-- 2a. INSERT: creator must be on one of the teams (or admin)
DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.matches;
CREATE POLICY "Participants can create matches" ON public.matches
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (
      public.current_player_id() IS NOT NULL
      AND (
        EXISTS (SELECT 1 FROM public.teams WHERE id = home_team_id AND player_id = public.current_player_id())
        OR EXISTS (SELECT 1 FROM public.team_members WHERE team_id = home_team_id AND player_id = public.current_player_id())
        OR EXISTS (SELECT 1 FROM public.teams WHERE id = away_team_id AND player_id = public.current_player_id())
        OR EXISTS (SELECT 1 FROM public.team_members WHERE team_id = away_team_id AND player_id = public.current_player_id())
      )
    )
  );

-- 2b. UPDATE: only participants (+ admins) can finish active matches
DROP POLICY IF EXISTS "Authenticated users can finish active matches" ON public.matches;
CREATE POLICY "Participants can finish active matches" ON public.matches
  FOR UPDATE TO authenticated
  USING (in_progress = true AND (public.is_admin() OR public.is_match_participant(id)))
  WITH CHECK (in_progress = false);

-- 2c. DELETE: only participants (+ admins) can abandon active matches
DROP POLICY IF EXISTS "Authenticated users can abandon active matches" ON public.matches;
CREATE POLICY "Participants can abandon active matches" ON public.matches
  FOR DELETE TO authenticated
  USING (in_progress = true AND (public.is_admin() OR public.is_match_participant(id)));

-- =====================================================
-- 3. GOALS — participant-aware mutations
-- =====================================================

-- 3a. INSERT: participants (+ admins) can record goals for active matches
DROP POLICY IF EXISTS "Authenticated users can record goals for active matches" ON public.goals;
CREATE POLICY "Participants can record goals for active matches" ON public.goals
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = goals.match_id
        AND matches.in_progress = true
    )
    AND (public.is_admin() OR public.is_match_participant(goals.match_id))
  );

-- 3b. DELETE: participants (+ admins) can remove goals from active matches
DROP POLICY IF EXISTS "Authenticated users can remove goals from active matches" ON public.goals;
CREATE POLICY "Participants can remove goals from active matches" ON public.goals
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = goals.match_id
        AND matches.in_progress = true
    )
    AND (public.is_admin() OR public.is_match_participant(goals.match_id))
  );

-- =====================================================
-- 4. MATCH EVENTS — participant-aware mutations
-- =====================================================

-- 4a. INSERT: participants (+ admins) can record events for active matches
DROP POLICY IF EXISTS "Authenticated users can record events for active matches" ON public.match_events;
CREATE POLICY "Participants can record events for active matches" ON public.match_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_events.match_id
        AND matches.in_progress = true
    )
    AND (public.is_admin() OR public.is_match_participant(match_events.match_id))
  );

-- 4b. UPDATE: participants (+ admins) can update events for active matches
DROP POLICY IF EXISTS "Authenticated users can update events for active matches" ON public.match_events;
CREATE POLICY "Participants can update events for active matches" ON public.match_events
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_events.match_id
        AND matches.in_progress = true
    )
    AND (public.is_admin() OR public.is_match_participant(match_events.match_id))
  );

-- 4c. DELETE: participants (+ admins) can delete events from active matches
CREATE POLICY "Participants can delete events from active matches" ON public.match_events
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_events.match_id
        AND matches.in_progress = true
    )
    AND (public.is_admin() OR public.is_match_participant(match_events.match_id))
  );
