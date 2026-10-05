import { test, expect, WORKSPACE_URL } from "./fixtures";

test("a first visit supplies a demo workspace and a dismissible tutorial", async ({ app, page }) => {
  await expect(page.locator(".sidebar")).toContainText("Alex Morgan");
  await expect(app.main.locator(".meeting-grid").getByRole("link", { name: "Product design review", exact: true })).toBeVisible();
  await expect(app.main.getByText("Make yourself at home", { exact: true })).toBeVisible();
  await app.main.getByRole("button", { name: "Dismiss tutorial" }).click();
  await page.reload();
  await expect(app.main.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(app.main.getByText("Make yourself at home", { exact: true })).toHaveCount(0);
  expect(await app.microphoneRequests()).toBe(0);
});

test("create and switch workspaces without sharing meetings or todos", async ({ app, page }) => {
  await page.getByRole("button", { name: /My workspace.*Personal workspace/ }).click();
  await page.getByRole("button", { name: "Create workspace", exact: true }).click();
  await app.dialog.getByLabel("Workspace name").fill("Research project");
  await app.dialog.getByLabel("Description").fill("Interview notes");
  await app.dialog.getByRole("button", { name: /Czech/ }).click();
  await app.dialog.getByRole("button", { name: "Create workspace", exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(`${WORKSPACE_URL}$`));
  await expect(app.main.getByText("Your next conversation belongs here", { exact: true })).toBeVisible();
  await expect(app.main.getByRole("link", { name: "Product design review", exact: true })).toHaveCount(0);
  const WORKSPACE_PATH = new URL(page.url()).pathname;
  await app.open(`${WORKSPACE_PATH}/meetings`);
  await app.main.getByRole("button", { name: "Schedule", exact: true }).click();
  await expect(app.dialog.getByRole("button", { name: /Czech/ })).toHaveAttribute("aria-pressed", "true");
  await app.dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await app.open(`${WORKSPACE_PATH}/todos`);
  await expect(app.main.getByRole("link", { name: "Record your first meeting", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Research project.*Personal workspace/ }).click();
  await page.getByRole("link", { name: /My workspace/ }).click();
  await expect(page).toHaveURL(new RegExp(`${WORKSPACE_URL}$`));
  await expect(app.main.locator(".meeting-grid").getByRole("link", { name: "Product design review", exact: true })).toBeVisible();
});

test("workspace search finds transcript content and opens the matching meeting", async ({ app, page }) => {
  await page.getByRole("button", { name: "Search workspace" }).click();
  await app.dialog.getByRole("textbox").fill("wireframes");
  await app.dialog.getByRole("link", { name: "Product design review", exact: true }).click();
  await expect(app.main.getByRole("heading", { name: "Product design review", exact: true })).toBeVisible();
  await expect(app.dialog).toHaveCount(0);
});

test("profile, language, and theme preferences survive a reload", async ({ app, page }) => {
  await app.open(`${WORKSPACE_URL}/settings`);
  await app.main.getByLabel("Your name", { exact: true }).fill("Jamie Taylor");
  await app.main.getByRole("button", { name: "Save profile", exact: true }).click();
  await app.main.getByRole("button", { name: "Dark", exact: true }).click();
  await app.main.getByRole("combobox", { name: "App language", exact: true }).selectOption("cs");
  await expect(app.main.getByRole("heading", { name: "Nastavení", exact: true })).toBeVisible();
  await page.reload();
  await expect(app.main.getByLabel("Vaše jméno", { exact: true })).toHaveValue("Jamie Taylor");
  await expect(page.locator("html")).toHaveAttribute("lang", "cs");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await app.main.getByRole("combobox", { name: "Jazyk aplikace", exact: true }).selectOption("en");
  await app.main.getByRole("button", { name: "System", exact: true }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("a missing deep link provides a route back to the workspace", async ({ app, page }) => {
  await app.open(`${WORKSPACE_URL}/meetings/missing`);
  await expect(app.main.getByRole("heading", { name: "This page wandered off." })).toBeVisible();
  await app.main.getByRole("link", { name: "Back to workspace" }).click();
  await expect(page).toHaveURL(new RegExp(`${WORKSPACE_URL}$`));
});
