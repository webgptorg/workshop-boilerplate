import { loadEnvConfig } from "@next/env";
import { migrateDatabase } from "../lib/database/migrate";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
try {
  const applied = await migrateDatabase();
  console.info(applied.length ? `Applied: ${applied.join(", ")}` : "Database is up to date.");
} catch {
  console.error("Database migration failed. Check connection, TLS certificate, and migration history. See README.md.");
  process.exitCode = 1;
}
