import { loadEnvConfig } from "@next/env";
import { migrateDatabase } from "../lib/database/migrate";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
void migrateDatabase().catch(() => {
  // Driver errors can contain connection details. Keep CLI output safe.
  console.error("Database migration failed. Check connectivity, credentials, TLS certificate, migration integrity, and the production test-account policy in README.md.");
  process.exitCode = 1;
});
