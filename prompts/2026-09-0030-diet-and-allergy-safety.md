[-]

Add a verified allergy and special-diet workflow to "Společný stůl"

- This builds on the [user system](0010-user-system.md), [recipe catalog](0060-recipe-catalog.md), [consumer basket](0020-consumer-basket.md) and [menu publishing](0040-menu-publishing.md). Their coding standards still apply.
- Before implementation, inspect how parent preferences, recipe allergens, diner links and published menu revisions currently work. Read the allergy and diet limitations in [the analysis](../docs/01-analyza.md) and the supplied source menus; do not treat their allergen codes as verified facts.

## Safety boundary

- Free-text preferences remain useful context for the canteen, but they are not an allergy declaration, a diet order or a filter. Keep the warning from the user system visible wherever preferences are edited.
- A parent cannot create or approve a safe diet meal by writing a preference. The canteen's existing official diet and allergy process remains authoritative.
- Never infer that a meal is safe from its name, category, ingredient text, model output or unconfirmed allergen data.
- A missing or unconfirmed ingredient, allergen, cross-contact status or diner instruction must be presented as unknown. Never turn missing data into a safety assurance.

## Verified allergen information

- Build on ingredient-level allergen declarations and manager confirmation from the recipe catalog. Preserve the source and confirmation history for every declaration.
- Provide a manager workflow to review conflicting source-menu data, verify the ingredient and recipe allergen matrix, and record who confirmed it and when.
- Derive recipe allergens from its current ingredient version. Require explicit manager confirmation before showing them as confirmed to a parent or pupil.
- When a recipe version changes, invalidate its prior confirmation wherever the changed ingredients could affect allergens. Published revisions retain the facts and confirmation state they contained at publication time.
- Keep contamination and kitchen handling notes separate from ingredient allergen declarations. Do not imply that a recipe is free from cross-contact unless the canteen explicitly confirms the handling process.

## Special diets

- Let the canteen record the official diet arrangements it supports, the eligible diner links, validity dates and review status. Do not expose medical details to other families or pupils.
- Let authorized canteen staff see only the minimum diet instructions needed for meal preparation and service. Log access and changes with actor, time and reason.
- A special-diet menu item must reference a verified recipe version and a canteen-approved diner assignment. It must not be substituted automatically based only on a free-text preference.
- If no verified suitable meal is assigned, show a clear unresolved status to the parent and authorized staff. Do not silently mark the standard alternative as suitable.
- Published menu changes that could affect an assigned diner require staff review and must notify the parent through the configured email interface after approval. Preserve the prior assignment and its history.

## Permissions and privacy

- A parent can submit or update a request for their linked diner, but only authorized canteen staff can verify and activate an official arrangement.
- Staff see operational instructions; managers can review and administer arrangements. Pupils and unrelated parents cannot access another diner's diet details.
- Enforce ownership and role checks in server actions and API responses. Requests for another family's diner return `404`.
- Account data export and deletion must cover diet requests and audit records consistently with the account deletion policy.

## Done when

- Unconfirmed or conflicting allergen data is never presented as verified or safe.
- A recipe change affecting allergen data invalidates its current confirmation and is visible to the manager.
- Free-text preferences cannot create a special-diet assignment or suppress a standard meal warning.
- A parent can submit a request, authorized staff can verify it, and a published change produces a reviewable history and notification.
- A parent or pupil cannot retrieve another diner's diet information through the UI or API.
- `npm run check` and `npm run build` pass.
