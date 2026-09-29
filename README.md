# Minute

A meeting recorder built with Next.js, React, strict TypeScript, and Supabase. Accounts, workspaces, meetings, transcripts, todos, and preferences persist across devices; original audio lives in private Supabase Storage.

## Setup

Use Node.js 22 or newer and a dedicated Supabase project.

1. Create a project in [Supabase](https://supabase.com/dashboard). In **Authentication → Sign In / Providers**, enable Email/password sign-up and **disable Confirm email**. Set a minimum password length of at least 8. Leave social providers disabled. This version registers and signs in immediately without sending email; email ownership is not verified. Configure Supabase Auth rate limits for your deployment. Recovery emails, email changes, and social login are not implemented.
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project's API settings. Existing `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` variables are also accepted. These two values are public and embedded at build time. Never substitute a secret/service-role key for the publishable key.
3. From the project's **Connect** dialog, copy the PostgreSQL **direct connection** or **session pooler** URL (port 5432) into `SUPABASE_DATABASE_URL`. Use the database password, URL-encoded, not an API key. Use the session pooler if your host cannot reach the direct IPv6 address. Do not use the transaction pooler on port 6543. This credential stays on the server and needs DDL access to `public`, `auth`, `storage`, and `minute_private` for migrations.
4. Remote database connections require verified TLS. Remove `sslmode`/other SSL query parameters from the connection URL. If needed, download the project CA certificate from Supabase and set `SUPABASE_DATABASE_CA` to its PEM contents (literal `\n` separators are supported). TLS is disabled only for loopback PostgreSQL used in local development. Never disable certificate verification for a hosted database.
5. For a **development database only**, set `ENABLE_TEST_ACCOUNT=true` before its first startup to use `test@ptbk.io` / `password123`. Otherwise the migration creates this account banned. The account has ordinary user access, never administrator privileges. Production startup rejects `ENABLE_TEST_ACCOUNT=true` and bans the test account whenever it still has the default password, including databases previously used in development. To use it after that, change its password and remove the ban through Supabase Auth administration. Existing accounts are never overwritten by the seed migration. Prefer separate development and production projects.
6. Install and start:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and register or sign in. New accounts start with an empty workspace. The application requires a database connection and fails startup if migrations cannot complete. No Supabase secret/service-role API key is needed by the application.

See the official [password Auth setup](https://supabase.com/docs/guides/auth/passwords) and [PostgreSQL connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Migrations

SQL files live in `migrations/` and must use `YYYY-MM-XXXX-description.sql`, for example `2026-09-0004-add-calendar.sql`. Months must be valid, descriptions use lowercase words separated by hyphens, and the date plus four-digit sequence must be unique. Files run in lexical order. Add each new migration after the last applied version; never edit, rename, remove, or insert a migration before existing applied versions.

Next.js calls `instrumentation.ts` when a Node server instance starts, before serving requests. Both `npm run dev` and `npm start` automatically:

- Open a dedicated PostgreSQL connection and begin one transaction.
- Take a transaction-scoped advisory lock so concurrent instances cannot race.
- Validate the ordered SHA-256 migration history in private `minute_private.migrations`.
- Apply **every pending migration and its history entry in one database commit**. The initial Auth seed and Storage policies are part of that transaction too.
- Roll back the entire pending batch on failure and fail startup. Fix a pending migration and restart to retry. Already committed versions remain unchanged.

The runner has a 60-second lock timeout and a 120-second statement timeout. A timeout also fails startup and rolls back. There are no Git commits involved. Migration files must contain transaction-compatible SQL only: no `BEGIN`/`COMMIT`/`ROLLBACK`, `CREATE INDEX CONCURRENTLY`, `VACUUM`, or external API calls. A guard rejects explicit transaction-control statements. Use a new forward migration to correct an applied change. Back up the database before deploying destructive schema changes.

`next build` does not migrate or need a database password. The deployed runtime must receive `SUPABASE_DATABASE_URL` and include `migrations/` in its working directory. `next.config.ts` adds these files to server output traces; retain them when assembling custom deployment images. For serverless Node deployments, each new instance runs the same locked, idempotent startup check. Static export and Edge-only deployment are unsupported.

## Data and security model

Supabase Auth stores users, hashes passwords, and manages email identities. Users sign in by email; immutable Auth UUIDs own data, allowing later verified email changes and additional identity providers without re-keying data. The browser uses Supabase's persisted, automatically refreshed session. Server routes independently verify its bearer token with Auth; they never trust a user ID supplied by the browser.

`public.account_data` stores one versioned JSONB document per account. It preserves the existing application model and its validated workspace/meeting/todo relationships, allowing backup imports and related edits to commit atomically. This is deliberately a personal-account model: embedded memberships describe workspace organization and **do not grant access to other accounts**. Shared workspaces will require relational membership authorization and a migration before enabling collaboration. Each document is limited to 20 MB; the API validates shapes and references before saving. Profile names, language, and theme live in this document; email and owner ID come from Auth.

RLS and explicit grants restrict account reads/inserts/updates to `auth.uid() = user_id`. Anonymous users have no account access. A revision predicate and database trigger prevent silent stale writes. Saves are serialized in the browser, errors remain visible, and unsaved changes can be exported. A conflicting tab/device must export its pending work and reload before continuing. Changes sync on saving and load on reopening/reloading; there is no live collaborative merge. Failed saves stay in memory, so keep the page open until saved or exported.

The private `recordings` bucket limits each file to 25 MB. Storage policies allow authenticated reads, inserts, and deletes only inside the caller's `<auth-user-id>/` prefix. There are no public audio URLs or overwrite permissions. Recording uploads complete before metadata is added. Storage uploads/deletions and metadata saves are separate services, so a failed metadata save can leave an unreferenced object; retain backups and reconcile unreferenced files when adding account deletion or retention features.

Migration history and AI usage counters are in an unexposed private schema. AI routes require authentication and a database-backed limit of 30 requests per user per minute, shared across instances. The narrowly scoped rate-limit function is the only security-definer application function and fixes its search path. Enable appropriate infrastructure limits and monitor AI/storage usage for your deployment.

See Supabase's [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) and [Storage access policies](https://supabase.com/docs/guides/storage/security/access-control). Future tables, buckets, and functions must preserve these boundaries. Email verification and OAuth are future work, not simulated by application-managed passwords.

## Existing local data and backups

Before upgrading the local-only version, export its JSON backup from Settings and download audio separately. After signing in, import that JSON from Settings; the imported owner and memberships are rebound to the signed-in account, so a backup cannot impersonate another user. Upload the original audio to the corresponding meetings. JSON backups contain recording metadata, not audio bytes. Old localStorage and IndexedDB contents are not automatically imported, shared with a new account, or deleted.

## Features

- Multiple workspaces with inherited English/Czech meeting languages.
- Scheduled and ad hoc meetings with their own URLs. The red **Start recording** button creates a meeting and explicitly starts the microphone; opening or reloading a studio URL alone never requests access.
- Microphone recording, pause/resume, multiple takes, audio uploads, playback, and downloads.
- Automatic transcription, Markdown summaries, linked action items, editable transcripts, and Markdown descriptions.
- Todos with completion, priorities, due dates, meeting links, and nested subtodos.
- Workspace search, list/grid views, status filters, and sorting.
- English/Czech UI and light/dark/system themes.
- Validated JSON backup restore and Markdown meeting export.
- Installable PWA. The service worker caches public shell/static assets only, never account API responses or visited pages. Loading/saving account data, audio, and AI processing require a network connection.

## AI connection

Set the server-only `OPENAI_API_KEY` in `.env.local`. Optional `OPENAI_TRANSCRIPTION_MODEL` and `OPENAI_ANALYSIS_MODEL` override defaults. Finishing a meeting transcribes unprocessed recordings, saves the transcript, generates a summary, and creates todos. Retries reuse saved transcription text and avoid identically titled duplicate todos. AI results should be reviewed.

Audio supports MP3, M4A, MP4, WAV, WebM, OGG, and FLAC up to 25 MB. Without an OpenAI key, recordings and manually edited transcripts still work. Where supported, browser speech recognition supplies live captions; its availability and processing depend on the browser. Automatic summaries and todo extraction need the server connection.

## Checks and deployment

```bash
npm run check
npm run build
npm start
```

`npm run check` runs lint, strict type checks, tests, and a production build. Database tests use embedded PostgreSQL with Supabase-shaped Auth/Storage fixtures; they execute the real migrations, test all-or-nothing rollback, seed password/identity creation, migration drift, RLS isolation, revision conflicts, and AI limits. They do not contact your hosted project or replace an end-to-end Supabase smoke test.

For a fresh deployment, verify registration with no confirmation email, sign-in/sign-out, saved data after reload, audio upload/playback from a second device, and isolation between two separate accounts. Verify a stale tab reports a conflict. Use HTTPS outside localhost for microphone access and installation. Set the public Supabase variables before building and server credentials at runtime. Keep production test-account access disabled. Never put database credentials or secret keys in `NEXT_PUBLIC_*`, source control, or browser code.

## Source layout

- `app/`: layout, routing, manifest, authenticated API routes, and CSS.
- `components/`: UI, authentication boundary, save status, and browser interactions.
- `lib/`: domain validation, account persistence, Supabase clients, recording, and processing.
- `lib/database/`, `instrumentation.ts`, `migrations/`: startup migration system.
- `tests/`: domain, persistence, migration, RLS, recording-intent, and service-worker checks.
- `public/`: app icons and service worker.
