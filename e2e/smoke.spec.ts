import { test, expect } from "@playwright/test";

test("app shell loads for authenticated or anonymous users", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Foosball Tracker");
  await expect(page.locator("body")).toContainText(/Foosball/i);
  await expect(page.locator("body")).toContainText(/Scoreboard|Main screen live board/i);
});
