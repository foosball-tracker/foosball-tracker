import { test, expect } from "@playwright/test";

test("app shell loads for authenticated or anonymous users", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Foosball Tracker");
  await expect(page.locator("body")).toContainText(/Foosball/i);
  await expect(page.locator("body")).toContainText(/Scoreboard|Main screen live board|Sign in/i);
});

async function resolveAuthPageState(
  page: import("@playwright/test").Page,
  variant: "signin" | "recovery"
) {
  const configuredMarker =
    variant === "recovery" ? "Choose a new password" : "Continue with Google";

  await page.waitForFunction(
    ([expectedConfiguredMarker]) => {
      const main = document.querySelector("main");
      const text = main?.textContent ?? "";

      return text.includes(expectedConfiguredMarker) || text.includes("Sign in unavailable");
    },
    [configuredMarker]
  );

  const mainText = (await page.getByRole("main").textContent()) ?? "";
  return mainText.includes("Sign in unavailable") ? "unavailable" : "configured";
}

test.describe("anonymous auth surface", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("protected pages redirect to the login surface", async ({ page }) => {
    await page.goto("/players");

    await expect(page).toHaveURL(/\/login$/);
    if ((await resolveAuthPageState(page, "signin")) === "configured") {
      await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
      await expect(page.locator("body")).toContainText(/manage teams, players, and matches/i);
      return;
    }

    await expect(page.getByRole("heading", { name: "Sign in unavailable" })).toBeVisible();
    await expect(page.locator("body")).toContainText(/Supabase is not configured/i);
  });

  test("login page shows a valid anonymous auth surface", async ({ page }) => {
    await page.goto("/login");
    const authPage = page.getByRole("main");

    if ((await resolveAuthPageState(page, "signin")) === "unavailable") {
      await expect(authPage.getByRole("heading", { name: "Sign in unavailable" })).toBeVisible();
      await expect(authPage).toContainText(/Supabase is not configured/i);
      return;
    }

    await expect(authPage.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(authPage.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(authPage.getByLabel("Email address")).toBeVisible();
    await expect(authPage.getByLabel("Password")).toBeVisible();
  });

  test("recovery link lands on a valid reset surface", async ({ page }) => {
    await page.goto("/login#type=recovery&access_token=test&refresh_token=test");
    const authPage = page.getByRole("main");

    if ((await resolveAuthPageState(page, "recovery")) === "unavailable") {
      await expect(authPage.getByRole("heading", { name: "Sign in unavailable" })).toBeVisible();
      await expect(authPage).toContainText(/Supabase is not configured/i);
      return;
    }

    await expect(authPage.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
    await expect(authPage.getByLabel("New password")).toBeVisible();
    await expect(authPage.getByLabel("Confirm password")).toBeVisible();
    await expect(authPage.getByRole("button", { name: "Save new password" })).toBeVisible();
    await expect(authPage.getByLabel("Email address")).toHaveCount(0);
  });
});
