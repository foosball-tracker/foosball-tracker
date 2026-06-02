import { createSignal } from "solid-js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database.ts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseContext = import.meta.env.VITE_CONTEXT ?? "unset";
const schemaCacheErrorCodes = new Set(["PGRST202", "PGRST205"]);

interface SupabaseSchemaIssue {
  code: string;
  context: string;
  message: string;
}

type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
};

const [schemaIssue, setSchemaIssue] = createSignal<SupabaseSchemaIssue | null>(null);

export const hasSupabaseConfig = (): boolean => !!(supabaseUrl && supabaseKey);

function isLocalSupabaseUrl(value: string | undefined) {
  return /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(value ?? "");
}

export function getSupabaseConnectionInfo() {
  if (!hasSupabaseConfig()) {
    return {
      context: supabaseContext,
      host: "not configured",
      label: "Supabase off",
      mode: "off" as const,
      url: "",
    };
  }

  const url = supabaseUrl ?? "";
  const mode = isLocalSupabaseUrl(url) ? ("local" as const) : ("hosted" as const);
  const label =
    mode === "local"
      ? "Local"
      : supabaseContext === "production"
        ? "Production"
        : supabaseContext === "deploy-preview"
          ? "Preview"
          : "Hosted";

  return {
    context: supabaseContext,
    host: new URL(url).host,
    label,
    mode,
    url,
  };
}

export function reportSupabaseSchemaIssue(
  error: PostgrestLikeError | null | undefined,
  context: string
) {
  if (!error?.code || !schemaCacheErrorCodes.has(error.code)) return;

  setSchemaIssue({
    code: error.code,
    context,
    message: error.message ?? "Connected Supabase backend is missing required schema objects.",
  });
}

export function clearSupabaseSchemaIssue() {
  setSchemaIssue(null);
}

export function getSupabaseSchemaIssue() {
  return schemaIssue();
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
