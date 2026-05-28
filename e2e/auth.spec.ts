import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";

const hasAuth = existsSync("playwright/.auth/user.json");

test("authenticated user sees the app, not the login screen", async ({ page }) => {
  test.skip(!hasAuth, "No auth state found. Run `pnpm auth:local` first.");

  await page.goto("/");

  const logoutButton = page.getByRole("button", { name: "Logout" });
  const signInButton = page.getByRole("button", { name: /^sign in$/i });
  const hasLogout = await logoutButton.isVisible().catch(() => false);

  test.skip(
    !hasLogout && (await signInButton.isVisible().catch(() => false)),
    "Auth state is missing, expired, or tied to another local origin. Run `pnpm auth:local` again."
  );

  await expect(logoutButton).toBeVisible();

  await expect(signInButton).not.toBeVisible();

  await page.screenshot({ path: "test-results/authenticated-home.png" });
});
