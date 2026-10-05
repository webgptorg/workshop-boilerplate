# Minute

A local-first meeting recorder built with Next.js, React, and strict TypeScript.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The first visit creates Alex Morgan's demo account, one workspace, sample meetings, and tutorial todos.

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

Workspace metadata is persisted in `localStorage`; original audio is stored in IndexedDB. No database or sign-in is required for this first version. Data does not sync between devices, and deep links resolve only where the relevant workspace data exists. Export a JSON backup from Settings and download audio separately before clearing browser data. Imports validate entity shapes, references, and todo hierarchies.

`Workspace` and `Membership` are separate types to make future shared workspaces possible. Transcripts are embedded in meetings, while workspace todos contain an array of meeting IDs. The single demo account is not an authentication system. Before exposing the paid AI endpoints publicly, add authentication and durable per-account limits; the current same-origin checks and in-memory rate limiter are intended for the personal first version.

For production and installation:

```bash
npm run check
npm start
```

Use HTTPS outside localhost for microphone access and PWA installation. On the first one-click recording, allow the browser's microphone permission request. If access is denied, the new meeting remains open in the studio so you can retry. The service worker caches the app shell, visited pages, and static assets; AI processing requires an internet connection. Install through the browser menu (on iOS, Share → Add to Home Screen). The service worker is disabled in development to avoid stale assets.

## Testing

Install the Playwright Chromium browser once after installing dependencies:

```bash
npx playwright install chromium
# Linux CI may also need system dependencies:
# npx playwright install --with-deps chromium
npm run test:e2e
```

`npm run test:e2e` uses a `tsx`/`ts-node` TypeScript launcher and Playwright Test. It builds the app, starts a fresh production server at http://127.0.0.1:3100, and stops it after the tests. Keep that port free. Production mode is required to test the service worker. Each test gets isolated browser storage, a synthetic microphone stream recorded by the browser's native `MediaRecorder`, and mocked AI responses, so no microphone hardware or API key is needed. The launcher only transpiles; `npm run typecheck` checks all test source with strict TypeScript.

The browser suite covers onboarding, workspace isolation and language inheritance, meeting and todo editing/deletion, nested todos, search/filtering, recording consent and pause/resume, audio upload/download, transcript editing/export, AI processing and retries, preferences, validated backup restore, and offline navigation. It recreates the backup, recording-intent, and service-worker regressions from the existing unit tests through browser behavior. `npm test` remains the fast unit suite; `npm run check` runs lint, strict type checking, unit tests, and the production browser suite, including the build.

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
- `lib/`: domain types, demo data, persistence, validation, audio storage, recording, and processing.
- `public/`: app icons and service worker.

Source files stay below 300 lines. The interface reuses the starter's button and card primitives, with Lucide icons and safe Markdown rendering through `react-markdown`.
