import assert from "node:assert/strict";
import test from "node:test";
import { bindAccountIdentity, createAccountState } from "../lib/account-state";
import { createInitialState } from "../lib/seed";
import { isAppState } from "../lib/validation";

const IDENTITY = { id: "dc2d9369-d2eb-4504-bb14-d7206fbca5a1", email: "someone@example.com", name: "Someone" };

test("a new account has its own identity and empty workspace without demo meetings", () => {
  const state = createAccountState(IDENTITY);
  assert.equal(isAppState(state), true);
  assert.equal(state.user.id, IDENTITY.id);
  assert.equal(state.user.name, IDENTITY.name);
  assert.equal(state.meetings.length, 0);
  assert.equal(state.todos.length, 0);
});

test("restoring a legacy backup preserves domain data and uses the authenticated identity", () => {
  const original = createInitialState();
  const restored = bindAccountIdentity(original, IDENTITY);
  assert.equal(isAppState(restored), true);
  assert.equal(restored.user.email, IDENTITY.email);
  assert.ok(restored.memberships.every((membership) => membership.userId === IDENTITY.id));
  assert.deepEqual(restored.meetings, original.meetings);
  assert.notEqual(original.user.id, IDENTITY.id);
});

test("binding identity preserves edited profile preferences even when given a full user object", () => {
  const state = createAccountState(IDENTITY);
  const edited = { ...state, user: { ...state.user, name: "Changed", language: "cs" as const, theme: "dark" as const } };
  const bound = bindAccountIdentity(edited, state.user);
  assert.equal(bound.user.name, "Changed");
  assert.equal(bound.user.language, "cs");
  assert.equal(bound.user.theme, "dark");
});
