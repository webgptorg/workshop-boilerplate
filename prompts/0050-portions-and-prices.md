[ ]

Add diner categories, expected portions, ingredient prices and the financial limit to "Společný stůl"

- This builds on the [user system](user-system.md), the [recipe catalog](recipe-catalog.md) and the [consumer basket](consumer-basket.md). The coding standards of the [first version](initial-version.md) still apply.
- Do a proper analysis of how diners, selections and the iCanteen import work before you start.

## Diner categories

- Every diner has an age category as defined in the rule set: the pupil categories from the decree and adults (employees and other adults who eat in the canteen).
- Take the categories and portion coefficients from the rule set, do not hardcode them.
- Derive the category from the import when it contains a birth date. Otherwise the manager assigns a category per class. The manager can override it for one diner.

## Expected portions

- Per day and meal: expected portions = diners who selected it + diners without a selection who are counted towards the default meal.
- The manager sets the default (for example "bez výběru = hlavní jídlo").
- Portions are counted per age category, because the weights differ.
- Label the numbers as a forecast (předpoklad) until the day is closed.

## Prices

- Ingredient price per unit with a valid-from date and a source (manager input, invoice). Keep the history.
- An ingredient without a price shows "chybí cena". Never count it as zero.
- Price changes do not rewrite costs of past days.

## Financial limit

- The financial limit per portion and age category is set by the manager with a valid-from date.
- Show cost per portion of each recipe for each age category, the daily cost and the monthly average against the limit.
- Like the basket, the limit is judged by the month. The week shows how it affects the month.
- A cost with an estimated weight or a missing price is labeled "odhad" or "neúplné".

## Purchase list

- Weekly purchase list: ingredients as purchased (net weight divided by the waste coefficient) × expected portions, summed by ingredient, with price.
- Print view and CSV export.
- It is labeled as a basis for an order (podklad pro objednávku). It is not an order and nothing is sent to suppliers.

## Roles

- **Manager**: edits prices, limits, categories and the default meal.
- **Staff**: reads costs and prints the purchase list.
- **Parent and pupil**: see nothing about prices or quantities.

## Done when

- A unit test with a fixture week checks the purchase list and costs against hand-calculated numbers.
- Adults are counted in portions and quantities.
- A missing price or weight is visible in every total that depends on it.
- A parent or pupil cannot load prices or the purchase list, also not through the API.
- `npm run check` and `npm run build` pass.
