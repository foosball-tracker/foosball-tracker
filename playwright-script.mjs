/* global console */
import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/home/josh/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome",
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto("http://localhost:5173");
  await page.waitForTimeout(2000);
  const html = await page.content();
  console.log(html);
  await browser.close();
})();
