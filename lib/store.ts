"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "./supabase/client";
import { createAccountState, bindAccount } from "./account-state";
import { isAppState } from "./validation";
export { isAppState } from "./validation";
import type { AppState, Todo, User } from "./types";

type StoreStatus = "loading" | "signed-out" | "ready" | "error";
let state: AppState | null = null;
let status: StoreStatus = "loading";
let revision = 0;
let accountId = "";
let initialized = false;
let pendingSave = Promise.resolve();
let storageError = "";
let savedProfile = "";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

async function loadAccount() {
  const supabase = createClient();
  const { data: authentication, error: authenticationError } = await supabase.auth.getUser();
  if (authenticationError && authenticationError.name !== "AuthSessionMissingError") throw authenticationError;
  if (!authentication.user) {
    accountId = "";
    state = null;
    status = "signed-out";
    emit();
    return;
  }
  const userId = authentication.user.id;
  const { data: profile, error: profileError } = await supabase.from("profiles").select("name,email,language,theme").eq("id", userId).single();
  if (profileError || !profile) throw profileError ?? new Error("Profile is missing.");
  const user: User = {
    id: userId, name: profile.name || authentication.user.email?.split("@")[0] || "User", email: profile.email,
    language: profile.language === "cs" ? "cs" : "en",
    theme: profile.theme === "dark" || profile.theme === "system" ? profile.theme : "light",
  };
  const { data: existingRow, error } = await supabase.from("app_states").select("state,revision").eq("user_id", userId).maybeSingle();
  let row = existingRow;
  if (error) throw error;
  if (!row) {
    const initial = createAccountState(user);
    const inserted = await supabase.from("app_states").insert({ user_id: userId, state: initial }).select("state,revision").single();
    if (inserted.error) {
      const retry = await supabase.from("app_states").select("state,revision").eq("user_id", userId).single();
      if (retry.error) throw retry.error;
      row = retry.data;
    } else row = inserted.data;
  }
  if (!isAppState(row.state) || row.state.user.id !== userId) throw new Error("Saved data is invalid. Contact support before changing it.");
  accountId = userId;
  revision = Number(row.revision);
  savedProfile = JSON.stringify([user.name, user.language, user.theme]);
  state = bindAccount(row.state, user);
  status = "ready";
  emit();
}

export function initializeStore() {
  if (initialized) return;
  initialized = true;
  try {
    const supabase = createClient();
    supabase.auth.onAuthStateChange(() => { setTimeout(() => { void refreshStore(); }, 0); });
    void refreshStore();
  } catch (error) {
    status = "error";
    storageError = error instanceof Error ? error.message : "Supabase is not configured.";
    emit();
  }
}

export async function refreshStore() {
  try {
    await pendingSave;
    await loadAccount();
  } catch (error) {
    status = "error";
    storageError = error instanceof Error ? error.message : "Could not load your data.";
    emit();
  }
}

async function persist(snapshot: AppState, userId: string) {
  if (accountId !== userId) return;
  const supabase = createClient();
  const result = await supabase.from("app_states")
    .update({ state: snapshot, revision: revision + 1, updated_at: new Date().toISOString() })
    .eq("user_id", userId).eq("revision", revision).select("revision").maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) {
    storageError = "Your data changed on another device. Reload to review the latest version before editing.";
    status = "error";
    emit();
    return;
  }
  revision = Number(result.data.revision);
  const profile = JSON.stringify([snapshot.user.name, snapshot.user.language, snapshot.user.theme]);
  if (profile !== savedProfile) {
    const profileResult = await supabase.from("profiles").update({ name: snapshot.user.name, language: snapshot.user.language, theme: snapshot.user.theme }).eq("id", userId);
    if (profileResult.error) throw profileResult.error;
    savedProfile = profile;
  }
}

export function mutate(updater: (current: AppState) => AppState) {
  if (!state || status !== "ready") return;
  const next = updater(state);
  if (!isAppState(next) || next.user.id !== accountId) {
    storageError = "The change was rejected because its data is invalid.";
    status = "error";
    emit();
    return;
  }
  state = next;
  emit();
  const userId = accountId;
  pendingSave = pendingSave.then(() => persist(next, userId)).catch((error: unknown) => {
    storageError = error instanceof Error ? `Could not save: ${error.message}` : "Could not save your changes.";
    status = "error";
    emit();
  });
}

export async function signOut() {
  await pendingSave;
  const { error } = await createClient().auth.signOut();
  if (error) throw error;
  accountId = "";
  state = null;
  status = "signed-out";
  emit();
}

export function takeStorageError() {
  const message = storageError;
  storageError = "";
  return message;
}
export function readStorageError() { return storageError; }

export function useAppState() { return useSyncExternalStore(subscribe, () => state, () => null); }
export function useStoreStatus() { return useSyncExternalStore(subscribe, () => status, () => "loading"); }

export function toggleTodo(id: string) {
  mutate((current) => ({ ...current, todos: current.todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo) }));
}
export function removeTodo(id: string) {
  mutate((current) => ({ ...current, todos: current.todos.filter((todo) => todo.id !== id).map((todo) => todo.parentId === id ? { ...todo, parentId: null } : todo) }));
}
export function updateTodo(id: string, patch: Partial<Todo>) {
  mutate((current) => ({ ...current, todos: current.todos.map((todo) => todo.id === id ? { ...todo, ...patch } : todo) }));
}
