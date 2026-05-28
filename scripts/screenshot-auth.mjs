/* global document */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";
import { INSPECT_BASE_URL, ensureInspectServer } from "./ui-inspect-server.mjs";

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

function sanitizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9-_]+/g, "-");
}

const state = JSON.parse(
  await (await import("node:fs")).promises.readFile("playwright/.auth/user.json", "utf8")
);

const args = parseArgs(process.argv.slice(2));
const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
const outDir = `e2e/screenshots/${branch}`;
const route = args.route ?? "/players";
const captureName = sanitizeName(args.name ?? "players");

await mkdir(outDir, { recursive: true });
await ensureInspectServer();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ storageState: state, colorScheme: "dark" });
const page = await context.newPage();

await page.goto(`${INSPECT_BASE_URL}${route}`);
await page.waitForFunction(
  () => {
    const spinner = document.querySelector(".loading-spinner");
    const table = document.querySelector("table");
    return !spinner || table;
  },
  { timeout: 15_000 }
);
await page.waitForTimeout(300);

await page.setViewportSize({ width: 1280, height: 720 });
await page.screenshot({ path: `${outDir}/${captureName}-desktop.png` });

await page.setViewportSize({ width: 375, height: 812 });
await page.screenshot({ path: `${outDir}/${captureName}-mobile.png` });

await browser.close();
console.log(
  `Screenshots saved to ${outDir}/ as ${captureName}-desktop.png and ${captureName}-mobile.png`
);
