import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const EXPOSED_ENV_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PROJECT_ID",
  "VITE_CONTEXT",
  "VITE_URL",
  "VITE_DEPLOY_PRIME_URL",
] as const;

export default defineConfig(({ mode }) => {
  const runtimeEnv = globalThis.process?.env ?? {};
  const rootDir = fileURLToPath(new URL(".", import.meta.url));
  const fileEnv = loadEnv(mode, rootDir, "");
  const defineEnv = Object.fromEntries(
    EXPOSED_ENV_KEYS.map((key) => [
      `import.meta.env.${key}`,
      JSON.stringify(runtimeEnv[key] ?? fileEnv[key]),
    ])
  );

  return {
    plugins: [solid(), tsconfigPaths(), tailwindcss()],
    define: defineEnv,
  };
});
