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

  test("login page supports mode switching", async ({ page }) => {
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

  test("recovery link opens reset password mode", async ({ page }) => {
    await page.goto("/login#type=recovery&access_token=test&refresh_token=test");
    const authPage = page.getByRole("main");

    await expect(authPage.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
    await expect(authPage.getByLabel("New password")).toBeVisible();
    await expect(authPage.getByLabel("Confirm password")).toBeVisible();
    await expect(authPage.getByRole("button", { name: "Save new password" })).toBeVisible();
    await expect(authPage.getByLabel("Email address")).toHaveCount(0);
  });
});
