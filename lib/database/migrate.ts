import postgres from "postgres";
import { join } from "node:path";
import { pendingMigrations, readMigrations, type AppliedMigration } from "./migration-plan";

const MIGRATION_LOCK_ID = 734862901;

export async function migrateDatabase(migrationsDirectory = join(process.cwd(), "migrations")) {
  const DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
  if (!DATABASE_URL) throw new Error("Set SUPABASE_DATABASE_URL in .env.local before starting Minute. See README.md.");
  const HOSTNAME = new URL(DATABASE_URL).hostname;
  const IS_LOCAL_DATABASE = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(HOSTNAME);
  const CERTIFICATE = process.env.SUPABASE_DATABASE_CA?.replaceAll("\\n", "\n");
  const IS_TEST_USER_ENABLED = process.env.DB_SEED_TEST_USER === "true" ||
    (process.env.DB_SEED_TEST_USER !== "false" && process.env.NODE_ENV !== "production");
  const MIGRATIONS = await readMigrations(migrationsDirectory);
  const DATABASE = postgres(DATABASE_URL, {
    max: 1, prepare: false, connect_timeout: 15,
    ssl: IS_LOCAL_DATABASE ? false : CERTIFICATE ? { ca: CERTIFICATE, rejectUnauthorized: true } : "verify-full",
    onnotice: () => {},
  });
  try {
    await DATABASE.begin(async (transaction) => {
      await transaction`set local lock_timeout = '30s'`;
      await transaction`select pg_advisory_xact_lock(${MIGRATION_LOCK_ID})`;
      await transaction`select set_config('app.isTestUserEnabled', ${String(IS_TEST_USER_ENABLED)}, true)`;
      const [ENCODING] = await transaction`show server_encoding`;
      if (ENCODING.server_encoding !== "UTF8") throw new Error("The database must use UTF-8 encoding.");
      await transaction.unsafe(`create schema if not exists private;
        revoke all on schema private from public, anon;
        revoke create on schema private from authenticated;
        create table if not exists private."Migration" (
          "name" varchar(200) constraint "migrationNameConstraint" primary key,
          "checksum" varchar(64) not null,
          "appliedAt" timestamptz not null default now()
        );
        revoke all on private."Migration" from public, anon, authenticated;
        alter table private."Migration" enable row level security;`);
      const APPLIED = await transaction<AppliedMigration[]>`select "name", "checksum" from private."Migration" order by "name"`;
      const PENDING = pendingMigrations(MIGRATIONS, APPLIED);
      for (const MIGRATION of PENDING) {
        await transaction.unsafe(MIGRATION.sql);
        await transaction`insert into private."Migration" ("name", "checksum") values (${MIGRATION.name}, ${MIGRATION.checksum})`;
      }
      if (process.env.NODE_ENV === "production" && !IS_LOCAL_DATABASE) {
        const [TEST_USER] = await transaction`select exists (
          select 1 from auth.users where email = 'test@ptbk.io'
          and encrypted_password = extensions.crypt('password123', encrypted_password)
        ) as "isDefaultPassword"`;
        if (TEST_USER.isDefaultPassword) throw new Error("Change or delete the seeded test account before production startup.");
      }
      if (PENDING.length) console.info(`Applied ${PENDING.length} database migration(s) in one transaction.`);
    });
  } finally {
    await DATABASE.end({ timeout: 5 });
  }
}
