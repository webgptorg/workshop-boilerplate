import { test, expect, readDownload, WORKSPACE_URL } from "./fixtures";

test("schedule, edit, reload, and delete a meeting while retaining its todos", async ({ app, page }) => {
  const MEETING_URL = await app.createMeeting("Planning workshop");
  await expect(page).not.toHaveURL(/\/studio$/);
  await app.main.getByRole("button", { name: "Edit", exact: true }).click();
  await app.dialog.getByLabel("Meeting title").fill("Updated planning workshop");
  await app.dialog.getByRole("combobox", { name: /^Duration/ }).selectOption("60");
  await app.dialog.getByLabel("Participants").fill("Alex Morgan, Jamie Taylor, Jamie Taylor");
  await app.dialog.getByLabel("Description", { exact: true }).fill("Discuss **research** priorities.");
  await app.dialog.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.reload();
  await expect(app.main.getByRole("heading", { name: "Updated planning workshop", exact: true })).toBeVisible();
  await expect(app.main.getByText("60 min", { exact: true })).toBeVisible();
  await expect(app.main.getByText("2 participants", { exact: true })).toBeVisible();
  await expect(app.main.locator("strong").filter({ hasText: /^research$/ })).toBeVisible();
  await app.main.getByRole("button", { name: /^Todos/ }).click();
  await app.main.getByRole("button", { name: "Add todo", exact: true }).first().click();
  await app.dialog.getByLabel("Title", { exact: true }).fill("Send workshop notes");
  await app.dialog.getByRole("button", { name: "Create todo", exact: true }).click();
  await expect(app.main.getByRole("link", { name: "Send workshop notes", exact: true })).toBeVisible();
  await app.main.getByRole("button", { name: "Delete meeting", exact: true }).click();
  await app.dialog.getByRole("button", { name: "Delete meeting", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${WORKSPACE_URL}/meetings$`));
  await app.open(`${WORKSPACE_URL}/todos`);
  await app.main.getByRole("link", { name: "Send workshop notes", exact: true }).click();
  await expect(app.main.getByText("No linked meetings", { exact: true })).toBeVisible();
  await app.open(new URL(MEETING_URL).pathname);
  await expect(app.main.getByRole("heading", { name: "This page wandered off." })).toBeVisible();
});

test("meeting filters, search, and list/grid views show the matching conversations", async ({ app }) => {
  await app.open(`${WORKSPACE_URL}/meetings`);
  await app.main.getByRole("button", { name: /^Upcoming/ }).click();
  await expect(app.main.getByRole("link", { name: "Weekly team sync", exact: true })).toBeVisible();
  await expect(app.main.getByRole("link", { name: /Product design review/ })).toHaveCount(0);
  await app.main.getByRole("button", { name: /^Completed/ }).click();
  await expect(app.main.getByRole("link", { name: /Weekly team sync/ })).toHaveCount(0);
  await app.main.getByRole("textbox", { name: "Search meetings" }).fill("Product design");
  await app.main.getByRole("button", { name: "List view" }).click();
  await expect(app.main.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "true");
  await expect(app.main.locator(".meeting-list").getByRole("link")).toHaveCount(1);
  await expect(app.main.getByRole("link", { name: /Product design review/ })).toBeVisible();
  await app.main.getByRole("button", { name: "Grid view" }).click();
  await expect(app.main.getByRole("button", { name: "Grid view" })).toHaveAttribute("aria-pressed", "true");
  await expect(app.main.getByRole("link", { name: "Product design review", exact: true })).toBeVisible();
  await app.main.getByRole("textbox", { name: "Search meetings" }).fill("No matching meeting");
  await expect(app.main.getByRole("heading", { name: "No meetings found", exact: true })).toBeVisible();
});

test("edit a transcript and export the saved meeting as Markdown", async ({ app, page }) => {
  await app.createMeeting("Research interview");
  await app.main.getByRole("button", { name: "Transcript", exact: true }).click();
  await app.main.getByRole("button", { name: "Edit", exact: true }).last().click();
  await app.main.getByRole("textbox", { name: "Edit transcript" }).fill("Jamie: Share the interview notes on Friday.");
  await app.main.getByRole("button", { name: "Save transcript" }).click();
  await page.reload();
  await app.main.getByRole("button", { name: "Transcript", exact: true }).click();
  await expect(app.main.getByText("Jamie: Share the interview notes on Friday.", { exact: true })).toBeVisible();
  const DOWNLOAD_PROMISE = page.waitForEvent("download");
  await app.main.getByRole("button", { name: "Export meeting" }).click();
  const DOWNLOAD = await DOWNLOAD_PROMISE;
  expect(DOWNLOAD.suggestedFilename()).toBe("Research interview.md");
  expect(await readDownload(DOWNLOAD)).toContain("## Transcript\n\nJamie: Share the interview notes on Friday.");
});
