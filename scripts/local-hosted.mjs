import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

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

function readHostedEnv() {
  const file = readFileSync(".env", "utf8");
  const env = parseEnvFile(file);
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.");
  }

  return {
    VITE_CONTEXT: "local",
    VITE_SUPABASE_ANON_KEY: supabaseKey,
    VITE_SUPABASE_PROJECT_ID: env.VITE_SUPABASE_PROJECT_ID,
    VITE_SUPABASE_URL: supabaseUrl,
  };
}

const args = parseArgs(process.argv.slice(2));
const port = args.port ?? process.env.PORT ?? "5173";
const host = args.host ?? process.env.LOCAL_UI_HOST;
const hostedEnv = readHostedEnv();
const viteArgs = ["dev", "--port", String(port), "--strictPort"];

if (host) {
  viteArgs.splice(1, 0, "--host", host);
}

const vite = spawn("pnpm", viteArgs, {
  stdio: "inherit",
  env: {
    ...process.env,
    ...hostedEnv,
  },
});

vite.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
