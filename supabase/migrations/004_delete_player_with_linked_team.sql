-- Migration: delete players and linked pseudo-teams atomically

CREATE OR REPLACE FUNCTION public.delete_player_with_linked_team(target_player_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
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
