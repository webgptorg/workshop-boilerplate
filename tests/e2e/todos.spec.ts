import { test, expect, WORKSPACE_URL } from "./fixtures";

test("create and edit a todo with a due date and several meeting links", async ({ app, page }) => {
  await app.createTodo("Share project proposal");
  await app.main.getByRole("button", { name: "Edit", exact: true }).click();
  await app.dialog.getByLabel("Title", { exact: true }).fill("Share revised project proposal");
  await app.dialog.getByLabel("Description", { exact: true }).fill("Include **research findings**.");
  await app.dialog.getByLabel("Due date", { exact: true }).fill("2030-12-15");
  await app.dialog.getByRole("combobox", { name: /^Priority/ }).selectOption("high");
  await app.dialog.getByRole("checkbox", { name: "Weekly team sync", exact: true }).check();
  await app.dialog.getByRole("checkbox", { name: "Product design review", exact: true }).check();
  await app.dialog.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.reload();
  await expect(app.main.getByRole("heading", { name: "Share revised project proposal", exact: true })).toBeVisible();
  await expect(app.main.getByRole("link", { name: "Weekly team sync", exact: true })).toBeVisible();
  await expect(app.main.getByRole("link", { name: "Product design review", exact: true })).toBeVisible();
  await expect(app.main.getByText("High", { exact: true })).toBeVisible();
  await expect(app.main.locator("strong").filter({ hasText: /^research findings$/ })).toBeVisible();
  await app.main.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(app.dialog.getByLabel("Due date", { exact: true })).toHaveValue("2030-12-15");
});

test("nested subtodos stay standalone when their parent is deleted", async ({ app, page }) => {
  await app.createTodo("Prepare launch");
  await app.main.getByRole("button", { name: "Break it into smaller steps", exact: true }).click();
  await app.dialog.getByLabel("Title", { exact: true }).fill("Prepare announcement");
  await app.dialog.getByRole("button", { name: "Create todo", exact: true }).click();
  await app.main.getByRole("link", { name: "Prepare announcement", exact: true }).click();
  await app.main.getByRole("button", { name: "Break it into smaller steps", exact: true }).click();
  await app.dialog.getByLabel("Title", { exact: true }).fill("Review announcement");
  await app.dialog.getByRole("button", { name: "Create todo", exact: true }).click();
  await app.main.getByRole("link", { name: "Prepare launch", exact: true }).click();
  await app.main.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(app.dialog.getByLabel("Parent todo").getByRole("option", { name: /Prepare launch|Prepare announcement|Review announcement/ })).toHaveCount(0);
  await app.dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await app.main.getByRole("button", { name: "Delete todo", exact: true }).click();
  await app.dialog.getByRole("button", { name: "Delete todo", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${WORKSPACE_URL}/todos$`));
  await app.main.getByRole("link", { name: "Prepare announcement", exact: true }).click();
  await expect(app.main.getByRole("heading", { name: "Prepare announcement", exact: true })).toBeVisible();
  await expect(app.main.getByRole("link", { name: "Prepare launch", exact: true })).toHaveCount(0);
  await expect(app.main.getByRole("link", { name: "Review announcement", exact: true })).toBeVisible();
  await page.reload();
  await expect(app.main.getByRole("heading", { name: "Prepare announcement", exact: true })).toBeVisible();
});

test("complete and reopen a todo through the filtered list", async ({ app, page }) => {
  await app.createTodo("Publish project notes");
  await app.main.getByRole("button", { name: "Mark complete", exact: true }).click();
  await expect(app.main.getByRole("button", { name: "Mark as open", exact: true })).toBeVisible();
  await app.open(`${WORKSPACE_URL}/todos`);
  await expect(app.main.getByRole("link", { name: "Publish project notes", exact: true })).toHaveCount(0);
  await app.main.getByRole("button", { name: /^Completed/ }).click();
  await app.main.getByRole("textbox", { name: "Search todos" }).fill("Publish project notes");
  await expect(app.main.getByRole("link", { name: "Publish project notes", exact: true })).toBeVisible();
  await app.main.getByRole("checkbox", { name: "Mark pending: Publish project notes", exact: true }).click();
  await expect(app.main.getByRole("link", { name: "Publish project notes", exact: true })).toHaveCount(0);
  await app.main.getByRole("button", { name: /^Open/ }).click();
  await expect(app.main.getByRole("checkbox", { name: "Complete: Publish project notes", exact: true })).not.toBeChecked();
  await page.reload();
  await expect(app.main.getByRole("link", { name: "Publish project notes", exact: true })).toBeVisible();
});
