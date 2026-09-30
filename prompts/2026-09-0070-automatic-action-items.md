[ ]

[✨✅] Turn the finished conversation into useful linked todos automatically and without duplicates.

Depends on [0050](2026-09-0050-stop-and-process-automatically.md) and [0060](2026-09-0060-automatic-meeting-metadata.md). Follow [shared rules](README.md).

## Context

Inspect `app/api/analyze/route.ts`, `lib/types.ts`, `lib/use-meeting-processing.ts`, `lib/validation.ts` and todo forms/detail views. Automatic extraction already exists, but deduplication compares normalized titles and priority defaults to medium. Extend that implementation rather than introducing a separate task database or an arbitrary action executor.

## Requirements

- After Stop, create supported action items automatically as the existing `Todo` records, with stable IDs, the original workspace, `meetingIds`, title, factual description and creation time. No required approval dialog, assignee form or deadline picker in the normal path.
- Extract explicit actionable commitments, not hypothetical ideas, quoted instructions or everything that sounds like a command. Zero todos is a valid successful result. Keep a short supporting transcript quote in the description and include an explicitly assigned person there; the current schema has no assignee field, so do not invent a separate assignment model.
- Use a deadline only when stated or unambiguously resolved against the meeting date and timezone. Validate calendar dates, not only their shape. Unknown/ambiguous deadlines are the existing empty string. Do not convert an unspecified deadline to today.
- Infer high/low priority only from clear evidence; otherwise use medium. Preserve existing `completed`, `parentId` and manual changes. Do not mark a task completed because somebody says the word done in unrelated speech. Do not manufacture nested subtodos without explicit structure.
- Deduplicate using persisted extraction/source identity and the processing input version, not only display titles or array positions. Handle duplicates inside a single model response, across retries and across incremental recordings. The same title can legitimately refer to different actions; the same action can be phrased differently after retry. Define a deterministic matching policy and test both cases.
- Persist publication/checkpoint state atomically with its domain patch, or provide an equivalent transactional idempotency guarantee. A crash between saving todos and acknowledging a job must not create another set on retry.
- Keep provenance sufficient to reconcile regenerated suggestions with the existing todo ID. Never reset manual description, deadline, priority, completion or user-created subtodos. A generated task that the user deleted must not reappear on every identical retry; retain a source suppression marker or equivalent backward-compatible operational record.
- Partial failure can retry action publication without retranscribing saved audio or duplicating the already saved summary. Preserve the existing account revision conflict rules and prevent cross-workspace/cross-user links.
- The inspected application has no external action execution engine. This PRD automates creation of internal todos, not sending email, editing GitHub, scheduling third-party events or executing arbitrary code from a transcript. Keep any later external executor behind explicit, separately authorized capabilities; do not equate a spoken mention with authorization.

## Acceptance and tests

Use fixtures for no commitments, clear assignments/deadlines, relative dates, ambiguous dates, same-action paraphrases, distinct same-title tasks and duplicate model entries. Repeated delivery/Stop/retry creates one logical set of todos. Reanalysis after a manual edit preserves ID and edits; completed/deleted tasks do not reset or reappear. Additional audio can add a genuinely new action without duplicating the old ones. Include concurrent device writes, malformed model output and account isolation. Run shared checks and verify the saved todo list after reload on another device.
