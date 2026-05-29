import { requireSupabase, supabase } from "./supabaseService";

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

export const createTeam = async (params: CreateTeamParams) => {
  const client = requireSupabase();
  const { data, error: teamError } = await client
    .from("teams")
    .insert({
      name: params.name,
      type: "team",
    })
    .select()
    .single();

  if (teamError) {
    console.error("Error creating team: ", teamError);
    throw new Error(teamError.message);
  }

  const teamMembers = params.playerIds.map((player_id) => ({
    player_id,
    team_id: data.id,
  }));

  const { error: memberError } = await client.from("team_members").insert(teamMembers);

  if (memberError) {
    console.error("Error adding team members", memberError);
    throw new Error(memberError.message);
  }

  return data;
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
  const { error: memberError } = await client.from("team_members").delete().eq("team_id", teamId);

  if (memberError) {
    console.error("Error deleting team members:", memberError);
    throw new Error(memberError.message);
  }

  const { error: teamError } = await client.from("teams").delete().eq("id", teamId);

  if (teamError) {
    console.log("Error deleting team:", teamError);
    throw new Error(teamError.message);
  }
};
