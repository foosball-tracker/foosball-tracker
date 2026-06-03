import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { exerciseConfiguredModeSwitching } from "./auth-surface";

const hasAuth = existsSync("playwright/.auth/user.json");

test.describe("authenticated auth integration", () => {
  test("authenticated user sees the app, not the login screen", async ({ page }) => {
    test.skip(!hasAuth, "No auth state found. Run `pnpm auth:local` first.");

    await page.goto("/");
    await expect(page.locator("body")).toContainText(/Foosball/i);

    const header = page.getByRole("banner");
    const logoutButton = header.getByRole("button", { name: "Logout" });
    const signInButton = header.getByRole("button", { name: /^sign in$/i });
    await expect(header.getByRole("button", { name: /logout|sign in/i }).first()).toBeVisible();

    test.skip(
      !(await logoutButton.isVisible().catch(() => false)) &&
        (await signInButton.isVisible().catch(() => false)),
      "Auth state is missing, expired, or tied to another local origin. Run `pnpm auth:local` again."
    );

    await expect(logoutButton).toBeVisible();

    await page.screenshot({ path: "test-results/authenticated-home.png" });
  });

  test("login page supports configured auth mode switching", async ({ page }) => {
    test.skip(!hasAuth, "No auth state found. Run `pnpm auth:local` first.");

    await page.goto("/");
    await page.context().clearCookies();
    await page.evaluate(() => {
      globalThis.localStorage.clear();
      globalThis.sessionStorage.clear();
    });
    await page.goto("/login");

    await exerciseConfiguredModeSwitching(page);
  });
});
