import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export interface Migration { name: string; checksum: string; sql: string }
export interface AppliedMigration { name: string; checksum: string }
const MIGRATION_NAME = /^\d{4}-(0[1-9]|1[0-2])-\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.sql$/;

export async function readMigrations(directory: string): Promise<Migration[]> {
  const NAMES = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  if (!NAMES.length) throw new Error("No database migrations found.");
  const VERSIONS = new Set<string>();
  return Promise.all(NAMES.map(async (name) => {
    const VERSION = name.slice(0, 12);
    if (!MIGRATION_NAME.test(name) || VERSIONS.has(VERSION)) throw new Error(`Invalid or duplicate migration version: ${name}`);
    VERSIONS.add(VERSION);
    const SQL = await readFile(join(directory, name), "utf8");
    // The runner owns the single transaction around every pending migration.
    if (/^\s*(?:begin|commit|rollback)\s*;/im.test(SQL)) throw new Error(`Migration must not control transactions: ${name}`);
    return { name, checksum: createHash("sha256").update(SQL).digest("hex"), sql: SQL };
  }));
}

export function pendingMigrations(migrations: Migration[], applied: AppliedMigration[]) {
  for (const MIGRATION of applied) {
    if (migrations.find((item) => item.name === MIGRATION.name)?.checksum !== MIGRATION.checksum)
      throw new Error(`Applied migration was changed or removed: ${MIGRATION.name}`);
  }
  const APPLIED_NAMES = new Set(applied.map((item) => item.name));
  const LATEST_NAME = applied.map((item) => item.name).sort().at(-1);
  const PENDING = migrations.filter((item) => !APPLIED_NAMES.has(item.name));
  if (LATEST_NAME && PENDING.some((item) => item.name < LATEST_NAME)) throw new Error("New migrations must follow applied migrations.");
  return PENDING;
}
