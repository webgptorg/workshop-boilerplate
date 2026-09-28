"use client";

import { useSyncExternalStore } from "react";
import { createInitialState } from "./seed";
import { isAppState } from "./validation";
export { isAppState } from "./validation";
import type { AppState, Todo } from "./types";

const STORAGE_KEY = "minute.workspace.v1";
let state: AppState | null = null;
const listeners = new Set<() => void>();
let storageError = "";
const emit = () => listeners.forEach((listener) => listener());

export function initializeStore() {
  if (state) return;
  const initial = createInitialState();
  initial.user.language = navigator.languages?.find((language) => /^(cs|en)(-|$)/i.test(language))?.startsWith("cs") ? "cs" : "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    state = isAppState(parsed) ? parsed : initial;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    state = initial;
    storageError = "Browser storage is unavailable. Changes will only last for this session.";
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const incoming: unknown = JSON.parse(event.newValue);
      if (isAppState(incoming)) {
        state = incoming;
        emit();
      }
    } catch {
      /* Ignore incomplete data from other tabs. */
    }
  });
  emit();
}

export function mutate(updater: (current: AppState) => AppState) {
  if (!state) return;
  state = updater(state);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    storageError = "Your browser could not save these changes. Export your data from Settings.";
  }
  emit();
}

export function takeStorageError() {
  const message = storageError;
  storageError = "";
  return message;
}

export function useAppState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
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
