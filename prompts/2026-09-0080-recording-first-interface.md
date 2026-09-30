[ ]

[✨🔴] Make the default Minute interface a large recording button, with advanced controls one deliberate step away.

Depends on [0040](2026-09-0040-zero-setup-recording-context.md), [0050](2026-09-0050-stop-and-process-automatically.md), [0060](2026-09-0060-automatic-meeting-metadata.md) and [0070](2026-09-0070-automatic-action-items.md). Follow [shared rules](README.md).

## Current surfaces

Inspect `components/dashboard.tsx`, `components/app-shell.tsx`, `components/sidebar.tsx`, `components/meeting-studio.tsx`, `components/recorder-panel.tsx`, `components/studio-context.tsx`, meeting/todo details, `components/forms/`, `components/settings-view.tsx` and the existing CSS tokens. Preserve domain features and routes; change their prominence, not their existence.

## Default experience

- After sign-in, show one dominant red **Record call / Nahrát hovor** control immediately, with the current workspace visible but not demanding selection. A small recent-conversations/result list and unobtrusive access to todos are acceptable. Remove competing creation buttons, statistics panels, tutorials and forms from the primary visual hierarchy.
- During capture, show recording state, elapsed time and a large **Stop / Zastavit** control. Pause/resume may remain secondary. The state cannot rely on red color alone. Accidental double taps must not create duplicate operations.
- Stop invokes the complete pipeline from 0050. Show saving/processing progress and then the generated result automatically. A completed result shows the title, concise summary and action items first; raw transcript, participant/language controls, manual editing, uploads and recording management are secondary.
- Keep errors, unsaved audio, save conflicts, processing failures, privacy/permission notices and recovery actions visible. Progressive disclosure must not conceal a data-loss warning or falsely suggest that work is saved.

## Advanced controls

Add a consistent **More / Advanced / Pokročilé** entry or overflow menu. From there retain workspace create/edit/switch, scheduled/manual meeting creation, title/date/participant/language overrides, uploads and multiple takes, transcript editing, reprocessing, complete todo editing, hierarchy/priority/deadlines, filters/search, backups/import/export, profile/preferences and supported destructive actions. Avoid duplicating business logic between simple and advanced views.

Advanced controls are collapsed by default, including on a returning user's ordinary home view; an explicit advanced deep link may remain open. Existing meeting/todo/studio URLs continue to resolve. Editing a legacy record must not trigger automatic recording or regenerate all of its data. Preserve confirmation/recovery protections for deletion.

## Interaction and accessibility

No application keyboard input or mandatory setup dialog is required between completed authentication and a processed conversation. Native permission dialogs and provider authentication are unavoidable exceptions, not hidden workarounds. Do not open/focus text inputs automatically on mobile. Retain keyboard accessibility even though typing is unnecessary.

Reuse existing components/design tokens. Support Czech/English, light/dark/system modes, screen-reader labels, visible focus, accessible progress announcements and touch targets of at least 44 CSS pixels. Test a 320-pixel-wide viewport without horizontal scrolling. The watch example is a small-screen interaction constraint; do not add a native watchOS project or promise unsupported background/telephone recording.

Do not automatically add supporting copy, generic subtitles or empty reassurance beneath every heading. Labels, state and actual results should carry the meaning.

## Acceptance and tests

Run the complete mouse/touch-only flow with a fresh and existing account: sign in, Record, permission, speak, Stop, read result. Verify no metadata forms or extra Finish click. Test denied microphone, lost network and recovery. Audit that every pre-existing advanced capability remains reachable and deep links/import/export still work. Test mobile/desktop, both languages/themes, keyboard focus and screen-reader status. Add end-to-end tests that assert the interaction count and run the shared checks.
