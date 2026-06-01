-- Replace record_goal_event with an atomic version that uses
-- EXCEPTION-based deduplication instead of a SELECT-then-INSERT
-- pattern. This prevents a race condition where two concurrent
-- requests with the same dedupe_key could both pass the pre-check
-- before either row becomes visible.

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

  INSERT INTO public.match_events (
    match_id, type, team_id, player_id, source, source_id,
    dedupe_key, status, goal_time, metadata
  ) VALUES (
    p_match_id, 'goal_detected', p_team_id, p_player_id, p_source, p_source_id,
    p_dedupe_key, 'valid', p_goal_time, p_metadata
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
EXCEPTION
  WHEN unique_violation THEN
    SELECT id INTO v_event_id
    FROM public.match_events
    WHERE dedupe_key = p_dedupe_key;
    RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION public.record_goal_event IS
  'Atomically record a goal_detected event. Validates the match is active. Uses unique_violation exception handling to make dedupe idempotent even under concurrent retries.';
