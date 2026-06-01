import { spawn } from "node:child_process";
import { resolveLocalViteEnv } from "./lib/utils.mjs";

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

const args = parseArgs(process.argv.slice(2));
const port = args.port ?? process.env.UI_INSPECT_PORT ?? process.env.PLAYWRIGHT_PORT ?? "4174";
const host = args.host ?? process.env.LOCAL_UI_HOST ?? "127.0.0.1";
const localEnv = resolveLocalViteEnv();

const vite = spawn("pnpm", ["dev", "--host", host, "--port", String(port), "--strictPort"], {
  stdio: "inherit",
  env: {
    ...process.env,
    ...localEnv,
  },
});

vite.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
