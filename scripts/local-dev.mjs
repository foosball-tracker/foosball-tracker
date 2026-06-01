import { spawn } from "node:child_process";
import { DEFAULT_LOCAL_TEST_PASSWORD, parseStatusEnv, run } from "./lib/utils.mjs";

const AUTH_HEALTH_MAX_RETRIES = 30;
const AUTH_HEALTH_RETRY_DELAY_MS = 1_000;

async function waitForAuthHealth(apiUrl) {
  const healthUrl = `${apiUrl}/auth/v1/health`;
  process.stdout.write("Waiting for Supabase auth service to be ready.");
  for (let i = 0; i < AUTH_HEALTH_MAX_RETRIES; i++) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        process.stdout.write(" ready.\n");
        return;
      }
    } catch {
      // not ready yet
    }
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, AUTH_HEALTH_RETRY_DELAY_MS));
  }
  process.stderr.write("\nTimed out waiting for Supabase auth health endpoint.\n");
  process.exit(1);
}

run("pnpm", ["supabase:start"]);
run("node", ["scripts/local-auth-seed.mjs"], {
  env: {
    ...process.env,
    LOCAL_TEST_USER_PASSWORD: process.env.LOCAL_TEST_USER_PASSWORD ?? DEFAULT_LOCAL_TEST_PASSWORD,
  },
});

const statusOutput = run("pnpm", ["supabase:status"]);
const localEnv = parseStatusEnv(statusOutput);
const password = process.env.LOCAL_TEST_USER_PASSWORD ?? DEFAULT_LOCAL_TEST_PASSWORD;

await waitForAuthHealth(localEnv.API_URL);

console.log();
console.log(`Starting Vite against local Supabase at ${localEnv.API_URL}`);
console.log(`Log in with admin@example.local / ${password}`);

const vite = spawn("pnpm", ["dev"], {
  // NOSONAR - local dev script only
  stdio: "inherit",
  env: {
    ...process.env,
    LOCAL_TEST_USER_PASSWORD: password,
    VITE_CONTEXT: "local",
    VITE_SUPABASE_ANON_KEY: localEnv.ANON_KEY,
    VITE_SUPABASE_PROJECT_ID: "foosball-tracker",
    VITE_SUPABASE_URL: localEnv.API_URL,
  },
});

vite.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
