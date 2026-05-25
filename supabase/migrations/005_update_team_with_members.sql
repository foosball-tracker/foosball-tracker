-- Migration: update custom teams and replace their members atomically

CREATE OR REPLACE FUNCTION public.update_team_with_members(
    target_team_id bigint,
    target_name text,
    target_player_ids bigint[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
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
