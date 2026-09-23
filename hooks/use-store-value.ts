import { useSyncExternalStore } from "react";
import type { LocalStorageStore } from "@/lib/storage";

/**
 * Subscribes a component to a browser storage store.
 *
 * During server rendering and hydration the default value is used; the persisted value
 * takes over right after hydration.
 */
export function useStoreValue<TValue>(store: LocalStorageStore<TValue>): TValue {
  return useSyncExternalStore(store.subscribe, store.read, store.getDefaultValue);
}
