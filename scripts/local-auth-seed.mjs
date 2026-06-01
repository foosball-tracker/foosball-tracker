import { spawnSync } from "node:child_process";

const DEFAULT_LOCAL_TEST_PASSWORD = "password123";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
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

const statusOutput = run("pnpm", ["supabase:status"]);
const localEnv = parseStatusEnv(statusOutput);
const password = process.env.LOCAL_TEST_USER_PASSWORD ?? DEFAULT_LOCAL_TEST_PASSWORD;

process.stdout.write(statusOutput);
console.log(`Seeding local auth users with LOCAL_TEST_USER_PASSWORD=${password}`);

const result = spawnSync("pnpm", ["db:seed:auth"], {
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
