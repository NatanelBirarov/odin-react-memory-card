import { test, expect } from "@playwright/test";
import { setupE2EMocks } from "./helpers";

test.beforeEach(async ({ page }) => {
  await setupE2EMocks(page);
});

test.describe("Auth UI Flow", () => {
  test("sign-in page validates empty email", async ({ page }) => {
    await page.goto("/signin");

    // Click Sign In button without entering an email
    await page.getByRole("button", { name: "Sign In" }).click();

    // Validation error should show
    await expect(page.getByText("Invalid email address")).toBeVisible();
  });

  test("can navigate from sign-in to sign-up and check validation", async ({ page }) => {
    await page.goto("/signin");

    // Click "Sign up" link
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/.*signup/);

    // Try submitting empty signup form
    await page.getByRole("button", { name: "Sign Up" }).click();

    // Should display username validation error
    await expect(
      page.getByText("Username must be between 3 and 20 characters"),
    ).toBeVisible();
  });

  test("can navigate to forgot password request page", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByRole("button", { name: "Send Reset Link" })).toBeVisible();
  });
});
