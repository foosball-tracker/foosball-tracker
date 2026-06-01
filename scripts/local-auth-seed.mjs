import { spawnSync } from "node:child_process";
import { DEFAULT_LOCAL_TEST_PASSWORD, parseStatusEnv, run } from "./lib/utils.mjs";

const statusOutput = run("pnpm", ["supabase:status"]);
const localEnv = parseStatusEnv(statusOutput);
const password = process.env.LOCAL_TEST_USER_PASSWORD ?? DEFAULT_LOCAL_TEST_PASSWORD;

process.stdout.write(statusOutput);
console.log(`Seeding local auth users with LOCAL_TEST_USER_PASSWORD=${password}`);

const result = spawnSync("pnpm", ["db:seed:auth"], {
  // NOSONAR - local dev script only
  stdio: "inherit",
  env: {
    ...process.env,
    LOCAL_TEST_USER_PASSWORD: password,
    SUPABASE_SERVICE_ROLE_KEY: localEnv.SERVICE_ROLE_KEY,
    SUPABASE_URL: localEnv.API_URL,
    VITE_SUPABASE_URL: localEnv.API_URL,
  },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log();
console.log("Local login credentials:");
console.log(`  Password: ${password}`);
console.log(
  "  Emails: admin@example.local, player1@example.local, player2@example.local, viewer@example.local"
);
