import { test, expect } from "@playwright/test";

test("app shell loads for authenticated or anonymous users", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Foosball Tracker");
  await expect(page.getByRole("link", { name: "Foosball Tracker" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^(Logout|Sign in)$/i })).toBeVisible();
});
