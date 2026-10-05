import { test, expect, WORKSPACE_URL, readDownload } from "./fixtures";

test("a stale tab preserves its draft and can explicitly reload the database version", async ({ app, page, context }) => {
  await app.open(`${WORKSPACE_URL}/settings`);
  await expect(page.locator(".sync-status")).toHaveText("Saved to Supabase");
  const OTHER_PAGE = await context.newPage();
  await OTHER_PAGE.goto(`${WORKSPACE_URL}/settings`);
  await expect(OTHER_PAGE.getByLabel("Your name", { exact: true })).toBeVisible();
  await page.getByLabel("Your name", { exact: true }).fill("Database version");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.locator(".sync-status")).toHaveText("Saved to Supabase");
  await OTHER_PAGE.getByLabel("Your name", { exact: true }).fill("Local draft");
  await OTHER_PAGE.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(OTHER_PAGE.locator(".sync-status")).toContainText("Save conflict.");
  const DOWNLOAD = OTHER_PAGE.waitForEvent("download");
  await OTHER_PAGE.getByRole("button", { name: "Export data", exact: true }).click();
  expect(JSON.parse(await readDownload(await DOWNLOAD)).user.name).toBe("Local draft");
  await OTHER_PAGE.getByRole("button", { name: "Reload data from Supabase", exact: true }).click();
  await OTHER_PAGE.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(OTHER_PAGE.locator(".sidebar")).toContainText("Local draft");
  await OTHER_PAGE.getByRole("button", { name: "Reload data from Supabase", exact: true }).click();
  await OTHER_PAGE.getByRole("dialog").getByRole("button", { name: "Replace local changes", exact: true }).click();
  await expect(OTHER_PAGE.locator(".sidebar")).toContainText("Database version");
  await expect(OTHER_PAGE.locator(".sync-status")).toHaveText("Saved to Supabase");
  await OTHER_PAGE.close();
});

test("offline edits survive reload and synchronize after reconnect", async ({ app, page, context }) => {
  await app.open(`${WORKSPACE_URL}/settings`);
  await expect(page.locator(".sync-status")).toHaveText("Saved to Supabase");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.route("http://127.0.0.1:54321/rest/**", (route) => route.abort("internetdisconnected"));
  await context.setOffline(true);
  await app.main.getByLabel("Your name", { exact: true }).fill("Offline draft");
  await app.main.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.locator(".sync-status")).toContainText("cached on this device");
  await page.reload();
  await expect(page.locator(".sidebar")).toContainText("Offline draft");
  await context.unroute("http://127.0.0.1:54321/rest/**");
  await context.setOffline(false);
  await expect(page.locator(".sync-status")).toHaveText("Saved to Supabase");
  await app.open(`${WORKSPACE_URL}/settings`);
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Log in to Minute" })).toBeVisible();
});

test("a backup cannot change the signed-in identity", async ({ app, page }) => {
  const BACKUP = await app.exportBackup();
  const ACCOUNT_ID = BACKUP.user.id;
  BACKUP.user.id = "old-demo-account";
  BACKUP.user.email = "unrelated@example.com";
  BACKUP.memberships.forEach((membership) => { membership.userId = BACKUP.user.id; });
  await app.importBackup(BACKUP);
  await app.dialog.getByRole("button", { name: "Restore backup", exact: true }).click();
  await expect(page.locator(".sync-status")).toHaveText("Saved to Supabase");
  const RESTORED = await app.exportBackup();
  expect(RESTORED.user.id).toBe(ACCOUNT_ID);
  expect(RESTORED.user.email).toBe("test@ptbk.io");
  expect(RESTORED.memberships.every((membership) => membership.userId === ACCOUNT_ID)).toBe(true);
});

test("a reload recognizes a committed save whose response was lost", async ({ app, page }) => {
  await expect(page.locator(".sync-status")).toHaveText("Saved to Supabase");
  await page.evaluate(() => {
    const KEY = Object.keys(localStorage).find((key) => key.startsWith("minute.account."));
    if (!KEY) throw new Error("No account cache");
    const CACHE = JSON.parse(localStorage.getItem(KEY) || "null");
    CACHE.revision -= 1;
    CACHE.isPending = true;
    localStorage.setItem(KEY, JSON.stringify(CACHE));
  });
  await page.reload();
  await expect(page.locator(".sync-status")).toHaveText("Saved to Supabase");
  await expect(app.main.getByRole("heading", { level: 1 })).toBeVisible();
});
