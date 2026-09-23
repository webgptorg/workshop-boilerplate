"use client";

import { useCallback, useSyncExternalStore, type SetStateAction } from "react";
import {
  getStoredServerSnapshot,
  getStoredSnapshot,
  subscribeToStoredValue,
  updateStoredValue,
} from "./storedValueStore";

export interface StoredValueState<TValue> {
  readonly value: TValue;
  readonly setValue: (update: SetStateAction<TValue>) => void;
  /** `false` until the value was read from the browser storage */
  readonly isHydrated: boolean;
}

function resolveUpdate<TValue>(update: SetStateAction<TValue>, previousValue: TValue): TValue {
  return typeof update === "function" ? (update as (previous: TValue) => TValue)(previousValue) : update;
}

/**
 * React state persisted in the local storage and shared by every component
 * which uses the same key.
 *
 * The initial value is rendered on the server and during hydration,
 * the stored value replaces it right after.
 */
export function useStoredValue<TValue>(key: string, initialValue: TValue): StoredValueState<TValue> {
  const snapshot = useSyncExternalStore(
    useCallback((listener: () => void) => subscribeToStoredValue(key, listener), [key]),
    () => getStoredSnapshot(key, initialValue),
    () => getStoredServerSnapshot(key, initialValue),
  );

  const setValue = useCallback(
    (update: SetStateAction<TValue>) => {
      updateStoredValue(key, initialValue, (previousValue) => resolveUpdate(update, previousValue));
    },
    [key, initialValue],
  );

  return { value: snapshot.value, setValue, isHydrated: snapshot.isHydrated };
}
