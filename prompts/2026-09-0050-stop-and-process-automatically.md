[ ]

[✨⏹️] Make Stop save and process the conversation automatically, with reliable recovery.

Depends on [0040](2026-09-0040-zero-setup-recording-context.md). Follow [shared rules](README.md).

## Current implementation

Inspect `components/meeting-studio.tsx`, `components/recorder-panel.tsx`, `lib/use-recorder.ts`, `lib/use-meeting-processing.ts`, `lib/media.ts`, `lib/store.ts`, `app/api/transcribe/route.ts` and `app/api/analyze/route.ts`. Saving a recording and clicking Finish meeting are currently different operations; processing uses component-local state and a ref lock. Replace that separation for the default path, preserving advanced multi-take behavior.

## Required lifecycle

- Normal flow: Record → recording → Stop → finalize audio → upload → persist the recording reference → transcribe → analyze → persist results → ready. Stop is the only normal completion gesture. Pause is not completion. No second Save, Finish, Generate or Accept button is required.
- Await the final recorder data event and successful private Storage upload before processing. Persist a recoverable association between the recording and meeting before declaring upload complete. Do not call the processor with a stale React snapshot that omits the just-finished recording.
- Expose clear recording, saving, queued, transcribing, analyzing, ready and failed states. These are processing states, not a replacement for the existing domain `MeetingStatus`. Never show ready or saved until the corresponding durable write is acknowledged.
- Move orchestration out of the mounted studio component. After a durable job is accepted, processing must continue without the page staying open. Implement a deployment-supported durable runner with persisted checkpoints and authenticated job ownership; an unawaited promise after an HTTP response is insufficient. Select and document the smallest compatible runtime after checking the actual deployment. Required worker provisioning is part of this task; create an exact Actions handoff only when access blocks it.
- Persist job identity, stage, input recording IDs/revisions, attempts and a safe error category. Use an idempotency key and an atomic claim/lease so two tabs, repeated requests or workers cannot publish duplicate effects. Existing saved transcription must be reused. New audio creates a new input version without duplicating old segments.
- Keep `public.account_data` and current domain relationships. Any auxiliary job table/fields must be additive, ownership-protected and covered by migrations/RLS tests. Workers need narrow documented privileges; no service-role or database-owner credentials in browser/request-handler code, no durable storage of user bearer tokens as a shortcut.
- Concurrent user edits require a revision-aware patch of the affected meeting/results, not replacement with an old account snapshot. Unrelated todos, manual edits, deletions and another device's work must survive. Retry transient failures with bounded backoff; permanent errors wait for a visible retry after correction.
- Preserve audio during upload failure and retain the current recorder's retry/download recovery. Explain that closing before upload acknowledgement can lose unsaved capture; do not claim offline durability that has not been implemented. Reauthentication must not discard recoverable work or cross account boundaries.
- Respect current 25 MB object limits and deployment request/time limits. Prevent a normal long recording from ending in a demand to manually split a file: implement bounded, independently decodable recording segments or another tested automatic segmentation strategy, with correct ordering and total duration. Keep the existing upload formats and validate each segment. Document and test the supported limits rather than promising unlimited recording.
- Silence, missing credentials, exhausted limits and partial failures preserve available audio/transcript and show a truthful status. No invented transcript/todos. A manual transcript remains an advanced fallback, never the required happy path.

## Acceptance and tests

Stop once after a real short recording produces persisted results automatically. Test delayed final audio, slow upload, network loss, route change, reload, tab closure after enqueue, worker restart, double Stop, duplicate delivery and a stale device. Verify exactly one publication, checkpoint reuse and account isolation. Test segmentation at the configured boundary and no-speech/configuration errors. Existing advanced pause/resume, uploads and multiple takes continue to work. Run the shared checks and hosted storage/worker smoke test; record unavailable external checks honestly.
