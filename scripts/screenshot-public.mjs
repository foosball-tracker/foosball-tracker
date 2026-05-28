/* global document */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { INSPECT_BASE_URL, ensureInspectServer } from "./ui-inspect-server.mjs";

const outDir = "e2e/screenshots/pr-proof";

async function waitForPageReady(page) {
  await page.waitForFunction(
    () => {
      const spinner = document.querySelector(".loading-spinner");
      return !spinner;
    },
    { timeout: 15_000 }
  );
  await page.waitForTimeout(300);
}

async function capture(page, path, width, height) {
  await page.setViewportSize({ width, height });
  await page.screenshot({ path, fullPage: false });
}

await mkdir(outDir, { recursive: true });
await ensureInspectServer();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ colorScheme: "dark" });
const page = await context.newPage();

await page.goto(INSPECT_BASE_URL);
await waitForPageReady(page);
await capture(page, `${outDir}/home-desktop.png`, 1280, 720);
await capture(page, `${outDir}/home-mobile.png`, 375, 812);

await page.goto(`${INSPECT_BASE_URL}/players`);
await waitForPageReady(page);
await capture(page, `${outDir}/players-desktop.png`, 1280, 720);
await capture(page, `${outDir}/players-mobile.png`, 375, 812);

await page.goto(`${INSPECT_BASE_URL}/teams`);
await waitForPageReady(page);
await capture(page, `${outDir}/teams-desktop.png`, 1280, 720);
await capture(page, `${outDir}/teams-mobile.png`, 375, 812);

await browser.close();
console.log(`Public PR proof screenshots saved to ${outDir}/`);
