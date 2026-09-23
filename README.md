# Společný stůl

A Czech school cafeteria planning app. Run `npm install` and `npm run dev`, then open http://localhost:3000.

## First version

- Five-day lunch plans with soup, ingredients and estimated costs.
- Parent suggestions mapped by keywords to a small, explicit recipe catalog; unknown suggestions receive an explained alternative.
- Meal replacement, working-draft approval, parent explanations, and text export.
- Ingredient-group totals, portion scaling, and configurable ingredient budget.
- Versioned localStorage data (`spolecny-stul-v1`), with validation and visible storage errors. No database, account, remote AI calls, or automatic publishing.

The initial workspace contains sample parent ideas and an estimated menu. Dates start at 28 September 2026 and can be navigated by week. Recipes, prices and quantities are illustrative estimates, not cafeteria-verified data. The ingredient overview is not a statutory food-basket compliance calculation: monthly data, age-specific norms, conversion factors, verified allergens and dietary handling are not implemented. Approval records the manager's acceptance of a working draft only.

Shared data types, recipes and deterministic matching live in `lib/planner.ts`; the interactive workspace is in `components/meal-planner.tsx`. Brand and UI tokens are in `app/globals.css`.

Validate with `npm run check` and `npm run build`.
