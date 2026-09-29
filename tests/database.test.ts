import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { applyMigrations, readMigrations, type MigrationConnection } from "../lib/database/migrations";
import { createAccountState, bindAccount } from "../lib/account";
import { createInitialState } from "../lib/seed";
import { isAppState } from "../lib/validation";

const FIRST_USER = "10000000-0000-0000-0000-000000000001";
const SECOND_USER = "10000000-0000-0000-0000-000000000002";
const MIGRATIONS_DIRECTORY = path.join(process.cwd(), "migrations");

// Model the Supabase-owned schemas; run our actual migration SQL against PostgreSQL.
async function database() {
  const instance = new PGlite({ extensions: { pgcrypto } });
  await instance.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage; create schema extensions;
    create table auth.users (
      id uuid primary key, instance_id uuid, aud text, role text, email text unique,
      encrypted_password text, email_confirmed_at timestamptz, raw_app_meta_data jsonb,
      raw_user_meta_data jsonb, created_at timestamptz, updated_at timestamptz,
      confirmation_token text, recovery_token text, email_change text, email_change_token_new text,
      email_change_token_current text, reauthentication_token text, phone_change text, phone_change_token text, banned_until timestamptz
    );
    create table auth.identities (
      id uuid primary key, user_id uuid references auth.users, provider_id text,
      identity_data jsonb, provider text, created_at timestamptz, updated_at timestamptz, last_sign_in_at timestamptz
    );
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to authenticated, anon;
    grant all on storage.objects to authenticated, anon;
    create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1, '/') $$;
  `);
  const connection: MigrationConnection = {
    async query(sql, values) {
      if (values) return instance.query<{ name: string; checksum: string }>(sql, values);
      const results = await instance.exec(sql);
      return { rows: (results.at(-1)?.rows ?? []) as { name: string; checksum: string }[] };
    },
  };
  return { instance, connection };
}

async function asUser(instance: PGlite, userId: string) {
  await instance.exec("reset role");
  await instance.query("select set_config('request.jwt.claim.sub', $1, false)", [userId]);
  await instance.exec("set role authenticated");
}

test("migrations seed Auth identity, replay safely, and ban known credentials outside development", async () => {
  const { instance, connection } = await database();
  try {
    const migrations = await readMigrations(MIGRATIONS_DIRECTORY);
    await applyMigrations(connection, migrations, true);
    await applyMigrations(connection, migrations, true);
    const { rows } = await instance.query<{ is_valid: boolean; banned_until: string | null }>(`select
      encrypted_password = extensions.crypt('password123', encrypted_password) as is_valid, banned_until
      from auth.users where email = 'test@ptbk.io'`);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].is_valid, true);
    assert.equal(rows[0].banned_until, null);
    assert.equal((await instance.query("select * from auth.identities")).rows.length, 1);
    assert.equal((await instance.query("select * from minute_private.migrations")).rows.length, migrations.length);
    await applyMigrations(connection, migrations, false);
    assert.equal((await instance.query<{ is_banned: boolean }>("select banned_until > now() as is_banned from auth.users")).rows[0].is_banned, true);
    await assert.rejects(applyMigrations(connection, [{ ...migrations[0], checksum: "changed" }, ...migrations.slice(1)], false), /history changed/);
  } finally { await instance.close(); }
});

test("a later migration failure rolls back all pending schema changes and history", async () => {
  const { instance, connection } = await database();
  try {
    await assert.rejects(applyMigrations(connection, [
      { name: "2026-09-0001-first.sql", checksum: "first", sql: "create table public.rollback_probe (id integer)" },
      { name: "2026-09-0002-broken.sql", checksum: "broken", sql: "select no_such_function()" },
    ], true));
    const { rows } = await instance.query<{ probe: string | null; history: string | null }>("select to_regclass('public.rollback_probe') as probe, to_regclass('minute_private.migrations') as history");
    assert.equal(rows[0].probe, null);
    assert.equal(rows[0].history, null);
  } finally { await instance.close(); }
});

test("RLS isolates accounts and audio, rejects forged owners and stale revisions, and limits AI requests", async () => {
  const { instance, connection } = await database();
  try {
    await applyMigrations(connection, await readMigrations(MIGRATIONS_DIRECTORY), false);
    await instance.query("insert into auth.users (id) values ($1), ($2)", [FIRST_USER, SECOND_USER]);
    await asUser(instance, FIRST_USER);
    const payload = createAccountState({ id: FIRST_USER, email: "one@example.com" });
    await instance.query("insert into public.account_data (user_id, payload) values ($1, $2)", [FIRST_USER, payload]);
    await instance.query("insert into storage.objects (bucket_id, name) values ('recordings', $1)", [`${FIRST_USER}/take`]);
    await assert.rejects(instance.query("insert into public.account_data (user_id, payload) values ($1, $2)", [SECOND_USER, bindAccount(payload, { id: SECOND_USER })]), /row-level security/);
    await assert.rejects(instance.query("insert into storage.objects (bucket_id, name) values ('recordings', $1)", [`${SECOND_USER}/take`]), /row-level security/);
    await assert.rejects(instance.exec("select * from minute_private.migrations"), /permission denied/);
    await assert.rejects(instance.exec("update public.account_data set revision = 5"), /revision/);
    await instance.exec("update public.account_data set revision = 2 where revision = 1");
    assert.equal((await instance.exec("update public.account_data set revision = 2 where revision = 1 returning *"))[0].rows.length, 0);
    for (let count = 1; count <= 31; count++) {
      const { rows } = await instance.query<{ is_allowed: boolean }>("select public.consume_ai_request() as is_allowed");
      assert.equal(rows[0].is_allowed, count <= 30);
    }
    await asUser(instance, SECOND_USER);
    assert.equal((await instance.query("select * from public.account_data")).rows.length, 0);
    assert.equal((await instance.query("select * from storage.objects")).rows.length, 0);
    assert.equal((await instance.exec("update public.account_data set revision = revision + 1 returning *"))[0].rows.length, 0);
    assert.equal((await instance.exec("delete from storage.objects returning *"))[0].rows.length, 0);
    await instance.exec("reset role; set role anon");
    await assert.rejects(instance.query("select * from public.account_data"), /permission denied/);
    await assert.rejects(instance.query("select public.consume_ai_request()"), /permission denied/);
    assert.equal((await instance.query("select * from storage.objects")).rows.length, 0);
  } finally { await instance.close(); }
});

test("migration discovery rejects malformed names, duplicate versions, and transaction control", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "minute-migrations-"));
  try {
    await writeFile(path.join(directory, "bad.sql"), "select 1");
    await assert.rejects(readMigrations(directory), /Invalid/);
    await rm(path.join(directory, "bad.sql"));
    await writeFile(path.join(directory, "2026-09-0001-first.sql"), "COMMIT;");
    await assert.rejects(readMigrations(directory), /transactions/);
    await writeFile(path.join(directory, "2026-09-0001-first.sql"), "select 1");
    await writeFile(path.join(directory, "2026-09-0001-other.sql"), "select 2");
    await assert.rejects(readMigrations(directory), /duplicate/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("new accounts and imported backups preserve the authenticated identity", () => {
  const identity = { id: FIRST_USER, email: "one@example.com" };
  const initial = createAccountState(identity);
  assert.equal(isAppState(initial), true);
  assert.equal(initial.meetings.length, 0);
  const imported = bindAccount(createInitialState(), identity);
  assert.equal(isAppState(imported), true);
  assert.equal(imported.user.email, identity.email);
  assert.ok(imported.memberships.every((membership) => membership.userId === FIRST_USER));
});
