import "server-only";
import { Client } from "pg";
import path from "node:path";
import { applyMigrations, readMigrations } from "./migrations";

export async function migrateDatabase() {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  if (!connectionString) throw new Error("SUPABASE_DATABASE_URL is required. Follow the Supabase setup in README.md.");
  const isTestAccountEnabled = process.env.ENABLE_TEST_ACCOUNT === "true";
  if (isTestAccountEnabled && process.env.NODE_ENV === "production") {
    throw new Error("ENABLE_TEST_ACCOUNT must be false in production.");
  }
  const databaseUrl = new URL(connectionString);
  const isLocalDatabase = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(databaseUrl.hostname);
  // URL SSL parameters override pg's ssl object; reject them rather than silently weakening TLS.
  if ([...databaseUrl.searchParams.keys()].some((key) => key.startsWith("ssl"))) {
    throw new Error("Remove SSL parameters from SUPABASE_DATABASE_URL; TLS is verified by the application.");
  }
  const connection = new Client({
    connectionString,
    connectionTimeoutMillis: 15_000,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: true, ca: process.env.SUPABASE_DATABASE_CA?.replace(/\\n/g, "\n") },
  });
  const migrations = await readMigrations(path.join(process.cwd(), "migrations"));
  try {
    await connection.connect();
    await applyMigrations(connection, migrations, isTestAccountEnabled);
  } finally {
    await connection.end();
  }
}
