import { readStoredValue, writeStoredValue } from "./localStorageAccess";

export interface StoredSnapshot<TValue> {
  readonly value: TValue;
  /** `false` only for the snapshot rendered on the server and during hydration */
  readonly isHydrated: boolean;
}

interface StoredEntry<TValue> {
  snapshot: StoredSnapshot<TValue>;
  serverSnapshot: StoredSnapshot<TValue>;
  readonly listeners: Set<() => void>;
}

const entries = new Map<string, StoredEntry<unknown>>();

function loadInitialSnapshot<TValue>(key: string, initialValue: TValue): StoredSnapshot<TValue> {
  try {
    const storedValue = readStoredValue<TValue>(key);
    return { value: storedValue === undefined ? initialValue : storedValue, isHydrated: true };
  } catch (error) {
    console.error(error);
    return { value: initialValue, isHydrated: true };
  }
}

/**
 * Entry of the in-memory store, created on the first access to the key.
 * The stored value is read from the local storage only once.
 */
function getEntry<TValue>(key: string, initialValue: TValue): StoredEntry<TValue> {
  const existingEntry = entries.get(key) as StoredEntry<TValue> | undefined;

  if (existingEntry) {
    return existingEntry;
  }

  const createdEntry: StoredEntry<TValue> = {
    snapshot: loadInitialSnapshot(key, initialValue),
    serverSnapshot: { value: initialValue, isHydrated: false },
    listeners: new Set(),
  };
  entries.set(key, createdEntry as StoredEntry<unknown>);
  return createdEntry;
}

export function getStoredSnapshot<TValue>(key: string, initialValue: TValue): StoredSnapshot<TValue> {
  return getEntry(key, initialValue).snapshot;
}

export function getStoredServerSnapshot<TValue>(key: string, initialValue: TValue): StoredSnapshot<TValue> {
  return getEntry(key, initialValue).serverSnapshot;
}

export function subscribeToStoredValue(key: string, listener: () => void): () => void {
  const entry = entries.get(key);

  if (!entry) {
    return () => undefined;
  }

  entry.listeners.add(listener);
  return () => entry.listeners.delete(listener);
}

/**
 * Stores the value, updates the snapshot and notifies every subscribed component.
 */
export function updateStoredValue<TValue>(key: string, initialValue: TValue, update: (previous: TValue) => TValue): void {
  const entry = getEntry(key, initialValue);
  const nextValue = update(entry.snapshot.value);

  writeStoredValue(key, nextValue);
  entry.snapshot = { value: nextValue, isHydrated: true };
  entry.listeners.forEach((listener) => listener());
}
