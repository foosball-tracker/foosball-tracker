import { Database, TablesInsert } from "~/types/database";
import { supabase } from "./supabaseService";

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

interface CreateTeamParams {
  name: string;
  playerIds: number[];
}

export const createTeam = async (params: CreateTeamParams) => {
  const client = requireSupabase();
  const { data, error: teamError } = await client
    .from("teams")
    .insert({
      name: params.name,
      type: "team" as Database["public"]["Enums"]["team_type"],
    } as TablesInsert<"teams">)
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

  const { error: memberError } = await client
    .from("team_members")
    .insert(teamMembers as TablesInsert<"team_members">[]);

  if (memberError) {
    console.error("Error adding team members", memberError);
    throw new Error(memberError.message);
  }

  return data;
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
