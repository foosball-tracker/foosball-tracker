import { spawnSync } from "node:child_process";

const DEFAULT_LOCAL_TEST_PASSWORD = "password123"; /* NOSONAR - local dev credential only */

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

export { DEFAULT_LOCAL_TEST_PASSWORD, parseStatusEnv, run };
