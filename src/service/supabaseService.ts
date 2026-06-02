import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database.ts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseContext = import.meta.env.VITE_CONTEXT ?? "unset";

export const hasSupabaseConfig = (): boolean => !!(supabaseUrl && supabaseKey);

function isLocalSupabaseUrl(value: string | undefined) {
  return /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(value ?? "");
}

export function getSupabaseConnectionInfo() {
  if (!hasSupabaseConfig()) {
    return {
      context: supabaseContext,
      host: "not configured",
      mode: "off" as const,
      url: "",
    };
  }

  const url = supabaseUrl ?? "";

  return {
    context: supabaseContext,
    host: new URL(url).host,
    mode: isLocalSupabaseUrl(url) ? ("local" as const) : ("hosted" as const),
    url,
  };
}

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

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}
