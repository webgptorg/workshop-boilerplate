# Minute

A personal meeting workspace built on the Promptbook Next.js starter. Record a conversation, upload audio, or paste a transcript to create meeting notes, decisions, and actionable TODOs.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`. The key is used only on the server.
3. Start the app with `npm run dev` and open `http://localhost:3000`.

## Features

- Microphone recording with pause/resume, a timer, playback, and retryable processing.
- Audio uploads in MP3, MP4, M4A, MPEG, WAV, and WebM formats, up to 24 MB.
- AI transcription with `gpt-4o-mini-transcribe`; structured notes and action items with `gpt-4o-mini`.
- Searchable meetings, collections, favorites, grid/list views, and a complete action list.
- Notes, transcript, decisions, action owners, stated deadlines, task completion, and Markdown export.
- Local persistence: meeting data in localStorage; recordings in IndexedDB.
- Responsive desktop/mobile layouts and keyboard-accessible dialogs.

Sample meetings are labeled and can be hidden with **Start fresh**, or enabled again in Settings. They are examples, not recordings. New recordings always use the actual AI service.

## Recording and storage

Recording captures the microphone, not system audio. For online meetings, upload the conferencing tool’s recording to include remote participants. Microphone capture requires HTTPS or localhost and browser permission. Recording stops at 60 minutes or approximately 23 MB, whichever comes first.

Audio and transcripts are sent to OpenAI only when you select **Create notes & action items**. Review generated notes for accuracy. The browser saves notes and recordings after successful processing; clearing browser data removes them. Export notes and download audio for a backup. This starter has no accounts or cross-device sync and is intended for a personal local workspace. Add authentication, durable storage, and usage controls before exposing it as a shared public service.

API errors leave the input in the dialog for retry. Missing credentials, unsupported files, empty recordings, and oversized files produce actionable error messages. API keys and upstream error details are never sent to the browser.

## Project structure

- `app/page.tsx`: server-rendered entry point.
- `components/workspace.tsx`: meeting library, navigation, settings, and action list.
- `components/recorder.tsx`: browser recording, uploads, transcript input, and processing.
- `components/meeting-detail.tsx`: meeting notes, audio, tasks, and export.
- `app/api/meetings/route.ts`: server-side transcription and structured notes.
- `lib/meetings.ts`: shared types, validation, export, and sample data.
- `lib/audio-storage.ts`: IndexedDB audio storage.
- `app/globals.css`: application tokens, responsive styling, and preserved Promptbook brand values.

## Checks

```bash
npm run check
npm run build
```

Implementation references: [OpenAI audio transcription](https://developers.openai.com/api/docs/guides/speech-to-text) and [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
