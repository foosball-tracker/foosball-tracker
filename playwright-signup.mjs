/* global console, document */
import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/home/josh/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome",
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  await page.goto("http://localhost:5173");
  await page.waitForTimeout(1000);

  await page.click('button:has-text("open modal")');
  await page.waitForTimeout(500);

  await page.click('a:has-text("Sign up")');
  await page.waitForTimeout(500);

  const email = `test-${Date.now()}@example.com`;
  const password = "Password123!";

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  const inputValues = await page.evaluate(() => {
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    return { email: emailInput?.value, password: passwordInput?.value };
  });
  console.log("Input values:", inputValues);

  await browser.close();
})();
