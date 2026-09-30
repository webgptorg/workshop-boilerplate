[ ]

[✨🎙️] Make every authenticated account ready to record without setup or metadata forms.

## Context and scope

Work on `app/minute`. Read the shared rules in [README](README.md), then inspect `lib/account.ts`, `lib/meeting.ts`, `lib/recording-intent.ts`, `components/app-shell.tsx`, `lib/store.ts`, `app/api/state/route.ts` and `lib/validation.ts`. Default account creation and the red recording entry point already exist. Consolidate them rather than adding a parallel flow. This task creates the context and intent; processing belongs to PRD 0050 and the final visual simplification to 0080.

## Requirements

- A new email or OAuth account gets one personal workspace, owner membership and safe preferences without asking for a workspace name, profile name or language. Derive supported UI language from the browser when no saved preference exists; use a deterministic fallback. Provider display names are optional hints, never account identifiers.
- Resolve a recording workspace in this order: the valid workspace explicitly open in the current route, the last valid selection for this account, then the first available workspace. Create a default workspace only when none exists. Do not change an existing workspace's ID, name or settings and do not move a meeting after recording begins.
- Use one shared start-recording operation for all entry points. Capture the authenticated account ID, selected workspace ID and recording intent together. Bind async work to that identity so switching accounts cannot save into the next account.
- Immediately create a usable provisional meeting with a stable ID and localized date-based title; fill the actual start timestamp automatically. Do not make title, participants, languages, description or duration required user input. Do not use the old scheduled-meeting default of 30 minutes as recorded duration. Scheduled meeting creation remains unchanged behind advanced controls.
- Recording language defaults to automatic detection in the quick flow, not a forced English setting inherited from the current seed. Keep UI/output language separate from recognition language. Preserve explicitly selected advanced overrides without adding an onboarding choice.
- Request microphone access only following the deliberate Record action and consume each intent once. Opening/reloading/bookmarking a studio URL, finishing OAuth or restoring account data must not start recording. Guard double taps, concurrent initial account creation and repeated auth events against duplicate workspaces or meetings.
- Do not assume `state.workspaces[0]` always exists. Handle loading, an empty valid account and deleted selections without a crash or wrong-workspace write. An invalid/deleted direct meeting URL must not manufacture another meeting.
- Permission refusal, unavailable microphone or failed initial save leaves a recoverable state with a retry action, not a completed meeting. Avoid accumulating abandoned empty records on repeated failures. Keep existing revision-conflict handling and do not silently overwrite a concurrent device.

## Acceptance and tests

1. Fresh and returning users can start through Record alone, apart from browser permission. No text field or setup modal appears.
2. Account initialization retries create exactly one default workspace. A user with several workspaces records into the explicit selection; deleted selections fall back safely.
3. Rapid double tap produces one meeting and one capture. Studio reload requests no microphone. Account A's delayed operation cannot mutate account B.
4. The provisional record validates, survives save/reload, keeps the existing schema/links and uses actual recording time. Existing scheduled meetings and backup imports still work.
5. Add focused bootstrap/workspace/intent tests and run the checks from [README](README.md). Document any additive preference or operational-state change and its compatibility behavior.
