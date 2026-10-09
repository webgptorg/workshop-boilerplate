# Notes

A small collaborative notes app built with Next.js, strict TypeScript, CodeMirror, and Yjs. Create a room, share its link, and write together with live cursors. Visitors can choose a name or stay anonymous as a friendly hedgehog.

The workspace includes recent rooms, search, personal stars, participant presence, automatic saving, text downloads, undo/redo, and a focus mode. Room lists, stars, and display names stay in the visitor’s browser; note text is shared by the server.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Development uses server memory and needs no database or credentials. Open a room link in another browser or an incognito window to try collaboration. Local notes survive browser reloads but are removed when the server restarts.

## Configure Supabase for production

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor. This creates the rooms table, enables row-level security, and adds it to the realtime publication.
2. Copy `.env.example` to `.env.local` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Keep the service-role key on the server; it is never sent to the browser.
3. Run `npm run build` and `npm start`.

Production requires Supabase by default. For a local production preview, use `NOTES_STORAGE=memory npm start`. To test Supabase while running the development server, set `NOTES_STORAGE=supabase`.

Rooms use unguessable IDs. Anyone with the room link can read and edit; there are no accounts or private-room permissions. Supabase tables have no anonymous access policy: the Next.js API owns reads and writes.

## How collaboration works

- `components/collaborative-editor.tsx` binds CodeMirror to a shared Yjs text, including remote selections and per-user undo.
- `lib/room-connection.ts` sends batched CRDT updates over HTTP and receives updates through a server-sent event stream. Pending edits are retried after reconnecting; keep the tab open until they are saved.
- `lib/room-store.ts` manages local rooms or Supabase persistence. Supabase uses versioned compare-and-swap writes so simultaneous updates from multiple server instances merge safely. Realtime database events distribute changes, broadcast shares ephemeral presence, and periodic reconciliation recovers missed database events.
- `app/api/rooms/[id]/route.ts` validates room requests and exposes the transport.

Host the app on a Node.js platform that supports streaming HTTP responses and outbound Supabase realtime connections. Disable proxy buffering for `/api/rooms/*`. Supabase persists room text; presence is ephemeral and expires when a visitor disconnects.

## Verify

```bash
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests exercise two independent visitors, live text/title/cursor/presence updates, concurrent offline edits and reconnection, room creation, sharing, starring, downloads, focus mode, mobile navigation, and invalid API requests. They start a development server or reuse the one on port 3000. Set `NOTES_TEST_URL` to test another running instance.

Promptbook brand tokens remain in `app/globals.css`; the workspace reuses the starter’s UI primitives.
