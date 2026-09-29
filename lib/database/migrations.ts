import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface Migration { name: string; checksum: string; sql: string }
export interface MigrationConnection {
  query(sql: string, values?: string[]): Promise<{ rows: { name: string; checksum: string }[] }>;
}
const MIGRATION_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.sql$/;

export async function readMigrations(directory: string): Promise<Migration[]> {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  if (!names.length) throw new Error("No database migrations found.");
  const versions = new Set<string>();
  return Promise.all(names.map(async (name) => {
    const version = name.slice(0, 12);
    if (!MIGRATION_PATTERN.test(name) || versions.has(version)) throw new Error(`Invalid or duplicate migration: ${name}`);
    versions.add(version);
    const sql = await readFile(path.join(directory, name), "utf8");
    // Ignore quoted bodies, strings, identifiers and comments when checking transaction control.
    const statements = sql.replace(/\$([a-zA-Z_][\w]*|)\$[\s\S]*?\$\1\$|'(?:''|[^'])*'|"(?:""|[^"])*"|--[^\n]*|\/\*[\s\S]*?\*\//g, " ");
    if (/(?:^|;)\s*(?:begin|commit|end|rollback|abort|start\s+transaction|prepare\s+transaction)\b/i.test(statements)) {
      throw new Error(`Migration must not control transactions: ${name}`);
    }
    return { name, sql, checksum: createHash("sha256").update(sql).digest("hex") };
  }));
}

export async function applyMigrations(connection: MigrationConnection, migrations: Migration[], isTestAccountEnabled: boolean) {
  await connection.query("BEGIN");
  try {
    await connection.query("SET LOCAL lock_timeout = '60s'");
    await connection.query("SET LOCAL statement_timeout = '120s'");
    await connection.query("SELECT pg_advisory_xact_lock(1835626101, 1)");
    await connection.query("CREATE SCHEMA IF NOT EXISTS minute_private");
    await connection.query("REVOKE ALL ON SCHEMA minute_private FROM PUBLIC, anon, authenticated");
    await connection.query(`CREATE TABLE IF NOT EXISTS minute_private.migrations (
      name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    await connection.query("ALTER TABLE minute_private.migrations ENABLE ROW LEVEL SECURITY");
    await connection.query("REVOKE ALL ON minute_private.migrations FROM PUBLIC, anon, authenticated");
    const { rows } = await connection.query("SELECT name, checksum FROM minute_private.migrations ORDER BY name");
    for (const [index, applied] of rows.entries()) {
      if (migrations[index]?.name !== applied.name || migrations[index]?.checksum !== applied.checksum) {
        throw new Error(`Migration history changed at ${applied.name}. Restore applied files; add a new migration instead.`);
      }
    }
    await connection.query("SELECT set_config('minute.enable_test_account', $1, true)", [String(isTestAccountEnabled)]);
    for (const migration of migrations.slice(rows.length)) {
      await connection.query(migration.sql);
      await connection.query("INSERT INTO minute_private.migrations (name, checksum) VALUES ($1, $2)", [migration.name, migration.checksum]);
    }
    // Protect deployments of a database previously used for development as well.
    if (!isTestAccountEnabled) await connection.query(`UPDATE auth.users SET banned_until = now() + interval '100 years'
      WHERE lower(email) = 'test@ptbk.io' AND encrypted_password = extensions.crypt('password123', encrypted_password)`);
    await connection.query("COMMIT");
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  }
}
