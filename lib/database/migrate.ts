import { Client } from "pg";
import { join } from "node:path";
import { pendingMigrations, readMigrations, type Migration } from "./migration-files";

const MIGRATION_LOCK_ID = "728413903527";

// Structural interface allows transaction behavior to be tested independently of connectivity.
export interface MigrationConnection {
  query(sql: string, values?: unknown[]): Promise<{ rows: { filename: string; checksum: string }[] }>;
}

export async function applyMigrations(connection: MigrationConnection, migrations: Migration[], isProduction: boolean) {
  await connection.query("BEGIN");
  try {
    await connection.query("SET LOCAL lock_timeout = '60s'");
    await connection.query("SET LOCAL statement_timeout = '120s'");
    await connection.query("SELECT pg_advisory_xact_lock($1::bigint)", [MIGRATION_LOCK_ID]);
    await connection.query("CREATE SCHEMA IF NOT EXISTS minute_private");
    await connection.query("REVOKE ALL ON SCHEMA minute_private FROM PUBLIC, anon, authenticated");
    await connection.query(`CREATE TABLE IF NOT EXISTS minute_private.schema_migrations (
      filename text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const applied = await connection.query("SELECT filename, checksum FROM minute_private.schema_migrations ORDER BY filename");
    const pending = pendingMigrations(migrations, applied.rows);
    await connection.query("SELECT set_config('minute.is_production', $1, true)", [String(isProduction)]);
    for (const migration of pending) {
      await connection.query(migration.sql);
      await connection.query("INSERT INTO minute_private.schema_migrations (filename, checksum) VALUES ($1, $2)", [migration.filename, migration.checksum]);
    }
    // Also protects a database initially migrated in development and later used in production.
    if (isProduction) {
      await connection.query(`UPDATE auth.users SET banned_until = 'infinity'::timestamptz
        WHERE email = 'test@ptbk.io'
          AND encrypted_password = extensions.crypt('password123', encrypted_password)`);
    }
    await connection.query("COMMIT");
    return pending.map((migration) => migration.filename);
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  }
}

export async function migrateDatabase() {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  if (!connectionString) throw new Error("Set SUPABASE_DATABASE_URL before starting Minute. See README.md.");
  const url = new URL(connectionString);
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  // Do not allow URL parameters to silently override TLS certificate verification.
  for (const parameter of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
    if (url.searchParams.has(parameter)) throw new Error(`Remove ${parameter} from SUPABASE_DATABASE_URL; TLS is configured by the runner.`);
  }
  const migrations = await readMigrations(join(process.cwd(), "migrations"));
  const connection = new Client({
    connectionString,
    connectionTimeoutMillis: 15_000,
    ssl: isLocal ? false : { rejectUnauthorized: true, ca: process.env.SUPABASE_DATABASE_CA?.replace(/\\n/g, "\n") },
  });
  try {
    await connection.connect();
    return await applyMigrations(connection, migrations, process.env.NODE_ENV === "production");
  } finally {
    await connection.end();
  }
}
