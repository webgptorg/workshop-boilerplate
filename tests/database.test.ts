import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PGlite, Transaction } from "@electric-sql/pglite";
import { createMigratedDatabase } from "./database/supabase-database";
import { createAccountState } from "../lib/account-state";
import { pendingMigrations, readMigrations } from "../lib/database/migration-plan";

const OTHER_ACCOUNT_ID = "00000000-0000-4000-8000-000000000002";
async function asUser<Value>(database: PGlite, userId: string, action: (transaction: Transaction) => Promise<Value>) {
  return database.transaction(async (transaction) => {
    await transaction.exec("set local role authenticated");
    await transaction.query("select set_config('request.jwt.claim.sub', $1, true)", [userId]);
    return action(transaction);
  });
}

test("initial migration hashes the test password and enforces account isolation and revision checks", async () => {
  const DATABASE = await createMigratedDatabase();
  try {
    const { rows: [ACCOUNT] } = await DATABASE.query<{ id: string; isPasswordCorrect: boolean }>(`
      select id, encrypted_password = extensions.crypt('password123', encrypted_password) as "isPasswordCorrect"
      from auth.users where email='test@ptbk.io'`);
    assert.ok(ACCOUNT.isPasswordCorrect);
    await DATABASE.query(`insert into auth.users(id,email,raw_user_meta_data) values ($1,'other@example.com','{"name":"Other"}')`, [OTHER_ACCOUNT_ID]);
    const STATE = createAccountState({ id: ACCOUNT.id, email: "test@ptbk.io", name: "Alex Morgan" });
    await asUser(DATABASE, ACCOUNT.id, async (transaction) => {
      const { rows } = await transaction.query<{ revision: number }>('select public."saveAppData"($1::jsonb,0) as revision', [JSON.stringify(STATE)]);
      assert.equal(rows[0].revision, 1);
    });
    await asUser(DATABASE, OTHER_ACCOUNT_ID, async (transaction) => {
      assert.equal((await transaction.query('select * from public."AppData"')).rows.length, 0);
      assert.equal((await transaction.query('select * from public."User"')).rows.length, 1);
      assert.equal((await transaction.query('update public."AppData" set "revision"=2 returning *')).rows.length, 0);
    });
    await assert.rejects(asUser(DATABASE, OTHER_ACCOUNT_ID, (transaction) =>
      transaction.query('select public."saveAppData"($1::jsonb,0)', [JSON.stringify(STATE)])));
    await assert.rejects(DATABASE.transaction(async (transaction) => {
      await transaction.exec("set local role anon");
      await transaction.query('select public."saveAppData"($1::jsonb,0)', [JSON.stringify(STATE)]);
    }));
    await assert.rejects(asUser(DATABASE, ACCOUNT.id, (transaction) =>
      transaction.query('select public."saveAppData"($1::jsonb,0)', [JSON.stringify(STATE)])));
    await asUser(DATABASE, ACCOUNT.id, (transaction) =>
      transaction.query('select public."saveAppData"($1::jsonb,1)', [JSON.stringify({ ...STATE, user: { ...STATE.user, name: "Saved name" } })]));
    await assert.rejects(asUser(DATABASE, ACCOUNT.id, (transaction) =>
      transaction.query('select public."saveAppData"($1::jsonb,1)', [JSON.stringify(STATE)])));
    await assert.rejects(asUser(DATABASE, ACCOUNT.id, (transaction) =>
      transaction.query('select public."saveAppData"($1::jsonb,2)', [JSON.stringify({ ...STATE, user: { ...STATE.user, email: "forged@example.com" } })])));
    await assert.rejects(asUser(DATABASE, ACCOUNT.id, (transaction) =>
      transaction.query('select public."saveAppData"($1::jsonb,2)', [JSON.stringify({ ...STATE, extra: "x".repeat(200_001) })])));
    const { rows: [PROFILE] } = await DATABASE.query<{ name: string }>('select "name" from public."User" where "id"=$1', [ACCOUNT.id]);
    assert.equal(PROFILE.name, "Saved name");
    const { rows: [SAVED] } = await DATABASE.query<{ revision: number }>('select "revision" from public."AppData" where "userId"=$1', [ACCOUNT.id]);
    assert.equal(SAVED.revision, 2);
  } finally { await DATABASE.close(); }
});

test("production initialization can omit the known test user", async () => {
  const DATABASE = await createMigratedDatabase(false);
  try { assert.equal((await DATABASE.query("select * from auth.users")).rows.length, 0); }
  finally { await DATABASE.close(); }
});

test("migration discovery detects invalid names, changes, missing history and out-of-order additions", async () => {
  const DIRECTORY = await mkdtemp(join(tmpdir(), "minute-migrations-"));
  try {
    await writeFile(join(DIRECTORY, "2026-10-0000-first.sql"), "select 1;\n");
    await writeFile(join(DIRECTORY, "2026-10-0001-second.sql"), "select 2;\n");
    const MIGRATIONS = await readMigrations(DIRECTORY);
    assert.equal(pendingMigrations(MIGRATIONS, [MIGRATIONS[0]]).length, 1);
    assert.throws(() => pendingMigrations(MIGRATIONS, [{ ...MIGRATIONS[0], checksum: "changed" }]));
    assert.throws(() => pendingMigrations([MIGRATIONS[1]], [MIGRATIONS[0]]));
    assert.throws(() => pendingMigrations(MIGRATIONS, [MIGRATIONS[1]]));
    await writeFile(join(DIRECTORY, "bad.sql"), "select 3;");
    await assert.rejects(readMigrations(DIRECTORY));
    await rm(join(DIRECTORY, "bad.sql"));
    await writeFile(join(DIRECTORY, "2026-10-0000-duplicate.sql"), "select 3;");
    await assert.rejects(readMigrations(DIRECTORY));
  } finally { await rm(DIRECTORY, { recursive: true, force: true }); }
});

test("the migration runner commits all pending files together, rolls back failures, and is repeatable", async () => {
  const { PGLiteSocketServer } = await import("@electric-sql/pglite-socket");
  const { createSupabaseDatabase } = await import("./database/supabase-database");
  const { migrateDatabase } = await import("../lib/database/migrate");
  const DATABASE = await createSupabaseDatabase();
  const SERVER = new PGLiteSocketServer({ db: DATABASE, port: 0, host: "127.0.0.1" });
  const DIRECTORY = await mkdtemp(join(tmpdir(), "minute-transaction-"));
  const ORIGINAL_DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
  await SERVER.start();
  process.env.SUPABASE_DATABASE_URL = `postgresql://postgres:postgres@${SERVER.getServerConn()}/postgres`;
  try {
    await writeFile(join(DIRECTORY, "2026-10-0000-first.sql"), 'create table public."Example" ("id" integer);');
    await writeFile(join(DIRECTORY, "2026-10-0001-second.sql"), 'insert into public."Missing" values (1);');
    await assert.rejects(migrateDatabase(DIRECTORY));
    assert.equal((await DATABASE.query<{ name: string | null }>("select to_regclass('public.\"Example\"') as name")).rows[0].name, null);
    assert.equal((await DATABASE.query<{ name: string | null }>("select to_regclass('private.\"Migration\"') as name")).rows[0].name, null);
    await writeFile(join(DIRECTORY, "2026-10-0001-second.sql"), 'insert into public."Example" values (1);');
    await migrateDatabase(DIRECTORY);
    await migrateDatabase(DIRECTORY);
    assert.equal((await DATABASE.query('select * from public."Example"')).rows.length, 1);
    assert.equal((await DATABASE.query('select * from private."Migration"')).rows.length, 2);
  } finally {
    if (ORIGINAL_DATABASE_URL === undefined) delete process.env.SUPABASE_DATABASE_URL;
    else process.env.SUPABASE_DATABASE_URL = ORIGINAL_DATABASE_URL;
    await SERVER.stop(); await DATABASE.close(); await rm(DIRECTORY, { recursive: true, force: true });
  }
});
