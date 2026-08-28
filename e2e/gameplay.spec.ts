import { test, expect } from "@playwright/test";
import { setupE2EMocks } from "./helpers";

test.beforeEach(async ({ page }) => {
  await setupE2EMocks(page);
});

test.describe("Memory Card Gameplay Flow", () => {
  test("full loop: select set -> play card -> increase score", async ({ page }) => {
    // Navigate to selection page
    await page.goto("/selectionpage");

    // Click on Base Set
    const setItem = page.getByText("Base Set");
    await expect(setItem).toBeVisible();
    await setItem.click();

    // Verify we reached the game page
    await expect(page).toHaveURL(/.*gamepage\/base1/);

    // Verify score display is present
    await expect(page.getByRole("heading", { name: "Score:0", exact: true })).toBeVisible();

    // Verify card is rendered
    const card = page.locator("img[alt='Alakazam-front']");
    await expect(card).toBeVisible();

    // Click the card
    await card.click();

    // Current score should increment to 1
    await expect(page.getByRole("heading", { name: "Score:1", exact: true })).toBeVisible();
  });

  test("clicking same card twice displays failure modal", async ({ page }) => {
    await page.goto("/gamepage/base1");

    // Wait for card to be rendered
    const firstCard = page.locator("img[alt='Alakazam-front']");
    await expect(firstCard).toBeVisible();

    // Click card once
    await firstCard.click();
    await expect(page.getByRole("heading", { name: "Score:1", exact: true })).toBeVisible();

    // Wait for shuffle animation to settle
    await page.waitForTimeout(1000);

    // Click the same card again
    await firstCard.click();

    // Failure modal should appear
    await expect(page.getByText(/You failed/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Select set" })).toBeVisible();
  });
});
