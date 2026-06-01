-- =====================================================
-- 1. record_goal_event
-- Atomically insert a goal_detected event.
-- Validates match is active. Returns existing event id
-- if dedupe_key is provided and already exists.
-- =====================================================

CREATE OR REPLACE FUNCTION public.record_goal_event(
  p_match_id bigint,
  p_team_id bigint,
  p_source match_event_source,
  p_source_id text DEFAULT NULL,
  p_dedupe_key text DEFAULT NULL,
  p_goal_time interval DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL,
  p_player_id bigint DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  v_match_in_progress boolean;
  v_event_id bigint;
BEGIN
  SELECT in_progress INTO v_match_in_progress
  FROM public.matches
  WHERE id = p_match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % not found', p_match_id;
  END IF;

  IF NOT v_match_in_progress THEN
    RAISE EXCEPTION 'Match % is not in progress', p_match_id;
  END IF;

  IF p_dedupe_key IS NOT NULL THEN
    SELECT id INTO v_event_id
    FROM public.match_events
    WHERE dedupe_key = p_dedupe_key;
    IF FOUND THEN
      RETURN v_event_id;
    END IF;
  END IF;

  INSERT INTO public.match_events (
    match_id, type, team_id, player_id, source, source_id,
    dedupe_key, status, goal_time, metadata
  ) VALUES (
    p_match_id, 'goal_detected', p_team_id, p_player_id, p_source, p_source_id,
    p_dedupe_key, 'valid', p_goal_time, p_metadata
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION public.record_goal_event IS
  'Atomically record a goal_detected event. Validates the match is active. Returns the existing event id when the dedupe_key is already present (idempotent).';

-- =====================================================
-- 2. invalidate_goal_event
-- Mark a goal_detected event as invalid and create a
-- manual_correction event pointing back to it.
-- =====================================================

CREATE OR REPLACE FUNCTION public.invalidate_goal_event(
  p_event_id bigint,
  p_reason text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  v_event public.match_events%ROWTYPE;
  v_match_in_progress boolean;
  v_correction_id bigint;
BEGIN
  SELECT * INTO v_event
  FROM public.match_events
  WHERE id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event % not found', p_event_id;
  END IF;

  IF v_event.type != 'goal_detected' THEN
    RAISE EXCEPTION 'Event % is not a goal_detected event', p_event_id;
  END IF;

  IF v_event.status != 'valid' THEN
    RAISE EXCEPTION 'Event % is already %', p_event_id, v_event.status;
  END IF;

  SELECT in_progress INTO v_match_in_progress
  FROM public.matches
  WHERE id = v_event.match_id;

  IF NOT v_match_in_progress THEN
    RAISE EXCEPTION 'Match % is not in progress', v_event.match_id;
  END IF;

  UPDATE public.match_events
  SET status = 'invalid'
  WHERE id = p_event_id;

  INSERT INTO public.match_events (
    match_id, type, team_id, player_id, source, source_id,
    status, goal_time, related_event_id, metadata
  ) VALUES (
    v_event.match_id, 'manual_correction', v_event.team_id, v_event.player_id,
    'web', auth.uid()::text, 'valid', v_event.goal_time, p_event_id,
    jsonb_build_object('reason', p_reason, 'action', 'invalidated goal event')
  )
  RETURNING id INTO v_correction_id;

  RETURN v_correction_id;
END;
$$;

COMMENT ON FUNCTION public.invalidate_goal_event IS
  'Mark a goal_detected event as invalid and insert a corresponding manual_correction event. Returns the correction event id.';

-- =====================================================
-- 3. reset_match_score
-- Mark all valid goal_detected events for the match as
-- removed and insert a score_reset event.
-- =====================================================

CREATE OR REPLACE FUNCTION public.reset_match_score(
  p_match_id bigint,
  p_reason text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  v_match_in_progress boolean;
  v_reset_event_id bigint;
  v_home_team_id bigint;
BEGIN
  SELECT in_progress, home_team_id INTO v_match_in_progress, v_home_team_id
  FROM public.matches
  WHERE id = p_match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % not found', p_match_id;
  END IF;

  IF NOT v_match_in_progress THEN
    RAISE EXCEPTION 'Match % is not in progress', p_match_id;
  END IF;

  UPDATE public.match_events
  SET status = 'removed'
  WHERE match_id = p_match_id
    AND type = 'goal_detected'
    AND status = 'valid';

  INSERT INTO public.match_events (
    match_id, type, team_id, source, source_id, status, metadata
  ) VALUES (
    p_match_id, 'score_reset', v_home_team_id,
    'web', auth.uid()::text, 'valid',
    jsonb_build_object('reason', p_reason)
  )
  RETURNING id INTO v_reset_event_id;

  RETURN v_reset_event_id;
END;
$$;

COMMENT ON FUNCTION public.reset_match_score IS
  'Mark all valid goal_detected events for a match as removed and insert a score_reset event. Returns the reset event id.';

-- =====================================================
-- 4. Permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION public.record_goal_event TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.invalidate_goal_event TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.reset_match_score TO authenticated, anon;
