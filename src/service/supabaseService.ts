import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database.ts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = (): boolean => !!(supabaseUrl && supabaseKey);

let _client: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> | null {
  if (_client) return _client;
  if (hasSupabaseConfig()) {
    _client = createClient<Database>(supabaseUrl, supabaseKey);
    return _client;
  }
  return null;
}

export const supabase: SupabaseClient<Database> | null = getClient();
