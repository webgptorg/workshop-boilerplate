import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const MIGRATION_FILENAME = /^\d{4}-(?:0[1-9]|1[0-2])-\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.sql$/;

export interface Migration {
  filename: string;
  checksum: string;
  sql: string;
}

export async function readMigrations(directory: string): Promise<Migration[]> {
  const filenames = (await readdir(directory)).filter((filename) => filename.endsWith(".sql")).sort();
  if (!filenames.length) throw new Error("No SQL migrations found.");
  const versions = new Set<string>();
  return Promise.all(filenames.map(async (filename) => {
    if (!MIGRATION_FILENAME.test(filename)) throw new Error(`Invalid migration filename: ${filename}`);
    const version = filename.slice(0, 12);
    if (versions.has(version)) throw new Error(`Duplicate migration version: ${version}`);
    versions.add(version);
    const sql = await readFile(join(directory, filename), "utf8");
    // Transaction control belongs to the runner. SQL must not commit part of a batch.
    if (/(?:^|;)\s*(?:begin|commit|rollback|start\s+transaction|prepare\s+transaction|end|abort)\b/i.test(stripSqlBodies(sql))) {
      throw new Error(`Transaction control is not allowed in migration: ${filename}`);
    }
    return { filename, sql, checksum: createHash("sha256").update(sql).digest("hex") };
  }));
}

function stripSqlBodies(sql: string) {
  return sql.replace(/\$(\w*)\$[\s\S]*?\$\1\$|'(?:''|[^'])*'|--[^\n]*|\/\*[\s\S]*?\*\//g, "");
}

export function pendingMigrations(migrations: Migration[], applied: { filename: string; checksum: string }[]) {
  for (const [index, record] of applied.entries()) {
    const migration = migrations[index];
    if (!migration || migration.filename !== record.filename || migration.checksum !== record.checksum) {
      throw new Error(`Migration history changed at ${record.filename}. Restore applied files and add a new migration.`);
    }
  }
  return migrations.slice(applied.length);
}
