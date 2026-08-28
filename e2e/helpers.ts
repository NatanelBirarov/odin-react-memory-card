import { Page } from "@playwright/test";
import { setsFixture } from "./fixtures/sets";
import { cardsFixture } from "./fixtures/cards";

export async function setupE2EMocks(page: Page) {
  // Mock Pokemon TCG API
  await page.route("**/api.pokemontcg.io/v2/sets*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(setsFixture),
    });
  });

  await page.route("**/api.pokemontcg.io/v2/cards*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(cardsFixture),
    });
  });

  // Mock Backend API endpoints
  await page.route("**/api/settings*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        musicVolume: 0.5,
        sfxVolume: 0.5,
      }),
    });
  });

  await page.route("**/api/gamedata*", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "base1",
            completedLevels: 0,
            levels: 5,
            highScore: 0,
            completed: false,
          },
        ]),
      });
    }
  });

  // Mock Better Auth endpoints
  await page.route("**/api/auth/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        session: null,
        user: null,
      }),
    });
  });
}
