# Minute

A meeting recorder built with Next.js, React, strict TypeScript, and Supabase Auth/PostgreSQL.

Configure Supabase as described below, then run `npm run dev` and open http://localhost:3000. The app opens on the login screen. Sign in with **test@ptbk.io** / **password123** to use the development account, with one workspace, sample meetings, and tutorial todos. You can also register with an email and password. No email verification or social login is implemented.

## Supabase setup

Use Node.js 22 or newer. Install dependencies with `npm install`. Copy `.env.example` to `.env.local` only if you do not already have configured Supabase settings in an ignored environment file. Never commit the database URL, database password, certificate, or administrative keys.

### Hosted project

1. Create a Supabase project or use your existing project.
2. In **Authentication > Sign In / Providers > Email**, enable email/password signup and disable **Confirm email**. This setting is required for immediate registration without sending an email. The app checks the public Auth settings before signup and refuses registration if confirmation is enabled, so it does not initiate an unwanted email. See [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords). Set the minimum password length to at least 8. Leave social providers disabled. This app treats email as a login identifier, not proof of ownership; verified-email features can be added later using Supabase Auth.
3. Copy the project URL and **publishable key** into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. A legacy anon key also works. Never put a secret/service-role key in a `NEXT_PUBLIC_` variable. The app does not need an administrative API key.
4. Copy a PostgreSQL connection URL from **Connect** into `SUPABASE_DATABASE_URL`. Use the direct connection or the **session pooler** when IPv4 is needed, with the project's database password properly URL-encoded. Download the database CA certificate and put its PEM content in `SUPABASE_DATABASE_CA`, using `\n` for line breaks if stored on one line. Hosted connections verify TLS; when no custom certificate is supplied, the system trust store is used. Localhost connections use plain TCP.
5. Run `npm run db:migrate`, then `npm run dev`. The initial migration creates the development account only when test-user seeding is enabled. Development defaults to enabled. Existing accounts are preserved and their passwords are never reset.

### Local project

Install and start Docker Desktop or a compatible Docker runtime. The Supabase CLI is included as a development dependency. Its local services need Docker; `npm run dev` itself does not install or start Docker.

```bash
npm install
npm run db:local
npx supabase status
```

Copy `.env.example` to `.env.local` and set the **publishable/anon key** printed by `supabase status`. Keep the local URL `http://127.0.0.1:54321` and database URL `postgresql://postgres:postgres@127.0.0.1:54322/postgres`. The checked-in `supabase/config.toml` disables email confirmation and email sending. Studio is available at http://127.0.0.1:54323.

```bash
npm run db:migrate
npm run dev
```

Stop local services with `npx supabase stop`. Avoid `supabase db reset` unless you intend to erase local data. The application migration runner, rather than Supabase CLI migrations, owns the root `migrations/` directory.

## Database migrations

SQL files live in `migrations/`, beginning with `2026-10-0000-initial-database.sql`. Add later files using **YYYY-MM-XXXX-description.sql**, with a unique, increasing four-digit number for each month. Do not edit, rename, or remove an applied migration. Add a new migration for schema changes. Do not add `BEGIN`, `COMMIT`, or `ROLLBACK` to migration files.

`npm run db:migrate` uses the same runner as Next.js startup, launched through `tsx` and `ts-node`. Next.js `instrumentation.ts` awaits migrations before `next dev` or `next start` handles requests. Builds do not connect to the database. The runner obtains a PostgreSQL advisory transaction lock, checks filenames and SHA-256 checksums against `private."Migration"`, and applies **all pending migrations and history entries in one transaction**. A failure rolls the whole batch back and prevents startup. Repeat startup is a no-op after checking history. Keep `migrations/` available in the deployed server's working directory, including in standalone/container deployments.

The database must use UTF-8. Application tables use quoted PascalCase singular names (`User`, `AppData`, `Migration`), with camelCase columns, constraints, functions, policies, and triggers. Supabase-owned `auth` tables retain their vendor names. Database timestamps use `timestamptz`; application dates use ISO 8601 and due dates use `YYYY-MM-DD`. Names are limited to 80 characters, emails to 254, snapshot text values to 200,000 characters, and snapshots to 20 MiB.

### Production

Set `DB_SEED_TEST_USER=false` before the initial migration in a hosted production project. If a development database already contains the known test credentials, change that account's password or delete it through Supabase Auth before deploying. Hosted production startup refuses **test@ptbk.io / password123**, including if seeding was enabled explicitly. Local production-mode browser tests may retain this account.

```bash
NODE_ENV=production npm run db:migrate
npm run check
npm run build
npm start
```

Supply the public Supabase settings at build time and the server database settings at runtime. Use separate Supabase projects for development and production. Run the server with a database role that can apply migrations; never expose that connection to the browser. Keep Supabase Auth's rate limits configured for your deployment. Paid AI requests require a server-verified Supabase access token and have a per-account in-memory throttle; distributed billing quotas still require a shared limiter if you scale to several server instances.

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

Audio uploads accept files up to **500 MB** (500 × 1024 × 1024 bytes) and **5 hours** each by default, subject to available browser storage. Set `NEXT_PUBLIC_MAX_AUDIO_UPLOAD_SIZE_MB` and `NEXT_PUBLIC_MAX_AUDIO_UPLOAD_DURATION_HOURS` in `.env.local` to adjust either limit, then rebuild the app. Both settings accept positive numbers, including fractions; missing or empty values use the defaults, and invalid values cause a configuration error. Shared defaults and validation live in `lib/audio-upload-configuration.ts`. The studio displays the configured limits and rejects files whose duration cannot be determined. Supported inputs include MP3, M4A, MP4, WAV, WebM, OGG, and FLAC.

Local upload limits are separate from automatic transcription: the [OpenAI transcription API](https://developers.openai.com/api/docs/guides/speech-to-text) accepts at most 25 MB per request. Larger recordings are saved and can be played or downloaded, but must be split into smaller files for automatic transcription. The app does not automatically split audio. See also the [structured output documentation](https://developers.openai.com/api/docs/guides/structured-outputs).

Without an API key, recordings and manually edited transcripts still work. Where supported, browser speech recognition supplies live captions; its availability and processing depend on the browser. Automatic summaries and todo extraction need the server connection.

## Persistence and offline use

Supabase Auth stores accounts and password hashes. `public."User"` stores the corresponding profile; an auth trigger creates the profile for new accounts and keeps email changes in sync. Stable Auth UUIDs link data to accounts so email changes and future third-party identities can retain the same data.

`public."AppData"` stores one validated, versioned JSON snapshot per account. This preserves the existing `Workspace`, `Membership`, `Meeting`, and `Todo` model and saves related edits atomically. Metadata, preferences, transcripts, and todos sync across devices after a save; audio files remain in account-specific IndexedDB on the recording device. Download audio separately before clearing browser storage. JSON backups contain metadata and transcripts, not audio.

RLS restricts every application data operation to `auth.uid()`. Anonymous access is denied. The browser uses only the publishable key and the signed-in user's token, never a service-role key. The `saveAppData` function runs as the caller, checks the expected revision, and updates the profile and snapshot in the same database transaction. A stale device cannot silently overwrite another device's work.

Changes are cached in account-specific `localStorage` and saved automatically. The save indicator distinguishes saved, pending/offline, and conflicting changes. Offline work retries on reconnect; pending edits also survive reload. Signing out first flushes saves, clears that account's metadata cache, and returns to login. If a save fails, reconnect or resolve the conflict before signing out. For conflicts, export a backup in Settings, choose **Reload data from Supabase**, then confirm replacement of the local draft. Backups restore workspace content and preferences while retaining the currently signed-in account's ID and email.

There is no automatic transfer of the old, unauthenticated demo cache. Existing JSON exports can be restored from Settings after login. Account-scoped audio storage starts fresh; keep previously downloaded audio for re-upload.

Use HTTPS outside localhost for microphone access and PWA installation. Opening or reloading a studio never requests microphone access. The service worker caches only the generic app shell, visited pages, and static assets; it never caches Supabase data, API responses, or session tokens. Returning authenticated users can open cached data offline; first login, registration, synchronization, and AI processing require connectivity. Install through the browser menu (on iOS, Share > Add to Home Screen). The service worker is disabled in development.

## Testing

Install the Playwright Chromium browser once after installing dependencies:

```bash
npx playwright install chromium
# Linux CI may also need system dependencies:
# npx playwright install --with-deps chromium
npm run test:e2e
```

`npm run test:e2e` uses a `tsx`/`ts-node` TypeScript launcher and Playwright Test. It builds the app, starts a fresh production server at http://127.0.0.1:3100, and stops it after the tests. Keep that port free. Production mode is required to test the service worker. Each test gets isolated browser storage, a fresh in-memory PostgreSQL database, a database-backed Supabase API fixture, a synthetic microphone stream recorded by the browser's native `MediaRecorder`, and mocked AI responses, so no Docker, microphone hardware, Supabase project credentials, or AI API key is needed. The test launcher also supplies an isolated PostgreSQL socket server so production startup applies the real migrations. Public environment values are replaced for tests; the configured project is never used. The launcher only transpiles; `npm run typecheck` checks all test source with strict TypeScript.

The browser suite covers initial-user login, incorrect passwords, logout and protected deep links, registration without email, persistence after clearing browser cache, onboarding, workspace isolation and language inheritance, meeting and todo editing/deletion, nested todos, search/filtering, recording consent and pause/resume, audio upload/download, transcript editing/export, AI processing and retries, preferences, validated backup restore, and offline navigation. It recreates the backup, recording-intent, and service-worker regressions from the existing unit tests through browser behavior. `npm test` also verifies password seeding, RLS isolation, rejected identity changes, text limits, stale revisions, migration integrity, and rollback of multi-file migration batches; `npm run check` runs lint, strict type checking, unit tests, and the production browser suite, including the build.

Pass Playwright arguments through the launcher to select or debug tests:

```bash
npm run test:e2e -- --grep "studio" --headed
npm run test:e2e -- --list
npx playwright show-report
```

HTML reports are saved to `playwright-report/`; failure screenshots and traces are saved to `test-results/`. Both directories are ignored by Git. Browser tests and their shared fixtures live in `tests/e2e/`.

## Source layout

- `app/`: server layout, URL routing, manifest, server-only AI endpoints, and CSS tokens/styles.
- `components/`: reusable UI, views, forms, and browser interaction boundaries.
- `lib/`: domain types, demo data, Supabase access, database migrations/persistence, validation, audio storage, recording, and processing.
- `migrations/`: ordered transactional application SQL.
- `supabase/`: local Supabase configuration.
- `scripts/`: the standalone migration launcher.
- `public/`: app icons and service worker.

Source files stay below 300 lines. The interface reuses the starter's button and card primitives, with Lucide icons and safe Markdown rendering through `react-markdown`.
