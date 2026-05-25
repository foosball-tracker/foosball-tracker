/* global document */
import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/home/josh/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome",
  });

  // Mobile viewport
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("http://localhost:5173");
  await page.waitForTimeout(1500);

  // Inject logged-in state into header
  const loggedInHtml = `
    <div class="flex items-center gap-2">
      <p>very.long.email.address@example.com</p>
      <button class="btn btn-secondary">Logout</button>
    </div>
  `;
  await page.evaluate((html) => {
    const end = document.querySelector(".navbar-end");
    if (end) end.innerHTML = html;
  }, loggedInHtml);

  await page.waitForTimeout(500);
  await page.screenshot({
    path: "/home/josh/coding/foosball-tracker/screenshot-mobile-before.png",
    fullPage: false,
  });

  // Also desktop
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto("http://localhost:5173");
  await desktopPage.waitForTimeout(1500);
  await desktopPage.evaluate((html) => {
    const end = document.querySelector(".navbar-end");
    if (end) end.innerHTML = html;
  }, loggedInHtml);
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({
    path: "/home/josh/coding/foosball-tracker/screenshot-desktop-before.png",
    fullPage: false,
  });

  await browser.close();
})();
