import { spawnSync } from "node:child_process";

const DEFAULT_LOCAL_TEST_PASSWORD = "password123"; /* NOSONAR - local dev credential only */
const LOCAL_SUPABASE_PROJECT_ID = "foosball-tracker";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    // NOSONAR - local dev script only
    stdio: ["inherit", "pipe", "pipe"],
    encoding: "utf8",
    ...options,
  });

  if (result.status !== 0) {
    process.stdout.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    process.exit(result.status ?? 1);
  }

  return result.stdout ?? "";
}

function parseStatusEnv(output) {
  return Object.fromEntries(
    output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[A-Z0-9_]+="/.test(line))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex);
        const rawValue = line.slice(separatorIndex + 1);
        return [key, rawValue.replace(/^"/, "").replace(/"$/, "")];
      })
  );
}

function getLocalSupabaseStatus() {
  const statusOutput = run("pnpm", ["supabase:status"]);
  return {
    statusOutput,
    status: parseStatusEnv(statusOutput),
  };
}

function createLocalViteEnv(localStatus) {
  return {
    VITE_CONTEXT: "local",
    VITE_SUPABASE_ANON_KEY: localStatus.ANON_KEY,
    VITE_SUPABASE_PROJECT_ID: LOCAL_SUPABASE_PROJECT_ID,
    VITE_SUPABASE_URL: localStatus.API_URL,
  };
}

function createLocalAuthSeedEnv(localStatus) {
  return {
    SUPABASE_SERVICE_ROLE_KEY: localStatus.SERVICE_ROLE_KEY,
    SUPABASE_URL: localStatus.API_URL,
    VITE_SUPABASE_URL: localStatus.API_URL,
  };
}

function isLocalSupabaseUrl(value) {
  return /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(value ?? "");
}

function resolveLocalViteEnv() {
  const configuredUrl = process.env.VITE_SUPABASE_URL;
  const configuredKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (configuredUrl && configuredKey && isLocalSupabaseUrl(configuredUrl)) {
    return {
      VITE_CONTEXT: "local",
      VITE_SUPABASE_ANON_KEY: configuredKey,
      VITE_SUPABASE_PROJECT_ID: process.env.VITE_SUPABASE_PROJECT_ID ?? LOCAL_SUPABASE_PROJECT_ID,
      VITE_SUPABASE_URL: configuredUrl,
    };
  }

  const { status } = getLocalSupabaseStatus();
  return createLocalViteEnv(status);
}

export {
  DEFAULT_LOCAL_TEST_PASSWORD,
  createLocalAuthSeedEnv,
  createLocalViteEnv,
  getLocalSupabaseStatus,
  parseStatusEnv,
  resolveLocalViteEnv,
  run,
};
