import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { Client } from "pg";
import { applyMigrations } from "../lib/database/migrate";
import { readMigrations } from "../lib/database/migration-files";
import { createAccountState } from "../lib/account-state";

const TEST_DATABASE_URL = process.env.MINUTE_TEST_DATABASE_URL;
const OTHER_USER_ID = "62505a12-5a9e-48dd-83aa-b22999b47b7a";

async function asAccount<Value>(client: Client, userId: string | null, run: () => Promise<Value>) {
  await client.query("BEGIN");
  try {
    await client.query(userId ? "SET LOCAL ROLE authenticated" : "SET LOCAL ROLE anon");
    await client.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [userId ?? ""]);
    const result = await run();
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

test("PostgreSQL migrations, account RLS, and private recording policies", { skip: !TEST_DATABASE_URL }, async (context) => {
  assert.ok(TEST_DATABASE_URL);
  assert.equal(new URL(TEST_DATABASE_URL).pathname, "/minute_test", "Use a disposable database named minute_test");
  const client = new Client({ connectionString: TEST_DATABASE_URL });
  const secondClient = new Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  await secondClient.connect();
  try {
    const existing = await client.query("SELECT to_regclass('auth.users') AS users, to_regclass('public.account_data') AS data");
    assert.deepEqual(existing.rows[0], { users: null, data: null }, "Integration tests require a fresh empty database");
    await client.query(await readFile(join(process.cwd(), "tests/fixtures/supabase.sql"), "utf8"));
    const migrations = await readMigrations(join(process.cwd(), "migrations"));

    await context.test("simultaneous startup applies the initial migration once", async () => {
      const results = await Promise.all([applyMigrations(client, migrations, false), applyMigrations(secondClient, migrations, false)]);
      assert.equal(results.flat().length, migrations.length);
      assert.equal((await client.query("SELECT count(*)::int AS count FROM minute_private.schema_migrations")).rows[0].count, migrations.length);
    });
    const fixture = (await client.query("SELECT id, email, encrypted_password, banned_until FROM auth.users WHERE email = 'test@ptbk.io'")).rows[0];
    assert.ok(fixture);
    const fixtureUserId: string = fixture.id;

    await context.test("fixture has a real bcrypt password and an email identity", async () => {
      assert.match(fixture.encrypted_password, /^\$2[aby]\$/);
      assert.equal(fixture.banned_until, null);
      assert.equal((await client.query("SELECT encrypted_password = extensions.crypt('password123', encrypted_password) AS is_matching FROM auth.users WHERE id = $1", [fixtureUserId])).rows[0].is_matching, true);
      assert.equal((await client.query("SELECT provider, provider_id, identity_data->>'email' AS email FROM auth.identities WHERE user_id = $1", [fixtureUserId])).rows[0].email, "test@ptbk.io");
      assert.equal((await client.query("SELECT public, file_size_limit::int FROM storage.buckets WHERE id = 'recordings'")).rows[0].public, false);
    });

    await client.query("INSERT INTO auth.users (id, email) VALUES ($1, 'other@example.com')", [OTHER_USER_ID]);
    const state = createAccountState({ id: fixtureUserId, email: "test@ptbk.io", name: "Test" });
    await asAccount(client, fixtureUserId, async () => {
      assert.equal((await client.query("SELECT public.save_account_data($1, 0) AS revision", [state])).rows[0].revision, 1);
      await client.query("INSERT INTO storage.objects (bucket_id, name) VALUES ('recordings', $1)", [`${fixtureUserId}/first`]);
    });

    await context.test("anonymous users cannot read accounts, execute saves, or inspect migration history", async () => {
      for (const query of ["SELECT * FROM public.profiles", "SELECT * FROM public.account_data", "SELECT * FROM minute_private.schema_migrations", "SELECT public.save_account_data('{}', 0)"]) {
        await assert.rejects(asAccount(client, null, () => client.query(query)), /permission denied/);
      }
      const objects = await asAccount(client, null, () => client.query("SELECT * FROM storage.objects"));
      assert.equal(objects.rows.length, 0);
    });

    await context.test("one account cannot read, alter, delete, or upload to another account", async () => {
      await asAccount(client, OTHER_USER_ID, async () => {
        assert.equal((await client.query("SELECT * FROM public.profiles")).rows.length, 1);
        assert.equal((await client.query("SELECT * FROM public.account_data")).rows.length, 0);
        assert.equal((await client.query("SELECT * FROM storage.objects")).rows.length, 0);
        assert.equal((await client.query("UPDATE public.account_data SET revision = revision + 1 WHERE user_id = $1", [fixtureUserId])).rowCount, 0);
        assert.equal((await client.query("DELETE FROM storage.objects WHERE name = $1", [`${fixtureUserId}/first`])).rowCount, 0);
      });
      await assert.rejects(asAccount(client, OTHER_USER_ID, () => client.query("INSERT INTO storage.objects (bucket_id, name) VALUES ('recordings', $1)", [`${fixtureUserId}/attack`])), /row-level security/);
      await assert.rejects(asAccount(client, OTHER_USER_ID, () => client.query("SELECT public.save_account_data($1, 0)", [state])), { code: "23514" });
      await assert.rejects(asAccount(client, fixtureUserId, () => client.query("UPDATE public.profiles SET email = 'forged@example.com'")), /permission denied/);
    });

    await context.test("forged email and stale revisions cannot be saved", async () => {
      const forged = { ...state, user: { ...state.user, email: "forged@example.com" } };
      await assert.rejects(asAccount(client, fixtureUserId, () => client.query("SELECT public.save_account_data($1, 1)", [forged])), /identity/);
      await assert.rejects(asAccount(client, fixtureUserId, () => client.query("SELECT public.save_account_data($1, 0)", [state])), /changed/);
      const saved = await asAccount(client, fixtureUserId, () => client.query("SELECT state FROM public.account_data"));
      assert.deepEqual(saved.rows[0].state, JSON.parse(JSON.stringify(state)));
    });

    await context.test("concurrent saves allow exactly one writer at the expected revision", async () => {
      const results = await Promise.allSettled([
        asAccount(client, fixtureUserId, () => client.query("SELECT public.save_account_data($1, 1) AS revision", [state])),
        asAccount(secondClient, fixtureUserId, () => secondClient.query("SELECT public.save_account_data($1, 1) AS revision", [state])),
      ]);
      assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
      assert.equal(results.filter((result) => result.status === "rejected").length, 1);
      assert.equal((await client.query("SELECT revision FROM public.account_data WHERE user_id = $1", [fixtureUserId])).rows[0].revision, 2);
    });

    await context.test("later SQL failure rolls back every new migration and ledger record", async () => {
      const pending = [
        { filename: "2026-09-0001-test.sql", checksum: "test-first", sql: "CREATE TABLE public.rollback_probe (id integer); INSERT INTO public.rollback_probe VALUES (1);" },
        { filename: "2026-09-0002-test.sql", checksum: "test-second", sql: "SELECT * FROM public.this_table_does_not_exist" },
      ];
      await assert.rejects(applyMigrations(client, [...migrations, ...pending], false), /does not exist/);
      assert.equal((await client.query("SELECT to_regclass('public.rollback_probe') AS probe")).rows[0].probe, null);
      assert.equal((await client.query("SELECT count(*)::int AS count FROM minute_private.schema_migrations")).rows[0].count, migrations.length);
    });

    await context.test("a temporary ban blocks data and expires without an extra profile update", async () => {
      await client.query("UPDATE auth.users SET banned_until = clock_timestamp() + interval '1 second' WHERE id = $1", [fixtureUserId]);
      const hidden = await asAccount(client, fixtureUserId, () => client.query("SELECT * FROM public.account_data"));
      assert.equal(hidden.rows.length, 0);
      await client.query("SELECT pg_sleep(1.1)");
      const visible = await asAccount(client, fixtureUserId, () => client.query("SELECT * FROM public.account_data"));
      assert.equal(visible.rows.length, 1);
    });

    await context.test("production startup disables the default fixture and its existing token's RLS access", async () => {
      await applyMigrations(client, migrations, true);
      assert.equal((await client.query("SELECT coalesce(banned_until > now(), false) AS is_banned FROM public.profiles WHERE id = $1", [fixtureUserId])).rows[0].is_banned, true);
      await asAccount(client, fixtureUserId, async () => {
        for (const table of ["public.profiles", "public.account_data", "storage.objects"]) {
          assert.equal((await client.query(`SELECT * FROM ${table}`)).rows.length, 0);
        }
      });
      await assert.rejects(asAccount(client, fixtureUserId, () => client.query("SELECT public.save_account_data($1, 2)", [state])), /changed/);
      // A genuine administrator can change the password and remove the ban.
      await client.query("UPDATE auth.users SET encrypted_password = extensions.crypt('different-password', extensions.gen_salt('bf')), banned_until = null WHERE id = $1", [fixtureUserId]);
      await applyMigrations(client, migrations, true);
      assert.equal((await client.query("SELECT coalesce(banned_until > now(), false) AS is_banned FROM public.profiles WHERE id = $1", [fixtureUserId])).rows[0].is_banned, false);
    });
  } finally {
    await client.end();
    await secondClient.end();
  }
});
