import { test, expect, login, WORKSPACE_URL } from "./fixtures";

// Using page without app keeps these stories on the unauthenticated first visit.
test("login with the initial user persists a session and logout protects deep links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Log in to Minute" })).toBeVisible();
  await login(page);
  await page.reload();
  await expect(page.locator(".sidebar")).toContainText("Alex Morgan");
  await page.goto(`${WORKSPACE_URL}/settings`);
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Log in to Minute" })).toBeVisible();
  await page.goto(`${WORKSPACE_URL}/meetings/product-design-review`);
  await expect(page.getByRole("heading", { name: "Log in to Minute" })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("minute.account.")))).toEqual([]);
});

test("an incorrect password does not log in or expose workspace data", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email", { exact: true }).fill("test@ptbk.io");
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Incorrect email or password.");
  await expect(page.locator(".sidebar")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Log in to Minute" })).toBeVisible();
});

test("registration needs no email confirmation and creates an isolated account", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create an account", exact: true }).click();
  await page.getByLabel("Your name").fill("New member");
  await page.getByLabel("Email", { exact: true }).fill("new-member@example.com");
  await page.getByLabel("Password", { exact: true }).fill("unique-password123");
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.locator(".sidebar")).toContainText("New member");
  await page.goto(`${WORKSPACE_URL}/settings`);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("new-member@example.com");
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await login(page);
  await expect(page.locator(".sidebar")).toContainText("Alex Morgan");
});

test("workspace changes survive clearing the browser cache and logging in again", async ({ app, page }) => {
  await app.createTodo("Saved in Supabase");
  await expect(page.locator(".sync-status")).toHaveText("Saved to Supabase");
  await app.open(`${WORKSPACE_URL}/settings`);
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await login(page);
  await app.open(`${WORKSPACE_URL}/todos`);
  await expect(app.main.getByRole("link", { name: "Saved in Supabase", exact: true })).toBeVisible();
});

test("registration does not send a signup request when email confirmation is enabled", async ({ page, context }) => {
  await context.route("http://127.0.0.1:54321/auth/v1/settings", (route) => route.fulfill({ json: { mailer_autoconfirm: false } }));
  let signupRequests = 0;
  page.on("request", (request) => { if (request.url().endsWith("/auth/v1/signup")) signupRequests++; });
  await page.goto("/");
  await page.getByRole("button", { name: "Create an account", exact: true }).click();
  await page.getByLabel("Your name").fill("New member");
  await page.getByLabel("Email", { exact: true }).fill("new-member@example.com");
  await page.getByLabel("Password", { exact: true }).fill("unique-password123");
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("No email was sent.");
  expect(signupRequests).toBe(0);
});
