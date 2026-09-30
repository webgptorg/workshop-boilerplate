"use client";

import { useSyncExternalStore } from "react";
import { authenticatedFetch } from "./supabase/browser";
import { bindAccountIdentity } from "./account-state";
import { SaveQueue, SaveConflictError, type SaveStatus } from "./save-queue";
import { isAppState } from "./validation";
export { isAppState } from "./validation";
import type { AppState, Todo } from "./types";

const LISTENERS = new Set<() => void>();
const EMPTY_STATUS: SaveStatus = { isSaving: false, isDirty: false, isConflict: false, error: "" };
let state: AppState | null = null;
let queue: SaveQueue<AppState> | null = null;
let generation = 0;
const emit = () => LISTENERS.forEach((listener) => listener());

export async function initializeStore() {
  const activeGeneration = ++generation;
  const response = await authenticatedFetch("/api/data");
  if (!response.ok) throw new Error("Could not load your account. Check your connection and sign-in status.");
  let payload = await response.json();
  if (activeGeneration !== generation) return;
  if (!isAppState(payload.state) || !Number.isSafeInteger(payload.revision) || payload.revision < 0) {
    throw new Error("Your saved account data is invalid. Contact the administrator.");
  }
  if (payload.revision === 0) {
    const preferredLanguage = navigator.languages?.find((language) => /^(cs|en)(-|$)/i.test(language));
    payload.state.user.language = preferredLanguage?.toLowerCase().startsWith("cs") ? "cs" : "en";
    const initial = await authenticatedFetch("/api/data", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: payload.state, revision: 0 }),
    }, payload.state.user.id);
    if (initial.status === 409) {
      // Another tab/device may have initialized this account first.
      const latest = await authenticatedFetch("/api/data");
      if (!latest.ok) throw new Error("Could not load your account.");
      payload = await latest.json();
    } else {
      if (!initial.ok) throw new Error("Could not create your account workspace.");
      payload.revision = (await initial.json()).revision;
    }
  }
  if (!isAppState(payload.state) || !Number.isSafeInteger(payload.revision) || payload.revision < 1) {
    throw new Error("Your saved account data is invalid.");
  }
  if (activeGeneration !== generation) return;
  const initialState = payload.state;
  state = initialState;
  queue?.dispose();
  queue = new SaveQueue<AppState>(initialState, payload.revision, saveState, emit);
  emit();
}

async function saveState(snapshot: AppState, revision: number): Promise<number> {
  const response = await authenticatedFetch("/api/data", {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: snapshot, revision }),
  }, snapshot.user.id);
  if (response.status === 409) throw new SaveConflictError("Another tab or device changed your data. Export a backup, then reload to use the latest version.");
  if (!response.ok) throw new Error("Changes are not saved. Check your connection and retry before leaving this page.");
  const result = await response.json();
  if (!Number.isSafeInteger(result.revision) || result.revision !== revision + 1) throw new Error("The server returned an invalid save revision.");
  return result.revision;
}

export function resetStore() {
  generation++;
  queue?.dispose();
  queue = null;
  state = null;
  emit();
}

export function mutate(updater: (current: AppState) => AppState) {
  if (!state || !queue) return;
  const nextState = bindAccountIdentity(updater(state), state.user);
  if (!isAppState(nextState)) throw new Error("This change would create invalid account data.");
  state = nextState;
  queue.update(state);
  emit();
}

// Async recording/processing callbacks retain their originating account, even after sign-out.
export function createAccountMutator(userId: string) {
  return (updater: (current: AppState) => AppState) => {
    if (state?.user.id !== userId) throw new Error("The signed-in account changed. Reload before continuing.");
    mutate(updater);
  };
}

export function flushStore() { return queue?.flush() ?? Promise.resolve(true); }
export function hasUnsavedChanges() { return queue?.status.isDirty ?? false; }
export function useSaveStatus() {
  return useSyncExternalStore(subscribe, () => queue?.status ?? EMPTY_STATUS, () => EMPTY_STATUS);
}
function subscribe(listener: () => void) {
  LISTENERS.add(listener);
  return () => { LISTENERS.delete(listener); };
}

export function useAppState() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => null,
  );
}

export function toggleTodo(id: string) {
  mutate((current) => ({
    ...current,
    todos: current.todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
  }));
}

export function removeTodo(id: string) {
  mutate((current) => ({
    ...current,
    todos: current.todos.filter((todo) => todo.id !== id).map((todo) => (todo.parentId === id ? { ...todo, parentId: null } : todo)),
  }));
}

export function updateTodo(id: string, patch: Partial<Todo>) {
  mutate((current) => ({ ...current, todos: current.todos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo)) }));
}
