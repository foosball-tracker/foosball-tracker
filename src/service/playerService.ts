import { supabase } from "./supabaseService";
import { TablesInsert } from "~/types/database";

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

interface CreatePlayerParams {
  name: string;
}

/**
 * Creates a new player in the database
 * @param params Player data to create
 * @returns The created player data
 */
export const createPlayer = async (params: CreatePlayerParams) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from("players")
    .insert({
      name: params.name,
    } as TablesInsert<"players">)
    .select()
    .single();

  if (error) {
    console.error("Error creating player:", error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Fetches all players from the database
 * @returns Array of players
 */
export const getPlayers = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("players").select();

  if (error) {
    console.error("Error fetching players:", error);
    throw new Error(error.message);
  }

  return data ?? [];
};

/**
 * Deletes Player by ID
 * @param id player ID to delete
 */

export const deletePlayer = async (id: number) => {
  const client = requireSupabase();
  const { error } = await client.from("players").delete().eq("id", id);

  if (error) {
    console.log("error deleting", error);
    throw new Error(error.message);
  }
};
