[x] by Developer on OpenAI Codex `gpt-6-luna` thinking `low` (ChatGPT account) - Implementation ~$0.4033 13 minutes; Testing a few seconds

Approve and publish menus of "Společný stůl" with a history the canteen can defend

- This builds on the [recipe catalog](recipe-catalog.md), the [consumer basket](consumer-basket.md), [portions and prices](portions-and-prices.md) and the [idea translator](idea-translator.md). The coding standards of the [first version](initial-version.md) still apply.
- Do a proper analysis of how the menu is edited and shown today before you start. Today every edit is immediately visible to everyone.

## Menu states

- A week goes through: **draft** → **ready for approval** → **approved** → **published**.
- Staff edit drafts and send them for approval. Only the manager approves and publishes.
- Parents, pupils and anonymous visitors see only published weeks.
- Selections open when a week is published.

## Revisions

- Publishing creates a revision. It stores the menu items with recipe versions, the rule set, the basket, variety and cost results, the author, the time and the ideas used in it.
- A change to a published week needs a reason and creates a new revision.
- Diners who selected a changed meal see what changed and must select again. Their old selection is not silently moved.
- Any revision can be shown exactly as it was published, even after recipes, prices or rules changed.

## "Proč je tu tohle?"

- On a published meal, a parent or pupil can open "Proč je tu tohle?".
- The answer is built from revision data: which idea it came from, what it adds to the month, what it replaced. The same explanation rules as in the idea translator apply.
- The answer uses only facts stored in the revision. When there is no reason recorded, it says so.

## Month overview for parents

- Parents see a plain-language overview of the published month: how often fish, legumes, meatless and sweet meals are served, and what the month still needs.
- Visual, no decree terms, no numbers the parent cannot interpret.
- Show why some things are limited, for example why a sweet meal cannot be twice a week.

## Publishing outside the app

- Export a published week in the format the canteen enters into iCanteen. Analyze the format from [the real menus](../docs/stavajici_jidelnicky.txt).
- The manager downloads or copies it. Nothing is sent automatically.
- A printable A4 week for the notice board.

## Done when

- A published week can be shown exactly as published, including the rule set and basket numbers, after its recipes changed.
- A change after publishing requires a reason and is visible to the affected parents.
- Nobody except staff and the manager can load a draft, also not through the API.
- "Proč je tu tohle?" never says something that is not in the revision.
- `npm run check` and `npm run build` pass.

