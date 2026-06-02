-- Migration: Restrict new SECURITY DEFINER RPCs to authenticated users
-- Addresses Codex P1: create_team_with_members had no auth check
-- and was callable by anon (PUBLIC default). Also defense-in-depth
-- for the other new RPCs that have body-level auth checks.
-- See: https://github.com/foosball-tracker/foosball-tracker/issues/35

-- =====================================================
-- 1. ADD auth check to create_team_with_members
--    This RPC had no auth.uid() guard — anon/PUBLIC
--    callers could create arbitrary teams and members,
--    bypassing the tightened team_members RLS.
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
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a team';
  END IF;

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
-- 2. REVOKE PUBLIC/anon access from all new SECURITY
--    DEFINER RPCs. Grant only to authenticated.
--    Functions with body-level auth checks already block
--    anon, but this is defense-in-depth.
-- =====================================================

REVOKE ALL ON FUNCTION public.create_team_with_members(text, bigint[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_team_with_members(text, bigint[]) TO authenticated;

REVOKE ALL ON FUNCTION public.update_team_with_members(bigint, text, bigint[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_team_with_members(bigint, text, bigint[]) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_player_with_linked_team(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_player_with_linked_team(bigint) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_team(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_team(bigint) TO authenticated;
