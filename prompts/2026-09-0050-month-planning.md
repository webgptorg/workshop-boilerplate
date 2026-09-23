[-]

Plan and rebalance a school menu across the full month

- This builds on the [recipe catalog](0060-recipe-catalog.md), [consumer basket](0020-consumer-basket.md), [portions and prices](0050-portions-and-prices.md), [idea translator](0030-idea-translator.md) and [menu publishing](0040-menu-publishing.md). Their coding standards still apply.
- Start only after the canteen has usable recipe weights, diner categories, expected portions, ingredient prices, a configured kitchen profile and a validated rule set. Inspect existing weekly planning and proposal behavior before implementation.
- The week remains the manager's editing workspace. The month is the unit for consumer-basket and financial-limit evaluation.

## Planning scope

- Let the manager choose a month and build a draft from existing menu items and recipe versions. Never replace a published menu automatically.
- Support two modes: fit a submitted idea into the month, or ask the planner to fill selected unplanned slots around meals the manager has locked.
- Preserve the required daily meal structure and canteen closure days. An alternative meal is a choice, not automatically a diet meal or a default counted serving.
- Let the manager lock a meal or date. Optimization must never alter locked items and must list every proposed change to unlocked items.
- Use the canteen's approved recipe catalog and kitchen profile. Do not invent recipes, weights, equipment, prices, diner counts or capabilities to make a plan pass.

## Deterministic evaluation

- Evaluate the full month against the selected versioned consumer-basket rule set, financial limits, menu variety, recipe repetition and known kitchen constraints.
- Treat missing, estimated and conflicting inputs as explicit results. A plan with missing data cannot be labeled compliant or feasible.
- Apply the correct age categories and expected portions. Show which inputs are forecasts and which are confirmed.
- Respect the rule set's handling of choice menus and closed days. Keep variety reporting separate from regulatory compliance.
- If multiple valid plans exist, rank them using transparent named criteria and show the effect of each criterion. The manager can compare candidate plans and choose; a score never approves or publishes one.

## Idea proposals and adjustments

- When fitting an idea, evaluate its effect on the whole month, not only the week where it might be placed. Propose the best three candidate slots with the basket, cost, variety and kitchen effects.
- If a slot does not fit, try only documented and reviewable variants from approved recipes. List every replacement and a plain Czech sentence explaining why it changed.
- If no candidate fits with known data, return the blocking facts and the closest feasible alternative. If data is missing, explain what needs confirmation rather than claiming the idea is impossible.
- Keep the idea author's explanation within the constraints of the idea translator: plain language and claims derived only from computed results.

## Review and persistence

- Show the manager a month before and after, including changed meals, affected weeks, monthly totals, estimates, missing inputs and reasons for every swap.
- The manager can edit the draft, lock choices, rerun evaluation, approve or discard the proposal. Save the input versions and calculation results used for each proposal.
- Approval and publishing continue to follow the menu publishing workflow. A generated plan cannot bypass manager approval, create a publication revision by itself or notify families before publication.
- Keep a reproducible record of the recipe versions, diner and portion assumptions, prices, financial limits, rule set, kitchen profile and planner version used for a result.

## Done when

- A one week candidate that harms the month is identified, and the manager sees both week and month effects.
- Locked meals remain unchanged across repeated planner runs.
- Missing or estimated inputs are visible and never produce a claim of compliance or exact cost.
- Each proposed swap has a reason and is reproducible from recorded input versions.
- The manager can compare, edit, approve or discard a month plan; no plan is published without the existing approval flow.
- Tests cover repeatability, locked slots, closures, choice menus, missing data and a fixture month with competing valid plans.
- `npm run check` and `npm run build` pass.
