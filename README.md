# Minute

A meeting recorder built with Next.js, React, strict TypeScript, and Supabase. Accounts, workspace data, and recordings persist across devices.

## Setup

1. Create a [Supabase project](https://supabase.com/dashboard). In **Authentication > Providers > Email**, enable email/password signups and **turn off Confirm email**. Configure a minimum password length of 8 or higher. Registration signs users in immediately; the app has no email, password-reset email, or social-login integration yet. Keep unused providers disabled.
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project's API settings. The legacy `anon` key also works here. Never use a service-role or secret key in either public variable.
3. Set `SUPABASE_DATABASE_URL` to the project's PostgreSQL connection from **Connect**. Use a direct connection, or the **session pooler on port 5432** for an IPv4-only host. Use the `postgres` role for migrations, percent-encode special characters in its password, and omit `sslmode`, `sslcert`, `sslkey`, and `sslrootcert` query parameters. The migration runner verifies TLS certificates on remote connections. If needed, download the project CA certificate from database settings and put its PEM contents into `SUPABASE_DATABASE_CA`, using literal `\n` for line breaks. Never disable certificate verification. Local Supabase on localhost uses an unencrypted local database connection.
4. Install and start the app:

   ```bash
   npm install
   npm run dev
   ```

Open http://localhost:3000 and register, or use **test@ptbk.io / password123** in development. The initial SQL migration creates that Auth account with a bcrypt password and an email identity. The fixture gets sample meetings and tutorial todos on first sign-in; new accounts get an empty personal workspace. Email is the login identifier; immutable Supabase user IDs own database records so future verified emails and OAuth identities can attach to the same account. Email ownership is currently unverified.

**Production fixture protection:** on every production startup, a fixture that still uses `password123` is banned and its profile is disabled. RLS also blocks its existing access tokens from data and storage. If that account is needed in production, an administrator must change its password through Supabase Auth administration and remove its ban before use. Otherwise leave it disabled. Startup never resets an existing user's password.

The app needs database connectivity to start and internet connectivity to load/save account data. The public Supabase variables are compiled into browser assets, so set them before building and rebuild when changing projects. See Supabase's [password authentication](https://supabase.com/docs/guides/auth/passwords) and [database connection](https://supabase.com/docs/guides/database/connecting-to-postgres) guides.

## Features

- Multiple workspaces with inherited English/Czech meeting languages.
- Scheduled and ad hoc meetings with their own URLs. The red **Start recording** button on the dashboard creates a meeting and opens the studio with recording already starting.
- Microphone recording, pause/resume, multiple takes, audio uploads, playback, and downloads.
- Automatic transcription, Markdown summaries, and linked action items.
- Editable transcripts and Markdown descriptions with internal entity chips.
- Todo creation, editing, completion, deletion, priorities, due dates, multiple meeting links, and nested subtodos.
- Workspace search, list/grid meeting views, status filters, and todo sorting.
- English/Czech UI, browser language detection, light/dark/system themes.
- JSON backup export and validated restore; Markdown meeting export.
- Installable PWA with app icons and a production service worker.

## AI connection

Set `OPENAI_API_KEY` in `.env.local` (see `.env.example`). The key is used only in server routes. Optional `OPENAI_TRANSCRIPTION_MODEL` and `OPENAI_ANALYSIS_MODEL` settings override the defaults.

Finishing a meeting transcribes each unprocessed recording, saves the combined transcript, generates a summary, and creates todos. Completed transcriptions are retained when a later request fails. Retries reuse saved text and avoid re-adding identically titled todos. New recordings append to an existing transcript. AI results should be reviewed.

Audio files are limited to 25 MB each. Supported inputs include MP3, M4A, MP4, WAV, WebM, OGG, and FLAC. See the [OpenAI transcription API](https://developers.openai.com/api/reference/cli/resources/audio/subresources/transcriptions/methods/create) and [structured output documentation](https://developers.openai.com/api/docs/guides/structured-outputs).

Without an API key, recordings and manually edited transcripts still work. Where supported, browser speech recognition supplies live captions; its availability and processing depend on the browser. Automatic summaries and todo extraction need the server connection.

## Database and migrations

SQL migrations live in `migrations/`, named `YYYY-MM-XXXX-description.sql`, starting with `2026-09-0000-initial.sql`. Add new files in ascending order; never edit, rename, remove, or backdate an applied migration. SHA-256 checksums detect changes to applied files and stop startup. Use a new migration for corrections.

Next.js `instrumentation.ts` runs migrations automatically before each Node server instance serves requests, including development and production startup. Builds have no database side effects. An optional `npm run db:migrate` command loads `.env.local` and applies the same runner; use `NODE_ENV=production npm run db:migrate` for a production database.

The runner uses one PostgreSQL connection and one transaction for **all pending migrations**, including schema changes, seed data, and the private migration ledger. A transaction-scoped advisory lock serializes simultaneous startups. Any failure rolls back the whole batch and fails startup; fix the problem and restart. The ledger is in `minute_private.schema_migrations` and is unavailable to API users. Do not put transaction control, `VACUUM`, `CREATE INDEX CONCURRENTLY`, or other operations that cannot run inside a transaction into a migration. Migration files are trusted deployment code and must be reviewed.

The initial migration creates:

- Supabase Auth's requested test fixture and a synchronized `public.profiles` record for each email account. Normal registration always uses Supabase Auth APIs. The SQL fixture necessarily references Supabase's managed Auth schema, so verify it against Auth schema changes when upgrading a self-hosted Supabase installation.
- `public.account_data`: one versioned JSONB document per account for profile preferences, workspaces, membership records, meetings, transcripts, recording metadata, and todos. This reuses the existing `AppState` model. Membership records describe private workspaces; shared workspaces and invitations are not implemented.
- A private `recordings` Storage bucket with a 25 MB per-file limit. Objects use `<user-id>/<recording-id>` paths. Audio bytes live in Supabase Storage, while their metadata lives in PostgreSQL.
- RLS policies limiting profiles, account documents, and recordings to their active owner. Anonymous access is denied. Account identity is enforced in the database; application writes validate shapes and relationships. Functions use a fixed search path and explicit execution grants. Runtime requests use a publishable key plus a verified user token, preserving RLS. The database credential is used only by startup migrations.

Saves are debounced and serialized. A database compare-and-swap revision detects concurrent edits from another tab or device. Conflicts retain the local edits and require exporting a backup if needed, then reloading the latest data. Failed saves display a retry action and remain in memory; do not close the page until saving succeeds or you have exported a backup. Data updates appear on other devices when they reload; this version has no realtime collaboration or offline editing.

Export JSON in Settings and download audio separately. Backup imports validate references and todo hierarchies and keep the signed-in account's identity. Existing localStorage/IndexedDB data is **not automatically adopted**: export JSON and download audio using the previous version first, then import the JSON into the desired account and upload audio again. Clear legacy browser storage after verifying the transfer. Recording uploads/deletions and metadata saves are separate service transactions; interrupted operations or backup replacement can leave unused storage objects. Deletion saves metadata before deleting audio, so a metadata conflict cannot delete another device's referenced audio. Administrators can clean up unused objects after confirming they are unreferenced.

## Deployment

```bash
npm run check
npm run build
npm start
```

Configure the Supabase variables in both build and runtime environments and allow outbound PostgreSQL and HTTPS access. Use a Node.js deployment, not a static export or Edge-only runtime. Deploy the complete `migrations/` directory alongside the app and retain all applied files; Next's output tracing includes the SQL files. All instances must use the same migration history and database. Migration failures intentionally prevent the app from serving traffic. Use backward-compatible changes during rolling deployments because older instances may still be running.

Use HTTPS outside localhost for microphone access and PWA installation. Microphone access starts only after a recording action, never by opening or reloading a studio URL. The service worker caches static assets only; account pages, API responses, and RSC payloads are not cached. Install through the browser menu (on iOS, Share > Add to Home Screen).

The AI endpoints require a validated active account. Their existing in-memory rate limiter is a per-instance safeguard; configure durable per-account quotas and infrastructure rate limits before operating a public paid AI service. Supabase's [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control) docs explain the database-level isolation.

`npm test` covers domain validation, save serialization/conflicts, migration ordering/checksums/rollback, and service-worker boundaries. To run the PostgreSQL integration checks, point `MINUTE_TEST_DATABASE_URL` at a **fresh, disposable database named `minute_test`** and run `npm test`. The integration test installs a minimal Auth/Storage schema fixture, runs the real migration, and checks RLS as anonymous and separate authenticated accounts, concurrent migrations, and full-batch rollback. It does not replace a live Supabase Auth/Storage smoke test.

## Source layout

- `app/`: server layout, URL routing, manifest, server-only AI endpoints, and CSS tokens/styles.
- `components/`: reusable UI, views, forms, and browser interaction boundaries.
- `lib/`: domain types, account persistence, validation, Supabase clients, transactional migrations, recording, and processing.
- `migrations/`: immutable, ordered SQL migrations.
- `instrumentation.ts`: automatic database initialization at server startup.
- `public/`: app icons and service worker.

Source files stay below 300 lines. The interface reuses the starter's button and card primitives, with Lucide icons and safe Markdown rendering through `react-markdown`.
