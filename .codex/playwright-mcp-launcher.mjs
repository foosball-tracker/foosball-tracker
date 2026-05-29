#!/usr/bin/env node
/* global process, console */

import { accessSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const executableOverride = process.env.PLAYWRIGHT_MCP_EXECUTABLE_PATH;

function resolveExecutablePath() {
  const candidate = executableOverride || chromium.executablePath();

  if (!candidate) {
    throw new Error(
      "Unable to resolve a Chromium executable. Install it with `npx playwright install chromium`."
    );
  }

  accessSync(candidate);
  return candidate;
}

function main() {
  let executablePath;

  try {
    executablePath = resolveExecutablePath();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[playwright-mcp-launcher] ${message}`);
    process.exit(1);
  }

  const child = spawn(
    "npx",
    [
      "-y",
      "@playwright/mcp@latest",
      "--headless",
      "--isolated",
      "--executable-path",
      executablePath,
      ...process.argv.slice(2),
    ],
    {
      stdio: "inherit",
      env: process.env,
    }
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

main();
