# Minute

A meeting recorder built with Next.js, React, strict TypeScript, and Supabase.

```bash
npm install
npm run dev
```

Create a Supabase project, copy `.env.example` to `.env.local`, and set the Supabase URL, publishable key, and Postgres connection string before starting. Open http://localhost:3000 and create an account. Supabase Auth stores credentials; the first sign-in creates an empty personal workspace.

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

## Data and deployment

Profiles and the validated workspace document are stored in Postgres, and audio is stored in a private Supabase Storage bucket. Row-level security restricts each row and recording to its authenticated owner. Changes sync across devices when the page loads. Concurrent edits on another device stop local saves and ask for a reload instead of silently overwriting remote data. Export a JSON backup from Settings; imports validate entity shapes, references, and todo hierarchies, and are bound to the signed-in account. Backups do not contain audio; download recordings separately.

`Workspace` and `Membership` remain separate types, but workspaces are currently personal. Transcripts are embedded in meetings, while workspace todos contain an array of meeting IDs. The paid AI endpoints require a verified session and enforce a database-backed limit of 30 requests per user per minute. Configure Supabase Auth email confirmation and production SMTP before inviting users.

### Migrations and deployment

Numbered SQL files in `supabase/migrations` are applied in order. `npm run dev` applies pending migrations before starting Next.js when `SUPABASE_DATABASE_URL` is set; `npm start` requires the connection string and applies migrations before serving. `npm run db:migrate` is also available directly. The runner takes a Postgres advisory lock, records a SHA-256 checksum, and refuses to run if an applied file was edited. Add a new file for each schema change.

On pushes to `main`, `.github/workflows/migrate.yml` applies pending migrations using the repository secret `SUPABASE_DATABASE_URL`. Configure that secret and ensure this workflow completes before deploying the corresponding app version. Serverless hosts that do not run `npm start` should run `npm run db:migrate` in their deployment pipeline. Use a Postgres connection string with TLS; keep it server-side only. The publishable key is safe in browser code because RLS enforces access; never use a service-role key in the app.

The old browser-only demo data is not uploaded automatically. If you have a JSON export from the previous version, restore it in Settings after signing in. Audio from the old IndexedDB store must be downloaded from the old version and uploaded again.

For production and installation:

```bash
npm run check
npm test
npm run build
npm start
```

Use HTTPS outside localhost for microphone access and PWA installation. On the first one-click recording, allow the browser's microphone permission request. If access is denied, the new meeting remains open in the studio so you can retry. The service worker caches the app shell and static assets; account data and AI processing require an internet connection. Install through the browser menu (on iOS, Share → Add to Home Screen). The service worker is disabled in development to avoid stale assets.

## Source layout

- `app/`: server layout, URL routing, manifest, server-only AI endpoints, and CSS tokens/styles.
- `components/`: reusable UI, views, forms, and browser interaction boundaries.
- `lib/`: domain types, account persistence, validation, audio storage, recording, and processing.
- `supabase/migrations/`: versioned schema, RLS, storage policies, and AI quota.
- `public/`: app icons and service worker.

Source files stay below 300 lines. The interface reuses the starter's button and card primitives, with Lucide icons and safe Markdown rendering through `react-markdown`.
