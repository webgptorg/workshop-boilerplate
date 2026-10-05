import { test, expect, WORKSPACE_URL } from "./fixtures";
import type { AppState } from "../../lib/types";

type InvalidBackupCase = { name: string; corrupt: (state: AppState) => unknown };

const INVALID_BACKUPS: InvalidBackupCase[] = [
  { name: "null", corrupt: () => null },
  { name: "an array", corrupt: () => [] },
  { name: "an empty object", corrupt: () => ({}) },
  { name: "an incomplete backup", corrupt: () => ({ version: 1 }) },
  { name: "a null todo", corrupt: (state) => ({ ...state, todos: [null] }) },
  { name: "a null user", corrupt: (state) => ({ ...state, user: null }) },
  { name: "an indirect todo cycle", corrupt: (state) => {
    state.todos[0].parentId = state.todos[1].id;
    state.todos[1].parentId = state.todos[2].id;
    state.todos[2].parentId = state.todos[0].id;
    return state;
  } },
  { name: "a missing meeting", corrupt: (state) => { state.todos[0].meetingIds.push("missing"); return state; } },
  { name: "a missing parent", corrupt: (state) => { state.todos[0].parentId = "missing"; return state; } },
  { name: "duplicate IDs", corrupt: (state) => { state.todos.push({ ...state.todos[0] }); return state; } },
  { name: "a meeting link across workspaces", corrupt: (state) => {
    addWorkspace(state);
    state.todos[0].workspaceId = "second-workspace";
    return state;
  } },
  { name: "a parent link across workspaces", corrupt: (state) => {
    addWorkspace(state);
    state.todos[0].workspaceId = "second-workspace";
    state.todos[0].meetingIds = [];
    state.todos[0].parentId = state.todos[1].id;
    return state;
  } },
  { name: "a negative recording duration", corrupt: (state) => {
    state.meetings[0].recordings.push({
      id: "invalid", name: "invalid.wav", mimeType: "audio/wav", duration: -1, size: 10, createdAt: new Date().toISOString(),
    });
    return state;
  } },
];

function addWorkspace(state: AppState) {
  state.workspaces.push({ ...state.workspaces[0], id: "second-workspace", name: "Another project" });
  state.memberships.push({ ...state.memberships[0], workspaceId: "second-workspace" });
}

test("export and restore a portable backup with nested todos and multiple meeting links", async ({ app, page }) => {
  const BACKUP = await app.exportBackup();
  expect(BACKUP.version).toBe(1);
  expect(BACKUP.workspaces).toHaveLength(1);
  expect(BACKUP.todos.filter((todo) => todo.id.startsWith("tutorial"))).toHaveLength(3);
  BACKUP.user.name = "Restored Alex";
  BACKUP.todos[0].meetingIds = [BACKUP.meetings[0].id, BACKUP.meetings[1].id];
  BACKUP.todos[1].parentId = BACKUP.todos[0].id;
  BACKUP.todos[2].parentId = BACKUP.todos[1].id;
  addWorkspace(BACKUP);
  BACKUP.todos.push({ ...BACKUP.todos[0], id: "second-workspace-todo", workspaceId: "second-workspace", meetingIds: [], parentId: null });
  await app.importBackup(BACKUP);
  await expect(app.dialog.getByRole("heading", { name: "Restore this backup?", exact: true })).toBeVisible();
  await app.dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".sidebar")).toContainText("Alex Morgan");
  await app.importBackup(BACKUP);
  await app.dialog.getByRole("button", { name: "Restore backup", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${WORKSPACE_URL}$`));
  await page.reload();
  await expect(page.locator(".sidebar")).toContainText("Restored Alex");
  expect(await app.exportBackup()).toEqual(BACKUP);
});

for (const BACKUP_CASE of INVALID_BACKUPS) {
  test(`restore rejects ${BACKUP_CASE.name} and preserves current data`, async ({ app }) => {
    const ORIGINAL = await app.exportBackup();
    await app.importBackup(BACKUP_CASE.corrupt(structuredClone(ORIGINAL)));
    await expect(app.page.getByRole("status")).toContainText("This isn’t a valid Minute backup.");
    await expect(app.dialog).toHaveCount(0);
    expect(await app.exportBackup()).toEqual(ORIGINAL);
  });
}

test("restore rejects malformed JSON without changing current data", async ({ app }) => {
  const ORIGINAL = await app.exportBackup();
  await app.main.locator('input[type="file"]').setInputFiles({
    name: "broken.json", mimeType: "application/json", buffer: Buffer.from("{broken"),
  });
  await expect(app.page.getByRole("status")).toContainText("This isn’t a valid Minute backup.");
  expect(await app.exportBackup()).toEqual(ORIGINAL);
});
