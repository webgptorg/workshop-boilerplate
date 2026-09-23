[ ]

Replace the illustrative meals of "Společný stůl" with a recipe catalog

- This builds on the [first version](initial-version.md) and the [user system](user-system.md). Their coding standards still apply.
- Do a proper analysis of the current `meals` table, `lib/seed.ts` and `lib/planner.ts` before you start. Today one `meals` row is both the recipe and its place in the menu, and ingredients are free text.

## Recipes and menu items

- Split what can be cooked from when it is served.
    - **Recipe** (receptura): name, side, icon, category, soup or main course, ingredients with weights, allergens, required equipment, notes.
    - **Menu item**: a recipe version on a date in a slot (primary / alternative / soup).
- Recipes are versioned. Editing a recipe creates a new version; menu items keep pointing at the version they were planned with.
- Every recipe belongs to a canteen (`canteen_id`).

## Ingredients

- Ingredient: name, unit, allergen numbers (1–14), waste coefficient between net weight and weight as purchased.
- A recipe line stores **net weight per portion** (čistá hmotnost) for one reference portion. Scaling by age category comes later in [portions and prices](portions-and-prices.md).
- Recipe allergens are derived from ingredients. The manager confirms them; derived allergens alone are never shown as confirmed.
- Do not decide basket groups here. Leave the mapping of ingredients to groups to the [consumer basket](consumer-basket.md), because it differs between rule versions.

## Estimate vs confirmed

- Every weight, coefficient and allergen has a source: `estimate` or `confirmed` (by the canteen), plus an optional reference to the document it came from.
- A recipe is confirmed only when the manager confirms all its lines and allergens.
- Every number in the UI that depends on an estimate is labeled "odhad". Never show an estimate as an exact number.
- Parents and pupils see allergens only when confirmed. Otherwise they see "neověřeno jídelnou".

## Starter catalog

- Build the starter catalog from the six weeks in [the real menus](../docs/stavajici_jidelnicky.txt): every distinct soup and main course, roughly 30–40 recipes.
- Take typical weights from the methodology documents in `docs/` where they exist and reference the source. Everything else is an `estimate`.
- Do not copy the allergen codes from the source menus as facts. They are inconsistent (for example `123`); import them as unconfirmed and list the conflicts for the manager.

## Kitchen profile

- A canteen has a kitchen profile entered by the manager: equipment (konvektomat, kotel, pánev, …), number of cooks, typical number of portions per day.
- A recipe lists the equipment it needs and its preparation effort (low / medium / high).
- Show a warning when a day needs equipment the kitchen does not have or more than one high-effort main course. Warn, do not block.
- Nothing in the profile is guessed. An empty profile shows "chybí údaje o kuchyni".

## Roles

- **Manager**: creates, edits and confirms recipes, edits the kitchen profile.
- **Staff**: creates and edits recipes, cannot confirm them.
- **Parent and pupil**: see recipe name, ingredient names and confirmed allergens, never weights.

## Migration

- Use a versioned migration. Map every existing meal to a catalog recipe and replace it with a menu item. Do not recreate the database.

## Done when

- Every menu item in the demo weeks points to a recipe version.
- Editing a recipe does not change any menu item planned with the older version.
- A recipe with one estimated line shows "odhad" wherever its numbers appear.
- Unconfirmed allergens are never shown to parents as confirmed.
- `npm run check` and `npm run build` pass.
