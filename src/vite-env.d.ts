/// <reference types="vite/client" />

import { EnvironmentType } from "./types/environmentType";

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_SUPABASE_PROJECT_ID: string;
    readonly VITE_URL: string;
    readonly VITE_DEPLOY_PRIME_URL: string;
    readonly VITE_CONTEXT: EnvironmentType;
  }
}
