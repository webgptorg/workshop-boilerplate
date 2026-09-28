import assert from "node:assert/strict";
import test from "node:test";
import { createAccountState, bindAccount } from "../lib/account-state";
import { createInitialState } from "../lib/seed";
import { isAppState } from "../lib/validation";

const USER = { id: "fc805742-533c-4213-87d1-f47f90d3c3ac", name: "New User", email: "new@example.com", language: "cs" as const, theme: "light" as const };

test("a new authenticated account starts with an isolated, valid workspace", () => {
  const state = createAccountState(USER);
  assert.equal(isAppState(state), true);
  assert.equal(state.user.id, USER.id);
  assert.notEqual(state.workspaces[0].id, createInitialState().workspaces[0].id);
  assert.deepEqual(state.meetings, []);
  assert.deepEqual(state.todos, []);
});

test("restored data is bound to the signed-in account", () => {
  const restored = bindAccount(createInitialState(), USER);
  assert.equal(isAppState(restored), true);
  assert.equal(restored.memberships[0].userId, USER.id);
  assert.equal(restored.user.email, USER.email);
});
