import { StorageError } from "../errors";
import { parseStoredDocument, serializeStoredDocument } from "./stored-document";

const STORAGE_KEY_PREFIX = "spolecny-stul";

export type StoreListener = () => void;

/**
 * Small typed wrapper around one `localStorage` key.
 *
 * `read` returns a referentially stable value as long as the stored string does not change,
 * which makes the store usable with `useSyncExternalStore`.
 */
export type LocalStorageStore<TValue> = {
  readonly key: string;
  read(): TValue;
  write(value: TValue): void;
  update(updater: (currentValue: TValue) => TValue): void;
  reset(): void;
  subscribe(listener: StoreListener): () => void;
  getDefaultValue(): TValue;
};

export type LocalStorageStoreOptions<TValue> = {
  readonly name: string;
  readonly version: number;
  readonly defaultValue: TValue;
};

const ALL_STORES: LocalStorageStore<unknown>[] = [];

function isLocalStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function createLocalStorageStore<TValue>(
  options: LocalStorageStoreOptions<TValue>,
): LocalStorageStore<TValue> {
  const { name, version, defaultValue } = options;
  const key = `${STORAGE_KEY_PREFIX}/v${version}/${name}`;
  const listeners = new Set<StoreListener>();

  let cachedRaw: string | null = null;
  let cachedValue: TValue = defaultValue;

  function notifyListeners(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function read(): TValue {
    if (!isLocalStorageAvailable()) {
      return defaultValue;
    }

    const raw = window.localStorage.getItem(key);

    if (raw === null) {
      cachedRaw = null;
      cachedValue = defaultValue;
      return defaultValue;
    }

    if (raw === cachedRaw) {
      return cachedValue;
    }

    try {
      cachedValue = parseStoredDocument<TValue>(raw, version, key);
    } catch (error) {
      if (!(error instanceof StorageError)) {
        throw error;
      }

      // The data is unusable; say it out loud in the console and fall back to the defaults.
      console.error(error);
      cachedValue = defaultValue;
    }

    cachedRaw = raw;
    return cachedValue;
  }

  function write(value: TValue): void {
    if (!isLocalStorageAvailable()) {
      return;
    }

    const raw = serializeStoredDocument(value, version);
    window.localStorage.setItem(key, raw);
    cachedRaw = raw;
    cachedValue = value;
    notifyListeners();
  }

  function update(updater: (currentValue: TValue) => TValue): void {
    write(updater(read()));
  }

  function reset(): void {
    if (!isLocalStorageAvailable()) {
      return;
    }

    window.localStorage.removeItem(key);
    cachedRaw = null;
    cachedValue = defaultValue;
    notifyListeners();
  }

  function subscribe(listener: StoreListener): () => void {
    listeners.add(listener);

    // Changes made in another browser tab arrive through the `storage` event.
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        listener();
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }

  const store: LocalStorageStore<TValue> = {
    key,
    read,
    write,
    update,
    reset,
    subscribe,
    getDefaultValue: () => defaultValue,
  };

  ALL_STORES.push(store);

  return store;
}

/**
 * Removes every value the app has persisted, so the seeded demo data is used again.
 */
export function resetAllStores(): void {
  for (const store of ALL_STORES) {
    store.reset();
  }
}
