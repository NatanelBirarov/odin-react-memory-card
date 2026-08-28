import { test, expect } from "@playwright/test";
import { setupE2EMocks } from "./helpers";

test.beforeEach(async ({ page }) => {
  await setupE2EMocks(page);
});

test.describe("App Navigation", () => {
  test("start page click navigates to title page", async ({ page }) => {
    await page.goto("/");
    // Click start screen to begin
    await page.click("body");
    await expect(page).toHaveURL(/.*titlepage/);
  });

  test("can open and close how-to-play modal on title page", async ({ page }) => {
    await page.goto("/titlepage");

    // Click How to Play button on title page
    await page.getByRole("button", { name: /How to Play/i }).click();

    // Verify modal is open
    await expect(page.getByText("How to play", { exact: false })).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: "Close" }).click();
  });

  test("can open and close settings modal from game page", async ({ page }) => {
    await page.goto("/gamepage/base1");

    // Click the "..." menu toggle button to pin/open menu
    await page.getByRole("button", { name: "..." }).click();

    // Open settings from Menu (first menu icon button)
    const settingsButton = page.locator("div[class*='menuContent'] button").first();
    await settingsButton.click();

    await expect(page.getByText("Music volume")).toBeVisible();
    await expect(page.getByText("SFX volume")).toBeVisible();

    // Close settings
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Music volume")).not.toBeVisible();
  });

  test("unknown URL shows 404 page with return link", async ({ page }) => {
    await page.goto("/nonexistent-page-url");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();

    await page.getByRole("button", { name: "Return to Title Page" }).click();
    await expect(page).toHaveURL(/.*titlepage/);
  });
});
