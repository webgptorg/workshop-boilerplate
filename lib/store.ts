"use client";

import { useSyncExternalStore } from "react";
import { authenticatedFetch } from "./supabase/browser";
import { bindAccount } from "./account";
import { isAppState } from "./validation";
export { isAppState } from "./validation";
import type { AppState, Todo } from "./types";

let state: AppState | null = null;
let savedState: AppState | null = null;
let revision = 0;
let generation = 0;
let saving: Promise<void> | null = null;
let persistence = { isSaving: false, error: "", isConflict: false };
const LISTENERS = new Set<() => void>();
const emit = () => LISTENERS.forEach((listener) => listener());
const subscribe = (listener: () => void) => { LISTENERS.add(listener); return () => { LISTENERS.delete(listener); }; };
const EMPTY_PERSISTENCE = { isSaving: false, error: "", isConflict: false };

export function resetStore() {
  generation += 1;
  state = savedState = null;
  revision = 0;
  saving = null;
  persistence = EMPTY_PERSISTENCE;
  emit();
}

export async function initializeStore(expectedUserId: string) {
  const currentGeneration = generation;
  const response = await authenticatedFetch("/api/state", {}, expectedUserId);
  const result = await response.json();
  if (!response.ok || !isAppState(result.state) || !Number.isSafeInteger(result.revision)) {
    throw new Error("Could not load your account. Check your connection and try again.");
  }
  if (generation !== currentGeneration) return;
  state = savedState = result.state;
  revision = result.revision;
  emit();
}

export function hasUnsavedChanges() { return state !== savedState; }

export function saveChanges(): Promise<void> {
  if (saving) return saving;
  if (!state || !hasUnsavedChanges() || persistence.isConflict) return Promise.resolve();
  const currentGeneration = generation;
  persistence = { isSaving: true, error: "", isConflict: false };
  emit();
  saving = (async () => {
    try {
      while (state && state !== savedState && currentGeneration === generation) {
        const pendingState = state;
        const response = await authenticatedFetch("/api/state", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: pendingState, revision }),
        }, pendingState.user.id);
        if (currentGeneration !== generation) return;
        if (response.status === 409) {
          persistence = { isSaving: false, isConflict: true, error: "Another tab or device changed this account. Export your unsaved work before reloading." };
          return;
        }
        if (!response.ok) throw new Error("Save failed");
        const result = await response.json();
        if (currentGeneration !== generation) return;
        if (!Number.isSafeInteger(result.revision)) throw new Error("Invalid revision");
        revision = result.revision;
        savedState = pendingState;
      }
    } catch {
      if (currentGeneration === generation) persistence = { isSaving: false, isConflict: false, error: "Changes are not saved. Keep this page open and retry, or export a backup." };
    } finally {
      if (currentGeneration === generation) {
        saving = null;
        persistence = { ...persistence, isSaving: false };
        emit();
      }
    }
  })();
  return saving;
}

export function mutate(updater: (current: AppState) => AppState, expectedUserId?: string) {
  if (expectedUserId && state?.user.id !== expectedUserId) throw new Error("The active account changed. Please sign in again.");
  if (!state) return;
  const updated = bindAccount(updater(state), state.user);
  if (!isAppState(updated)) throw new Error("Invalid workspace data.");
  state = updated;
  emit();
  void saveChanges();
}

export function usePersistence() { return useSyncExternalStore(subscribe, () => persistence, () => EMPTY_PERSISTENCE); }
export function useAppState() { return useSyncExternalStore(subscribe, () => state, () => null); }

export function toggleTodo(id: string) {
  mutate((current) => ({ ...current, todos: current.todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo) }));
}
export function removeTodo(id: string) {
  mutate((current) => ({ ...current, todos: current.todos.filter((todo) => todo.id !== id).map((todo) => todo.parentId === id ? { ...todo, parentId: null } : todo) }));
}
export function updateTodo(id: string, patch: Partial<Todo>) {
  mutate((current) => ({ ...current, todos: current.todos.map((todo) => todo.id === id ? { ...todo, ...patch } : todo) }));
}
