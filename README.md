# Minute

Minute is a small meeting recorder built with Next.js. It captures microphone audio, creates a live transcript when the browser supports speech recognition, and turns the transcript into an editable summary and action items.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Microphone recording requires browser permission and a secure context such as localhost or HTTPS. If live transcription is unavailable, type or paste a transcript and choose **Create notes**.

Summaries and action items are generated from transcript text in the browser using simple sentence and action phrase matching. They are starting points to review and edit, not AI-generated minutes. Meeting details are stored in local storage and audio recordings in IndexedDB. Live transcription may use the browser vendor's speech service.

Run `npm run check` and `npm run build` before shipping changes.
