import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../lib/seed";
import { isAppState } from "../lib/validation";

test("the tutorial is a valid, portable workspace backup", () => {
  const state = JSON.parse(JSON.stringify(createInitialState()));
  assert.equal(isAppState(state), true);
  assert.equal(state.workspaces.length, 1);
  assert.equal(state.todos.filter((todo: { id: string }) => todo.id.startsWith("tutorial")).length, 3);
});

test("todos can reference several meetings and nest without duplicating transcripts", () => {
  const state = createInitialState();
  state.todos[0].meetingIds = [state.meetings[0].id, state.meetings[1].id];
  state.todos[1].parentId = state.todos[0].id;
  state.todos[2].parentId = state.todos[1].id;
  assert.equal(isAppState(state), true);
});

test("backup restore rejects todo cycles, including indirect cycles", () => {
  const state = createInitialState();
  state.todos[0].parentId = state.todos[1].id;
  state.todos[1].parentId = state.todos[2].id;
  state.todos[2].parentId = state.todos[0].id;
  assert.equal(isAppState(state), false);
});

test("backup restore rejects broken references and duplicate IDs", () => {
  const missingMeeting = createInitialState();
  missingMeeting.todos[0].meetingIds.push("missing");
  assert.equal(isAppState(missingMeeting), false);
  const missingParent = createInitialState();
  missingParent.todos[0].parentId = "missing";
  assert.equal(isAppState(missingParent), false);
  const duplicate = createInitialState();
  duplicate.todos.push({ ...duplicate.todos[0] });
  assert.equal(isAppState(duplicate), false);
});

test("todos cannot escape their workspace through a parent or meeting link", () => {
  const state = createInitialState();
  state.workspaces.push({ ...state.workspaces[0], id: "second-workspace", name: "Another project" });
  state.memberships.push({ ...state.memberships[0], workspaceId: "second-workspace" });
  state.todos[0].workspaceId = "second-workspace";
  assert.equal(isAppState(state), false);
  state.todos[0].meetingIds = [];
  state.todos[0].parentId = state.todos[1].id;
  assert.equal(isAppState(state), false);
  state.todos[0].parentId = null;
  assert.equal(isAppState(state), true);
});

test("malformed imported data is rejected without throwing", () => {
  for (const input of [null, [], {}, { version: 1 }, { ...createInitialState(), todos: [null] }, { ...createInitialState(), user: null }]) {
    assert.equal(isAppState(input), false);
  }
  const state = createInitialState();
  state.meetings[0].recordings.push({
    id: "bad",
    name: "bad.wav",
    mimeType: "audio/wav",
    duration: -1,
    size: 10,
    createdAt: new Date().toISOString(),
  });
  assert.equal(isAppState(state), false);
});
