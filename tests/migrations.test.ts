import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readMigrations, pendingMigrations, type Migration } from "../lib/database/migration-files";
import { applyMigrations, type MigrationConnection } from "../lib/database/migrate";

const MIGRATIONS: Migration[] = [
  { filename: "2026-09-0000-initial.sql", checksum: "first", sql: "CREATE TABLE first_table (id int)" },
  { filename: "2026-09-0001-next.sql", checksum: "second", sql: "CREATE TABLE second_table (id int)" },
];

function fakeConnection(isFailing = false) {
  const statements: string[] = [];
  const connection: MigrationConnection = { query: async (sql) => {
    statements.push(sql);
    if (isFailing && sql === MIGRATIONS[1].sql) throw new Error("SQL failure");
    return { rows: [] };
  } };
  return { connection, statements };
}

test("all pending migrations and their history share exactly one commit", async () => {
  const { connection, statements } = fakeConnection();
  assert.deepEqual(await applyMigrations(connection, MIGRATIONS, false), MIGRATIONS.map((migration) => migration.filename));
  assert.equal(statements[0], "BEGIN");
  assert.equal(statements.at(-1), "COMMIT");
  assert.equal(statements.filter((sql) => sql === "COMMIT").length, 1);
  assert.ok(statements.findIndex((sql) => sql.includes("pg_advisory_xact_lock")) < statements.indexOf(MIGRATIONS[0].sql));
});

test("a failure in a later migration rolls back the entire batch", async () => {
  const { connection, statements } = fakeConnection(true);
  await assert.rejects(applyMigrations(connection, MIGRATIONS, false), /SQL failure/);
  assert.equal(statements.at(-1), "ROLLBACK");
  assert.equal(statements.includes("COMMIT"), false);
});

test("applied migrations are immutable, cannot disappear, and cannot be backdated", () => {
  assert.deepEqual(pendingMigrations(MIGRATIONS, [MIGRATIONS[0]]), [MIGRATIONS[1]]);
  assert.throws(() => pendingMigrations(MIGRATIONS, [{ ...MIGRATIONS[0], checksum: "edited" }]), /history changed/);
  assert.throws(() => pendingMigrations([], [MIGRATIONS[0]]), /history changed/);
  assert.throws(() => pendingMigrations(MIGRATIONS, [MIGRATIONS[1]]), /history changed/);
});

test("migration files are sorted, hashed, and reject duplicate versions or transaction control", async () => {
  const directory = await mkdtemp(join(tmpdir(), "minute-migrations-"));
  try {
    await writeFile(join(directory, "2026-09-0001-next.sql"), "SELECT 1;");
    await writeFile(join(directory, "2026-09-0000-initial.sql"), "DO $$ BEGIN PERFORM 1; END; $$;");
    const migrations = await readMigrations(directory);
    assert.equal(migrations[0].filename, "2026-09-0000-initial.sql");
    assert.match(migrations[0].checksum, /^[a-f0-9]{64}$/);
    for (const sql of ["COMMIT;", "COMMIT TRANSACTION;", "SELECT 1; -- escape\nEND;", "START TRANSACTION;", "PREPARE TRANSACTION 'split-batch';"]) {
      await writeFile(join(directory, "2026-09-0001-next.sql"), sql);
      await assert.rejects(readMigrations(directory), /Transaction control/);
    }
    await writeFile(join(directory, "2026-09-0000-duplicate.sql"), "SELECT 1;");
    await assert.rejects(readMigrations(directory), /Duplicate migration/);
    await rm(join(directory, "2026-09-0000-duplicate.sql"));
    await writeFile(join(directory, "invalid.sql"), "SELECT 1;");
    await assert.rejects(readMigrations(directory), /Invalid migration filename/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
