import { spawnSync } from "node:child_process";
import {
  DEFAULT_LOCAL_TEST_PASSWORD,
  createLocalAuthSeedEnv,
  getLocalSupabaseStatus,
} from "./lib/utils.mjs";

const { statusOutput, status: localStatus } = getLocalSupabaseStatus();
const password = process.env.LOCAL_TEST_USER_PASSWORD ?? DEFAULT_LOCAL_TEST_PASSWORD;

process.stdout.write(statusOutput);
console.log(`Seeding local auth users with LOCAL_TEST_USER_PASSWORD=${password}`);

const result = spawnSync("pnpm", ["db:seed:auth"], {
  // NOSONAR - local dev script only
  stdio: "inherit",
  env: {
    ...process.env,
    LOCAL_TEST_USER_PASSWORD: password,
    ...createLocalAuthSeedEnv(localStatus),
  },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const soundSeedResult = spawnSync("pnpm", ["db:seed:sounds"], {
  // NOSONAR - local dev script only
  stdio: "inherit",
  env: {
    ...process.env,
    SUPABASE_SERVICE_ROLE_KEY: localStatus.SERVICE_ROLE_KEY,
    SUPABASE_URL: localStatus.API_URL,
    VITE_SUPABASE_URL: localStatus.API_URL,
  },
});

if (soundSeedResult.status !== 0) {
  process.exit(soundSeedResult.status ?? 1);
}

console.log();
console.log("Local login credentials:");
console.log(`  Password: ${password}`);
console.log(
  "  Emails: admin@example.local, player1@example.local, player2@example.local, viewer@example.local"
);
