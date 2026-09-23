import spaceTrim from "spacetrim";
import { StorageError } from "../errors";

/**
 * Envelope around every value persisted in the browser storage.
 *
 * The version lets us throw away (or later migrate) data written by an older build of the app.
 */
export type StoredDocument<TValue> = {
  readonly version: number;
  readonly value: TValue;
};

export function serializeStoredDocument<TValue>(value: TValue, version: number): string {
  const document: StoredDocument<TValue> = { version, value };
  return JSON.stringify(document);
}

export function parseStoredDocument<TValue>(
  raw: string,
  expectedVersion: number,
  storageKey: string,
): TValue {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new StorageError(
      spaceTrim(`
        Stored document under the key \`${storageKey}\` is not valid JSON.

        **Parse error:** ${error instanceof Error ? error.message : String(error)}
      `),
    );
  }

  if (typeof parsed !== "object" || parsed === null || !("version" in parsed) || !("value" in parsed)) {
    throw new StorageError(
      spaceTrim(`
        Stored document under the key \`${storageKey}\` does not have the expected shape.

        Expected an object with \`version\` and \`value\` properties.
      `),
    );
  }

  const document = parsed as StoredDocument<TValue>;

  if (document.version !== expectedVersion) {
    throw new StorageError(
      spaceTrim(`
        Stored document under the key \`${storageKey}\` was written by a different version of the app.

        - Stored version: \`${document.version}\`
        - Expected version: \`${expectedVersion}\`

        **Note:** The stored value is ignored and the default value is used instead.
      `),
    );
  }

  return document.value;
}
