import { test, expect } from "@playwright/test";
import {
  expectConfiguredRecoverySurface,
  expectConfiguredSignInSurface,
  expectUnavailableAuthSurface,
  resolveAuthPageState,
} from "./auth-surface";

test("app shell loads for authenticated or anonymous users", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Foosball Tracker");
  await expect(page.locator("body")).toContainText(/Foosball/i);
  await expect(page.locator("body")).toContainText(/Scoreboard|Main screen live board|Sign in/i);
});

test.describe("anonymous auth surface", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("protected pages redirect to the login surface", async ({ page }) => {
    await page.goto("/players");

    await expect(page).toHaveURL(/\/login$/);
    if ((await resolveAuthPageState(page, "signin")) === "configured") {
      await expectConfiguredSignInSurface(page);
      await expect(page.locator("body")).toContainText(/manage teams, players, and matches/i);
      return;
    }

    await expectUnavailableAuthSurface(page);
  });

  test("login page shows a valid anonymous auth surface", async ({ page }) => {
    await page.goto("/login");

    if ((await resolveAuthPageState(page, "signin")) === "unavailable") {
      await expectUnavailableAuthSurface(page);
      return;
    }

    await expectConfiguredSignInSurface(page);
  });

  test("recovery link lands on a valid reset surface", async ({ page }) => {
    await page.goto("/login#type=recovery&access_token=test&refresh_token=test");

    if ((await resolveAuthPageState(page, "recovery")) === "unavailable") {
      await expectUnavailableAuthSurface(page);
      return;
    }

    await expectConfiguredRecoverySurface(page);
  });
});
