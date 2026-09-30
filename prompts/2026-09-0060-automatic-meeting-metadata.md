[ ]

[✨🧠] Populate meeting metadata from the recording without asking the user to fill forms.

Depends on [0050](2026-09-0050-stop-and-process-automatically.md). Follow [shared rules](README.md).

## Implementation context

Read `lib/types.ts`, `lib/meeting.ts`, `lib/validation.ts`, `app/api/analyze/route.ts`, `app/api/transcribe/route.ts` and the processing implementation. `MeetingAnalysis` currently has only `summary` and `todos`; `Meeting` already has title, description, date, duration, participants and languages. Extend the analysis contract and map results into these existing fields. Do not create a second meeting model.

## Automatic field policy

| Field | Source and fallback |
| --- | --- |
| Workspace and IDs | Locked recording context; never chosen by the language model |
| Date | Actual captured start time, preserving the existing ISO timestamp representation |
| Duration | Measured finalized audio; convert recording seconds to the existing meeting-minute representation consistently |
| Title | Short factual topic from the transcript; retain the localized provisional date-based title when no useful topic is available |
| Description/summary | Concise grounded description and existing Markdown summary; no generic filler |
| Participants | People explicitly participating/self-identifying in the conversation; being mentioned is not proof of attendance. Unknown names remain empty/unknown, not guessed |
| Languages | Detected speech languages within the existing supported set (`cs`, `en`); UI language is a separate preference. Unsupported/uncertain detection uses a documented nonblocking fallback without silently changing the type union |
| Status | The processing lifecycle; never a value invented by the model |

A user-selected advanced language override must be respected. The quick flow must not force the default workspace's first language onto transcription. Automatic detection is a mode of processing, not a third value inserted into `Language` without adapting validators and consumers.

## Requirements

- Use one validated structured analysis contract for metadata, summary and action extraction, not unrelated calls that disagree about the same conversation. Deterministic fields come from the recorder/server, not generated text. Bound response sizes, arrays, strings and field values before persistence.
- Treat transcript text as untrusted content. A spoken instruction to change system behavior, invent participants or execute an external action is not an instruction to the application. Do not infer attendance from a name mentioned as a third party, infer identity from a voice alone, or look up people externally.
- Metadata completion must not block on uncertainty. A conversation without named participants or a clear title still finishes without a form. Distinguish unknown from a confidently extracted fact in advanced details where useful.
- Record the meeting's relevant timezone/context for interpreting relative action dates. Do not derive the local meeting day merely by truncating a UTC timestamp. Absolute capture time remains unchanged when a speaker discusses another date.
- Preserve explicit user edits and manually scheduled metadata. Track the last generated values or equivalent field provenance in backward-compatible operational state; compare with the current revision before applying an update. Reanalysis may fill unknown/generated fields but must not erase a manual title, corrected participant or transcript.
- Existing historical records are not silently reprocessed on deployment. Reprocessing is available under advanced controls and preserves IDs, links, recordings and non-generated fields. Keep export/import compatible; any additive operational fields have safe defaults for older backups.

## Acceptance and tests

A Czech, English and mixed-language recording receives useful metadata without typing. Fixtures cover silence, unnamed speakers, third-party names, uncertain topics, unsupported speech language, timezone midnight boundaries, invalid AI output and malicious transcript instructions. Capture date/duration are accurate; unknowns are not hallucinated. A manual title/participant correction survives retry and reanalysis, including a concurrent edit from a second device. Add contract/mapping/compatibility tests and run the shared checks.
