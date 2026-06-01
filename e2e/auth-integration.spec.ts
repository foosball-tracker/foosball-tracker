import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";

const hasAuth = existsSync("playwright/.auth/user.json");

test.describe("authenticated auth integration", () => {
  test("authenticated user sees the app, not the login screen", async ({ page }) => {
    test.skip(!hasAuth, "No auth state found. Run `pnpm auth:local` first.");

    await page.goto("/");
    await expect(page.locator("body")).toContainText(/Foosball/i);

    const logoutButton = page.getByRole("button", { name: "Logout" });
    const signInButton = page.getByRole("button", { name: /^sign in$/i });
    await expect(page.getByRole("button", { name: /logout|sign in/i }).first()).toBeVisible();

    test.skip(
      !(await logoutButton.isVisible().catch(() => false)) &&
        (await signInButton.isVisible().catch(() => false)),
      "Auth state is missing, expired, or tied to another local origin. Run `pnpm auth:local` again."
    );

    await expect(logoutButton).toBeVisible();
    await expect(signInButton).not.toBeVisible();

    await page.screenshot({ path: "test-results/authenticated-home.png" });
  });

  test("login page supports configured auth mode switching", async ({ page }) => {
    test.skip(!hasAuth, "No auth state found. Run `pnpm auth:local` first.");

    await page.goto("/login");
    const authPage = page.getByRole("main");

    await expect(authPage.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(authPage.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(authPage.getByLabel("Email address")).toBeVisible();
    await expect(authPage.getByLabel("Password")).toBeVisible();

    await authPage.getByRole("button", { name: "Create account" }).click();
    await expect(authPage.getByRole("heading", { name: "Create account" })).toBeVisible();
    await expect(authPage.getByLabel("Confirm password")).toBeVisible();

    await authPage.getByRole("button", { name: /already have an account\? sign in/i }).click();
    await expect(authPage.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await authPage.getByRole("button", { name: "Forgot password?" }).click();
    await expect(authPage.getByRole("heading", { name: "Reset password" })).toBeVisible();
    await expect(authPage.getByRole("button", { name: "Send reset link" })).toBeVisible();
    await expect(authPage.getByLabel("Password")).toHaveCount(0);
  });
});
