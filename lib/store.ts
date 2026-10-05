"use client";

import { useSyncExternalStore } from "react";
import { areAppStatesEqual, bindStateToAccount, type Account } from "./account-state";
import { loadAccountState, saveAccountState, type SavedAccountState } from "./database/account-repository";
import { isAppState } from "./validation";
export { isAppState } from "./validation";
import type { AppState, Todo } from "./types";

const LISTENERS = new Set<() => void>();
let state: AppState | null = null;
let account: Account | null = null;
let revision = 0;
let isPending = false;
let isConflicted = false;
let storageError = "";
let syncStatus = "";
let savePromise: Promise<void> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let initializationGeneration = 0;
const emit = () => LISTENERS.forEach((listener) => listener());
const storageKey = (id: string) => `minute.account.${id}.v1`;

function cacheState() {
  if (!state || !account) return;
  try {
    localStorage.setItem(storageKey(account.id), JSON.stringify({ state, revision, isPending }));
  } catch {
    storageError = "Your browser could not cache these changes. Keep this page open until they are saved to Supabase.";
  }
}

function readCache(accountId: string): SavedAccountState | null {
  try {
    const SAVED: unknown = JSON.parse(localStorage.getItem(storageKey(accountId)) || "null");
    if (SAVED && typeof SAVED === "object" && "state" in SAVED && "revision" in SAVED && "isPending" in SAVED &&
      isAppState(SAVED.state) && SAVED.state.user.id === accountId && typeof SAVED.revision === "number" &&
      Number.isInteger(SAVED.revision) && SAVED.revision >= 0 && typeof SAVED.isPending === "boolean") return SAVED as SavedAccountState;
  } catch { /* An invalid cache must never replace database data. */ }
  return null;
}

export async function initializeStore(nextAccount: Account) {
  const GENERATION = ++initializationGeneration;
  account = nextAccount;
  const CACHED = readCache(nextAccount.id);
  let saved: SavedAccountState;
  try {
    if (!navigator.onLine && CACHED) saved = CACHED;
    else {
      const REMOTE = await loadAccountState(nextAccount);
      // The server may have committed a save just before a reload lost its response.
      const IS_ALREADY_SAVED = CACHED?.isPending && REMOTE.revision > 0 &&
        areAppStatesEqual(bindStateToAccount(CACHED.state, nextAccount), REMOTE.state);
      saved = CACHED?.isPending && !IS_ALREADY_SAVED ? CACHED : REMOTE;
      if (GENERATION === initializationGeneration && saved.isPending && saved.revision !== REMOTE.revision) isConflicted = true;
    }
  } catch (error) {
    const IS_NETWORK_FAILURE = !navigator.onLine || (error && typeof error === "object" && "message" in error &&
      typeof error.message === "string" && /fetch|network/i.test(error.message));
    if (!CACHED || !IS_NETWORK_FAILURE) throw new Error("Could not load your workspace. Check Supabase configuration and your connection, then retry.");
    saved = CACHED;
  }
  if (GENERATION !== initializationGeneration) return;
  state = bindStateToAccount(saved.state, nextAccount);
  revision = saved.revision;
  isPending = saved.isPending;
  syncStatus = isConflicted ? "Save conflict. Export your local changes before reloading data from another device." :
    !navigator.onLine ? "Offline. Changes are cached on this device." : isPending ? "Saving to Supabase…" : "Saved to Supabase";
  cacheState();
  emit();
  window.addEventListener("online", retrySave);
  if (isPending && !isConflicted) scheduleSave();
}

function retrySave() { scheduleSave(); }
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { void flushStore().catch(() => {}); }, 250);
}

export async function flushStore(): Promise<void> {
  if (savePromise) { await savePromise; if (isPending) return flushStore(); return; }
  if (!isPending || !state || !account) return;
  if (isConflicted) throw new Error("Export your local changes before resolving the save conflict.");
  if (!navigator.onLine) {
    syncStatus = "Offline. Changes are cached on this device.";
    emit();
    throw new Error(syncStatus);
  }
  const GENERATION = initializationGeneration;
  savePromise = (async () => {
    while (isPending && state && GENERATION === initializationGeneration) {
      const SNAPSHOT = state;
      syncStatus = "Saving to Supabase…";
      emit();
      try {
        const NEXT_REVISION = await saveAccountState(SNAPSHOT, revision);
        if (GENERATION !== initializationGeneration) return;
        revision = NEXT_REVISION;
        isPending = state !== SNAPSHOT;
        syncStatus = isPending ? "Saving to Supabase…" : "Saved to Supabase";
        cacheState();
        emit();
      } catch (error) {
        if (GENERATION !== initializationGeneration) return;
        isConflicted = !!error && typeof error === "object" && "code" in error && error.code === "40001";
        syncStatus = isConflicted ? "Save conflict. Export your local changes before reloading data from another device." :
          "Not synced. Changes are cached on this device. Reconnect to retry.";
        emit();
        if (!isConflicted && navigator.onLine) saveTimer = setTimeout(retrySave, 15_000);
        throw new Error(syncStatus);
      }
    }
  })();
  try { await savePromise; } finally { savePromise = null; }
}

export function resetStore() {
  initializationGeneration++;
  if (saveTimer) clearTimeout(saveTimer);
  window.removeEventListener("online", retrySave);
  if (account) { try { localStorage.removeItem(storageKey(account.id)); } catch { /* Storage may be blocked. */ } }
  state = null;
  account = null;
  revision = 0;
  isPending = false;
  isConflicted = false;
  syncStatus = "";
  storageError = "";
  emit();
}

export function mutate(updater: (current: AppState) => AppState) {
  if (!state || !account) return;
  const NEXT_STATE = bindStateToAccount(updater(state), account);
  if (!isAppState(NEXT_STATE)) { storageError = "These changes are not valid Minute data."; emit(); return; }
  state = NEXT_STATE;
  isPending = true;
  cacheState();
  syncStatus = isConflicted ? syncStatus : navigator.onLine ? "Saving to Supabase…" : "Offline. Changes are cached on this device.";
  emit();
  if (!isConflicted) scheduleSave();
}

export function useSyncStatus() {
  return useSyncExternalStore(subscribe, () => syncStatus, () => "");
}
function subscribe(listener: () => void) { LISTENERS.add(listener); return () => { LISTENERS.delete(listener); }; }

export function takeStorageError() {
  const message = storageError;
  storageError = "";
  return message;
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

// Explicitly discards the local draft only after the UI confirms that choice.
export async function reloadStoreFromDatabase() {
  if (!account) return;
  const GENERATION = initializationGeneration;
  const REMOTE = await loadAccountState(account);
  if (GENERATION !== initializationGeneration) return;
  state = REMOTE.state;
  revision = REMOTE.revision;
  isPending = REMOTE.isPending;
  isConflicted = false;
  syncStatus = "Saved to Supabase";
  cacheState();
  emit();
  if (isPending) scheduleSave();
}
