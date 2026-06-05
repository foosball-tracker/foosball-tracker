import { spawn } from "node:child_process";
import {
  DEFAULT_LOCAL_TEST_PASSWORD,
  createLocalViteEnv,
  getLocalSupabaseStatus,
  run,
} from "./lib/utils.mjs";

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

const { status: localStatus } = getLocalSupabaseStatus();
const password = process.env.LOCAL_TEST_USER_PASSWORD ?? DEFAULT_LOCAL_TEST_PASSWORD;

await waitForAuthHealth(localStatus.API_URL);

console.log();
console.log(`Starting Vite against local Supabase at ${localStatus.API_URL}`);
console.log(`Log in with admin@example.local / ${password}`);
console.log(`Supabase Dashboard: ${localStatus.STUDIO_URL ?? localStatus.API_URL}`);

// Ensure any previous dev server on the intended port is terminated so restarts succeed.
const devPort = process.env.PORT ?? "5173";
try {
  const pids = run("sh", ["-c", `lsof -i :${devPort} -t || true`]).trim();
  if (pids) {
    console.log(`Killing existing process(es) on port ${devPort}: ${pids}`);
    for (const pid of pids.split(/\s+/)) {
      try {
        process.kill(Number(pid), "SIGTERM");
      } catch {
        // best-effort; continue
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
} catch {
  // don't fail local-dev if port check fails
}

const vite = spawn(process.execPath, ["scripts/local-ui-server.mjs", "--port", devPort], {
  stdio: "inherit",
  env: {
    ...process.env,
    LOCAL_TEST_USER_PASSWORD: password,
    ...createLocalViteEnv(localStatus),
  },
});

vite.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
