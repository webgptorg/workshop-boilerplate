[x] by Developer on OpenAI Codex `gpt-6-luna` thinking `low` (ChatGPT account) - Implementation ~$0.3315 7 minutes; Testing a few seconds

Calculate the consumer basket (spotřební koš) of "Společný stůl" from recipes and versioned rules

- This builds on the [recipe catalog](recipe-catalog.md). The coding standards of the [first version](initial-version.md) still apply.
- Do a proper analysis before you start: both versions of the decree in `docs/` (2021 and 2025), the methodology PDFs, the MZd opinion on free fats and sugars, and [the analysis](../docs/01-analyza.md).

## Rules are data

- A **rule set** has a name, valid from, valid to and its source document.
- Create two rule sets: the 2021 version and the 2025 version. The transition period ended on 1. 9. 2026.
- A rule set contains basket groups, target values per group and age category, the mapping of ingredients to groups and conversion coefficients.
- Take every value from the decree annex and store the source page with it. Never invent a number. A missing value is shown as "chybí v pravidlech", never treated as zero or as OK.
- Free fats and free sugars have different lower and upper bound meanings. Do not model them as "the less, the better".
- A rule set that was used for an evaluation cannot be edited. A correction is a new rule set.

## Month and week

- The basket is a monthly average, so the **month is the unit of truth**. The week is where the manager works.
- The week view shows, per group: what this week adds, where the month is so far, and what the rest of the month needs.
- A week can look fine while the month does not, and the other way around. Always show both, never hide one.
- Days when the canteen is closed do not count.

## Calculation

- Put the calculation in `lib` as small pure functions with no database access.
- Input: menu items with recipe versions, an age category, a rule set. Output per group: amount, target, status (`ok` / `under` / `over` / `missingData`) and the share that comes from estimates.
- When more than a small share of a group comes from estimates, its status carries "odhad". Put the threshold in a named constant.
- The menu offers a choice of two meals. Analyze how the decree counts choice menus and implement that. If the decree is unclear, compute both readings, show both and say why.
- Variety (pestrost nabídky) is a separate panel, not part of the basket: repeated recipes within the month, number of sweet, meatless, fish and legume meals per week. Label it as variety, not compliance.

## Staff UI

- A basket panel next to the weekly planner: groups, bars against targets, numbers, rule set name.
- A rule set switcher for comparison. The default is the rule set valid on the menu date.
- Clicking a group lists the menu items that contribute to it.
- Parents do not see this panel yet (see [menu publishing](menu-publishing.md)).

## Done when

- Changing a meal immediately updates the week and month numbers.
- September 2026 evaluated with the 2021 and 2025 rule sets gives different results, and each result names its rule set.
- A group without a rule value or with missing recipe weights shows missing data, never `ok`.
- Unit tests cover the calculation with fixtures built from the example menus in the methodology documents.
- `npm run check` and `npm run build` pass.

