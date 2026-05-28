/* global document */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";

const state = JSON.parse(
  await (await import("node:fs")).promises.readFile("playwright/.auth/user.json", "utf8")
);

const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
const outDir = `e2e/screenshots/${branch}`;
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ storageState: state, colorScheme: "dark" });
const page = await context.newPage();

await page.goto("http://localhost:5173/players");
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
await page.screenshot({ path: `${outDir}/desktop.png` });

await page.setViewportSize({ width: 375, height: 812 });
await page.screenshot({ path: `${outDir}/mobile.png` });

await browser.close();
console.log(`Screenshots saved to ${outDir}/`);
