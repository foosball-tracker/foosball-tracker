import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";

const hasAuth = existsSync("playwright/.auth/user.json");

test("authenticated user sees the app, not the login screen", async ({ page }) => {
  test.skip(!hasAuth, "No auth state found. Run `pnpm auth:local` first.");

  await page.goto("/");

  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

  await expect(page.getByRole("button", { name: /^sign in$/i })).not.toBeVisible();

  await page.screenshot({ path: "test-results/authenticated-home.png" });
});
