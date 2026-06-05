import { readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";

const DEFAULT_LOCAL_TEST_PASSWORD = "password123"; /* NOSONAR - local dev credential only */
const DEFAULT_LOCAL_AUTH_EMAIL = "admin@example.local";
const LOCAL_SUPABASE_PROJECT_ID = "foosball-tracker";
const PNPM_BIN =
  process.env.PNPM_BIN ??
  (process.env.PNPM_HOME ? join(process.env.PNPM_HOME, "pnpm") : undefined) ??
  join(dirname(process.execPath), "pnpm");

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

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;

    const [flag, inlineValue] = value.split("=", 2);
    const key = flag.slice(2);

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }

    const nextValue = argv[index + 1];
    if (nextValue && !nextValue.startsWith("--")) {
      options[key] = nextValue;
      index += 1;
      continue;
    }

    options[key] = "true";
  }

  return options;
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

function parseEnvFile(contents) {
  const env = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function readEnvFile(path = ".env") {
  try {
    return parseEnvFile(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

function getLocalSupabaseStatus() {
  const statusOutput = run("pnpm", ["supabase:status"]);
  const parsed = parseStatusEnv(statusOutput);

  let studioUrl = parsed.STUDIO_URL ?? parsed.SUPABASE_STUDIO_URL ?? parsed.SUPABASE_STUDIO;

  if (!studioUrl && parsed.API_URL) {
    try {
      const url = new URL(parsed.API_URL);
      if (url.port === "15421") {
        url.port = "15423";
      }
      studioUrl = url.toString();
    } catch {
      // Ignore URL parse errors and leave STUDIO_URL unset.
    }
  }

  if (studioUrl) {
    parsed.STUDIO_URL = studioUrl;
  }

  return {
    statusOutput,
    status: parsed,
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

function createLimitedViteEnv() {
  return {
    VITE_CONTEXT: "local",
  };
}

function createHostedViteEnv() {
  const env = {
    ...readEnvFile(),
    ...process.env,
  };
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env or the current environment."
    );
  }

  return {
    VITE_CONTEXT: "local",
    VITE_SUPABASE_ANON_KEY: supabaseKey,
    VITE_SUPABASE_PROJECT_ID: env.VITE_SUPABASE_PROJECT_ID,
    VITE_SUPABASE_URL: supabaseUrl,
  };
}

const resolveHostedViteEnv = createHostedViteEnv;

function resolveLocalViteEnv() {
  const configuredUrl = process.env.VITE_SUPABASE_URL;
  const configuredKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (configuredUrl && configuredKey) {
    return {
      VITE_CONTEXT: process.env.VITE_CONTEXT ?? "local",
      VITE_SUPABASE_ANON_KEY: configuredKey,
      VITE_SUPABASE_PROJECT_ID: process.env.VITE_SUPABASE_PROJECT_ID ?? LOCAL_SUPABASE_PROJECT_ID,
      VITE_SUPABASE_URL: configuredUrl,
    };
  }

  if (process.env.CI === "true") {
    return createLimitedViteEnv();
  }

  const { status } = getLocalSupabaseStatus();
  return createLocalViteEnv(status);
}

function spawnViteDevServer({ port, host, viteEnv }) {
  const viteArgs = ["dev", "--port", String(port), "--strictPort"];

  if (host) {
    viteArgs.splice(1, 0, "--host", host);
  }

  const vite = spawn(PNPM_BIN, viteArgs, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...viteEnv,
    },
  });

  vite.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

export {
  DEFAULT_LOCAL_TEST_PASSWORD,
  DEFAULT_LOCAL_AUTH_EMAIL,
  PNPM_BIN,
  createLocalAuthSeedEnv,
  createLimitedViteEnv,
  createLocalViteEnv,
  createHostedViteEnv,
  resolveHostedViteEnv,
  getLocalSupabaseStatus,
  parseArgs,
  parseStatusEnv,
  resolveLocalViteEnv,
  spawnViteDevServer,
  run,
};
