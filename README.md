# Minute.

A local-first call recorder, notes workspace, and action-item tracker built with Next.js, React, and strict TypeScript.

## Run

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The overview opens with Alex’s demo account.

| Demo account | Email             | Password  |
| ------------ | ----------------- | --------- |
| Alex Morgan  | alex@minute.demo  | minute123 |
| Sarah Chen   | sarah@minute.demo | minute123 |

Use the account menu to sign out or switch users. Sign-up and password recovery are **local demo flows**, not production authentication. Use demo-only passwords. New account password values are hashed before being stored; the browser data itself is not access-controlled.

## Features

- Separate workspaces for each local user, initialized with sample calls and tutorial tasks.
- Overview, favorites, searchable calls, card/list/calendar views, and clickable breadcrumbs.
- Recording studio at `/<workspaceId>/recording`, opened in a new tab. Record, pause, resume, play back, and combine microphone recordings with multiple MP3, MP4, M4A, MPEG, WAV, or WebM files (200 MB per file; codec playback depends on the browser).
- Optional live transcription through the browser’s speech-recognition service. Browser and language support vary; the service may process audio remotely. It is off by default. Uploaded files are **not automatically transcribed**.
- Editable notes and action-item drafts generated locally from transcript text. The generator is rule-based, not an AI model, and detects English/Czech follow-up phrases. Transcripts, notes, and recordings may be in any language.
- Workspace-level action items with multiple linked calls, parent/subtask hierarchy, cyclic related-item links, due dates, assignees, discussion, and change history.
- Markdown and CSV downloads; PDF via the browser’s **Print / Save as PDF** dialog.
- English/Czech UI, light/dark appearance, responsive layouts, and keyboard search (`Cmd/Ctrl+K`).

## Storage and extension points

`lib/minute/types.ts` defines the domain objects. `sample-data.ts` seeds each workspace. `storage.ts` owns audio persistence and local account helpers. `utils.ts` contains the transcript draft generator and export serializers. Reusable UI and feature components live in `components/minute`; starter primitives remain in `components/ui`.

Calls and tasks are stored in `localStorage` under per-user keys; audio blobs are stored in IndexedDB under user/workspace/recording keys. Changes sync across open tabs. Clearing browser data removes the local data. There is no backend, cloud synchronization, or production authorization. Audio remains in memory until **Save call** succeeds; download individual clips if storage is full.

Stable call and task IDs, explicit workspace boundaries, many-to-many call/task references, and separate storage/export functions provide extension points for server persistence, transcription services, and future Google Calendar/Trello/Jira adapters. No external integrations are connected yet.

## Checks

```bash
npm run check
npm run build
```

Browser verification covers navigation, task completion/history, calendar view, Czech UI, dark mode, mobile layout, demo sign-in/account isolation, transcript-to-notes generation, and saved-call persistence. Microphone capture needs browser permission; automated file-upload verification also requires the browser extension’s file URL access.
