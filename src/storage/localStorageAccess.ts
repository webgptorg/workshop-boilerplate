import { spaceTrim } from "spacetrim";
import { StorageError } from "@/errors";

function isLocalStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Reads a JSON value from the local storage.
 *
 * @returns the parsed value, or `undefined` when nothing is stored
 * @throws {StorageError} when the stored text is not valid JSON
 */
export function readStoredValue<TValue>(key: string): TValue | undefined {
  if (!isLocalStorageAvailable()) {
    return undefined;
  }

  const rawValue = window.localStorage.getItem(key);

  if (rawValue === null) {
    return undefined;
  }

  try {
    return JSON.parse(rawValue) as TValue;
  } catch (error) {
    throw new StorageError(
      spaceTrim(`
        Hodnota uložená pod klíčem \`${key}\` není platný JSON.

        **Uložený text:** \`${rawValue.slice(0, 80)}\`
        Původní chyba: ${error instanceof Error ? error.message : String(error)}
      `),
    );
  }
}

/**
 * Writes a JSON value into the local storage.
 *
 * @throws {StorageError} when the browser refuses to store the value
 */
export function writeStoredValue<TValue>(key: string, value: TValue): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new StorageError(
      spaceTrim(`
        Hodnotu pod klíčem \`${key}\` se nepodařilo uložit do local storage.

        Původní chyba: ${error instanceof Error ? error.message : String(error)}
      `),
    );
  }
}

export function removeStoredValue(key: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(key);
}
