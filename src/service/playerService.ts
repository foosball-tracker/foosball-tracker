import { supabase } from "./supabaseService";
import { TablesInsert } from "~/types/database";

interface CreatePlayerParams {
  name: string;
}

/**
 * Creates a new player in the database
 * @param params Player data to create
 * @returns The created player data
 */
export const createPlayer = async (params: CreatePlayerParams) => {
  const { data, error } = await supabase
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
  const { data, error } = await supabase.from("players").select();
  
  if (error) {
    console.error("Error fetching players:", error);
    throw new Error(error.message);
  }
  
  return data ?? [];
};