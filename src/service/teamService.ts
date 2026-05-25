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

  return (data as unknown as TeamWithMembers[]) ?? [];
};

export const getTeamWithMembers = async (teamId: number): Promise<TeamWithMembers | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(player_id, players(name))")
    .eq("id", teamId)
    .single();

  if (error) {
    console.error("Error fetching team with members:", error);
    throw new Error(error.message);
  }

  return (data as unknown as TeamWithMembers) ?? null;
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

  const { error: updateError } = await client
    .from("teams")
    .update({ name: params.name })
    .eq("id", teamId);

  if (updateError) {
    console.error("Error updating team:", updateError);
    throw new Error(updateError.message);
  }

  const { error: deleteError } = await client.from("team_members").delete().eq("team_id", teamId);

  if (deleteError) {
    console.error("Error deleting old team members:", deleteError);
    throw new Error(deleteError.message);
  }

  const teamMembers = params.playerIds.map((player_id) => ({
    player_id,
    team_id: teamId,
  }));

  if (teamMembers.length > 0) {
    const { error: insertError } = await client.from("team_members").insert(teamMembers);

    if (insertError) {
      console.error("Error adding team members", insertError);
      throw new Error(insertError.message);
    }
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
