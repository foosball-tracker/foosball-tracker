import { expect, type Page } from "@playwright/test";

export async function resolveAuthPageState(page: Page, variant: "signin" | "recovery") {
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

export async function expectUnavailableAuthSurface(page: Page) {
  const authPage = page.getByRole("main");
  await expect(authPage.getByRole("heading", { name: "Sign in unavailable" })).toBeVisible();
  await expect(authPage).toContainText(/Supabase is not configured/i);
}

export async function expectConfiguredSignInSurface(page: Page) {
  const authPage = page.getByRole("main");
  await expect(authPage.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(authPage.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(authPage.getByLabel("Email address")).toBeVisible();
  await expect(authPage.getByLabel("Password")).toBeVisible();
}

export async function expectConfiguredRecoverySurface(page: Page) {
  const authPage = page.getByRole("main");
  await expect(authPage.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
  await expect(authPage.getByLabel("New password")).toBeVisible();
  await expect(authPage.getByLabel("Confirm password")).toBeVisible();
  await expect(authPage.getByRole("button", { name: "Save new password" })).toBeVisible();
  await expect(authPage.getByLabel("Email address")).toHaveCount(0);
}

export async function exerciseConfiguredModeSwitching(page: Page) {
  const authPage = page.getByRole("main");

  await expectConfiguredSignInSurface(page);

  await authPage.getByRole("button", { name: "Create account" }).click();
  await expect(authPage.getByRole("heading", { name: "Create account" })).toBeVisible();
  await expect(authPage.getByLabel("Confirm password")).toBeVisible();

  await authPage.getByRole("button", { name: /already have an account\? sign in/i }).click();
  await expect(authPage.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await authPage.getByRole("button", { name: "Forgot password?" }).click();
  await expect(authPage.getByRole("heading", { name: "Reset password" })).toBeVisible();
  await expect(authPage.getByRole("button", { name: "Send reset link" })).toBeVisible();
  await expect(authPage.getByLabel("Password")).toHaveCount(0);
}
