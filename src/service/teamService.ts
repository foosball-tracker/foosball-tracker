import { requireSupabase, supabase } from "./supabaseService";
import type { Tables } from "~/types/database";

export const getTeamIdsForPlayer = async (playerId: number): Promise<number[]> => {
  if (!supabase) return [];

  const { data: playerTeams, error: playerError } = await supabase
    .from("teams")
    .select("id")
    .eq("type", "player")
    .eq("player_id", playerId);

  if (playerError) {
    console.error("Error fetching player teams:", playerError);
    return [];
  }

  const { data: memberTeams, error: memberError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("player_id", playerId);

  if (memberError) {
    console.error("Error fetching member teams:", memberError);
    return [];
  }

  const ids = new Set([
    ...(playerTeams ?? []).map((t) => t.id),
    ...(memberTeams ?? []).map((m) => m.team_id),
  ]);

  return [...ids];
};

export interface TeamMember {
  player_id: number;
  players: { name: string } | null;
}

export interface TeamWithMembers {
  id: number;
  name: string;
  type: "player" | "team";
  created_at: string;
  team_members: TeamMember[] | null;
}

interface CreateTeamParams {
  name: string;
  playerIds: number[];
}

export const getTeamsWithMembers = async (): Promise<TeamWithMembers[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(player_id, players(name))")
    .eq("type", "team");

  if (error) {
    console.error("Error fetching teams with members:", error);
    throw new Error(error.message);
  }

  return data ?? [];
};

export const getTeamWithMembers = async (teamId: number): Promise<TeamWithMembers | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(player_id, players(name))")
    .eq("id", teamId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching team with members:", error);
    throw new Error(error.message);
  }

  return data ?? null;
};

export const getAllTeams = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("teams").select();

  if (error) {
    console.error("Error fetching all teams:", error);
    throw new Error(error.message);
  }

  return data ?? [];
};

export const getTeamsByIds = async (teamIds: number[]): Promise<Tables<"teams">[]> => {
  if (!supabase || teamIds.length === 0) return [];

  const { data, error } = await supabase.from("teams").select("*").in("id", teamIds);

  if (error) {
    console.error("Error fetching selected teams:", error);
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createTeam = async (params: CreateTeamParams) => {
  const client = requireSupabase();

  const { data, error } = await client.rpc("create_team_with_members", {
    p_name: params.name,
    p_player_ids: params.playerIds,
  });

  if (error) {
    console.error("Error creating team:", error);
    throw new Error(error.message);
  }

  return { id: data, name: params.name };
};

export const updateTeam = async (teamId: number, params: CreateTeamParams) => {
  const client = requireSupabase();

  // The RPC enforces `type = 'team'` and replaces memberships transactionally.
  const { error } = await client.rpc("update_team_with_members", {
    target_name: params.name,
    target_player_ids: params.playerIds,
    target_team_id: teamId,
  });

  if (error) {
    console.error("Error updating team:", error);
    throw new Error(error.message);
  }

  return { id: teamId, name: params.name };
};

export const deleteTeam = async (teamId: number) => {
  const client = requireSupabase();

  const { error } = await client.rpc("delete_team", {
    target_team_id: teamId,
  });

  if (error) {
    console.error("Error deleting team:", error);
    throw new Error(error.message);
  }
};
