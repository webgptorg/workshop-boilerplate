import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';
import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });
config({ path: '.env', quiet: true });

const DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
if (!DATABASE_URL) {
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SUPABASE_URL)
    throw new Error('SUPABASE_DATABASE_URL is required for migrations.');
  console.log('Skipping migrations: SUPABASE_DATABASE_URL is not set.');
  process.exit(0);
}

const MIGRATIONS_DIRECTORY = join(process.cwd(), 'supabase', 'migrations');
const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: true } });

try {
  await client.connect();
  await client.query('begin');
  await client.query('select pg_advisory_xact_lock(719124, 1)');
  await client.query('create schema if not exists app_migrations');
  await client.query(`create table if not exists app_migrations.applied (
    name text primary key,
    checksum text not null,
    applied_at timestamptz not null default now()
  )`);
  const files = (await readdir(MIGRATIONS_DIRECTORY)).filter((name) => /^\d+_[\w-]+\.sql$/.test(name)).sort();
  for (const name of files) {
    const sql = await readFile(join(MIGRATIONS_DIRECTORY, name), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const result = await client.query('select checksum from app_migrations.applied where name = $1', [name]);
    if (result.rows.length) {
      if (result.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
      continue;
    }
    await client.query(sql);
    await client.query('insert into app_migrations.applied (name, checksum) values ($1, $2)', [name, checksum]);
    console.log(`Applied ${name}`);
  }
  await client.query('commit');
} catch (error) {
  await client.query('rollback').catch(() => {});
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
