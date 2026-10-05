import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readMigrations } from "../../lib/database/migration-plan";
import { join } from "node:path";

// Only Supabase-owned infrastructure is substituted. Application migrations,
// PostgreSQL constraints, password hashing, transactions and RLS execute unchanged.
export async function createSupabaseDatabase() {
  const DATABASE = await PGlite.create({ extensions: { pgcrypto } });
  await DATABASE.exec(`
    create role anon;
    create role authenticated;
    create schema private;
    create schema auth;
    create schema extensions;
    create table auth.users (
      instance_id uuid, id uuid primary key, aud text, role text, email varchar(254) unique,
      encrypted_password varchar(255), email_confirmed_at timestamptz,
      raw_app_meta_data jsonb, raw_user_meta_data jsonb, created_at timestamptz, updated_at timestamptz,
      confirmation_token text, recovery_token text, email_change_token_new text, email_change text,
      reauthentication_token text, banned_until timestamptz
    );
    create table auth.identities (
      id uuid primary key, user_id uuid references auth.users(id), provider_id text,
      identity_data jsonb, provider text, created_at timestamptz, updated_at timestamptz
    );
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);
  return DATABASE;
}

export async function createMigratedDatabase(isTestUserEnabled = true) {
  const DATABASE = await createSupabaseDatabase();
  const MIGRATIONS = await readMigrations(join(process.cwd(), "migrations"));
  await DATABASE.transaction(async (transaction) => {
    await transaction.query("select set_config('app.isTestUserEnabled', $1, true)", [String(isTestUserEnabled)]);
    for (const MIGRATION of MIGRATIONS) await transaction.exec(MIGRATION.sql);
  });
  return DATABASE;
}
