import { test, expect } from "@playwright/test";

test("app shell loads for authenticated or anonymous users", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Foosball Tracker");
  await expect(page.locator("body")).toContainText(/Foosball/i);
  await expect(page.locator("body")).toContainText(/Scoreboard|Main screen live board|Sign in/i);
});

test.describe("anonymous routes", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("protected pages redirect to sign in", async ({ page }) => {
    await page.goto("/players");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.locator("body")).toContainText(/manage teams, players, and matches/i);
  });
});
