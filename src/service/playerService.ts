import { TablesInsert } from "~/types/database";
import { requireSupabase, supabase } from "./supabaseService";

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
  const { data: player, error } = await client
    .from("players")
    .insert<TablesInsert<"players">>({
      name: params.name,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating player:", error);
    throw new Error(error.message);
  }

  // Auto-create a corresponding type='player' team entry so match setup can use it.
  if (player) {
    const { error: teamError } = await client.from("teams").insert({
      name: player.name,
      player_id: player.id,
      type: "player",
    });

    if (teamError) {
      await client.from("players").delete().eq("id", player.id);
      console.error("Error creating player team:", teamError);
      throw new Error(teamError.message);
    }
  }

  return player;
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
  const { error } = await client.rpc("delete_player_with_linked_team", {
    target_player_id: id,
  });

  if (error) {
    console.log("error deleting player with linked team", error);
    throw new Error(error.message);
  }
};
