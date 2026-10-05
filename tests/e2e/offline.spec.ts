import type { Page } from "@playwright/test";
import { test, expect, WORKSPACE_URL } from "./fixtures";

async function waitForServiceWorker(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
}

test("offline navigation to an unvisited meeting receives the cached app shell", async ({ app, page, context }) => {
  await waitForServiceWorker(page);
  await context.setOffline(true);
  await app.open(`${WORKSPACE_URL}/meetings/product-design-review`);
  await expect(app.main.getByRole("heading", { name: "Product design review", exact: true })).toBeVisible();
  await app.main.getByRole("button", { name: "Transcript", exact: true }).click();
  await expect(app.main.getByText(/Let's walk through the new onboarding flow/)).toBeVisible();
});

const NON_HTML_REQUESTS: { name: string; path: string; method: string; headers: Record<string, string> }[] = [
  { name: "API responses", path: "/api/transcribe", method: "POST", headers: {} },
  { name: "RSC query responses", path: `${WORKSPACE_URL}?_rsc=offline`, method: "GET", headers: {} },
  { name: "RSC header responses", path: WORKSPACE_URL, method: "GET", headers: { RSC: "1" } },
];

for (const REQUEST of NON_HTML_REQUESTS) {
  test(`the service worker never substitutes HTML for ${REQUEST.name}`, async ({ app, page, context }) => {
    await waitForServiceWorker(page);
    // Remove the fixture's AI mock so a real offline fetch reaches the worker.
    await context.unrouteAll();
    await context.setOffline(true);
    const IS_NETWORK_FAILURE = await page.evaluate(async ({ path, method, headers }) => {
      try {
        await fetch(path, { method, headers });
        return false;
      } catch {
        return true;
      }
    }, REQUEST);
    expect(IS_NETWORK_FAILURE).toBe(true);
    await expect(app.main.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
