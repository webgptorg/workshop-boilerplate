import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import type { Session } from "@supabase/supabase-js";
import { createAccountState } from "../lib/account";
import { browserSupabase } from "../lib/supabase/browser";
import { hasUnsavedChanges, initializeStore, mutate, resetStore, saveChanges } from "../lib/store";

const ACCOUNT_ID = "10000000-0000-0000-0000-000000000001";
const INITIAL_STATE = createAccountState({ id: ACCOUNT_ID, email: "one@example.com" });
const SESSION: Session = {
  access_token: "test-token", refresh_token: "test-refresh", expires_in: 3600, token_type: "bearer",
  user: { id: ACCOUNT_ID, email: "one@example.com", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "2026-09-29T00:00:00Z" },
};

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-public-key";
  mock.method(browserSupabase().auth, "getSession", async () => ({ data: { session: SESSION }, error: null }));
  resetStore();
});
afterEach(() => { resetStore(); mock.restoreAll(); });

const loadedResponse = () => Response.json({ state: INITIAL_STATE, revision: 1 });

test("saves are serialized and include changes made during an in-flight save", async () => {
  const writes: { revision: number; state: typeof INITIAL_STATE }[] = [];
  let completeFirstWrite: ((response: Response) => void) | undefined;
  mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
    if (options?.method !== "PUT") return loadedResponse();
    writes.push(JSON.parse(String(options.body)));
    if (writes.length === 1) return new Promise<Response>((resolve) => { completeFirstWrite = resolve; });
    return Response.json({ revision: 3 });
  });
  await initializeStore(ACCOUNT_ID);
  mutate((state) => ({ ...state, user: { ...state.user, name: "First" } }));
  await new Promise((resolve) => setImmediate(resolve));
  mutate((state) => ({ ...state, user: { ...state.user, name: "Second" } }));
  assert.equal(writes.length, 1);
  assert.equal(hasUnsavedChanges(), true);
  completeFirstWrite?.(Response.json({ revision: 2 }));
  await saveChanges();
  assert.deepEqual(writes.map((write) => write.revision), [1, 2]);
  assert.equal(writes[1].state.user.name, "Second");
  assert.equal(hasUnsavedChanges(), false);
});

test("failed saves retain pending changes and can be retried", async () => {
  let isFailing = true;
  mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
    if (options?.method !== "PUT") return loadedResponse();
    if (isFailing) throw new Error("offline");
    return Response.json({ revision: 2 });
  });
  await initializeStore(ACCOUNT_ID);
  mutate((state) => ({ ...state, onboardingDismissed: true }));
  await saveChanges();
  assert.equal(hasUnsavedChanges(), true);
  isFailing = false;
  await saveChanges();
  assert.equal(hasUnsavedChanges(), false);
});

test("a conflict preserves edits and never retries an overwrite automatically", async () => {
  let writes = 0;
  mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
    if (options?.method !== "PUT") return loadedResponse();
    writes += 1;
    return Response.json({ error: "conflict" }, { status: 409 });
  });
  await initializeStore(ACCOUNT_ID);
  mutate((state) => ({ ...state, onboardingDismissed: true }));
  await saveChanges();
  await saveChanges();
  assert.equal(writes, 1);
  assert.equal(hasUnsavedChanges(), true);
});

test("account changes cannot send the previous account's data with a new session", async () => {
  let writes = 0;
  mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
    if (options?.method === "PUT") writes += 1;
    return loadedResponse();
  });
  await initializeStore(ACCOUNT_ID);
  mock.method(browserSupabase().auth, "getSession", async () => ({ data: { session: { ...SESSION, user: { ...SESSION.user, id: "another-account" } } }, error: null }));
  mutate((state) => ({ ...state, onboardingDismissed: true }));
  await saveChanges();
  assert.throws(() => mutate((state) => state, "another-account"), /account changed/);
  assert.equal(writes, 0);
  assert.equal(hasUnsavedChanges(), true);
});
