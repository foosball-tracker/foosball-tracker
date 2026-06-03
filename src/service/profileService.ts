import { supabase } from "./supabaseService";
import type { Tables } from "~/types/database";

export type Profile = Tables<"profiles">;

export async function getCurrentProfile(): Promise<Profile | null> {
  const client = supabase;
  if (!client) return null;
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    console.error("Error fetching current auth user:", userError);
    throw new Error(userError.message);
  }

  if (!user) return null;

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching current profile:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function isCurrentUserAdmin() {
  if (!supabase) return false;
  const profile = await getCurrentProfile();
  return profile?.is_admin ?? false;
}
