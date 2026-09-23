[ ]

Turn a parent's idea into a meal the canteen can cook, and explain the result back

- This builds on the [recipe catalog](recipe-catalog.md), the [consumer basket](consumer-basket.md) and [portions and prices](portions-and-prices.md). The coding standards of the [first version](initial-version.md) still apply.
- It replaces the keyword matcher `proposeMeal` in `lib/planner.ts`.
- Do a proper analysis of the current idea flow (statuses, the proposal dialog, the manager's approval) and read [the original idea](../docs/00-surovy-napad.txt) again before you start.

## Principles

- This is the manager's tool. The system proposes, the manager decides, nothing leaves the system without her approval.
- Try to fit the idea first. Reject only at the very end, and never without a reason and an alternative.
- Every change to the idea must be explainable to a parent in one sentence.
- When data is missing, say it. A silent pass is worse than a rejection.

## Flow

1. An idea arrives as free text from a parent or pupil, for example "carbonara" or "doma děláme kuřecí nudličky s rýží".
2. **Understand**: turn it into a structured proposal: dish, main components, protein, side, category. Match it to the catalog as an existing recipe, a variant of one, or a new recipe.
3. A new recipe becomes a draft recipe with estimated weights. It cannot be published until the manager confirms it.
4. **Fit**: look for a slot in weeks that are not published yet, where the month basket, the financial limit, variety and the kitchen profile still pass. Show the best three slots with their effect.
5. **Rebalance**: the proposal may swap other meals in that week. Meals the manager locked are never touched. Every swap is listed with a one-sentence reason.
6. **Nearest variant**: if nothing fits, try variants (baked instead of fried, a different side, less sauce). If nothing passes, reject with the reason and the closest alternative.
7. The manager sees the week before and after, edits, approves or discards it with a reason.
8. The author gets the explanation in the app and by email through the mail interface from the user system.

## Where the model is and is not

- The language model is used only to parse the idea into the structured proposal, to suggest variant candidates and to phrase the explanation.
- Deterministic code in `lib` does the matching, weights, basket, cost, fitting, rebalancing and every pass or fail.
- The model never states allergens, nutrition values or compliance. The explanation is phrased from the computed result, and every number and claim in it must come from that result. Validate it before showing it.
- Validate model output against a strict schema. Invalid output is an error the manager sees, not a guess.
- Use the Claude API through `@anthropic-ai/sdk`, declared in `dependencies`. The model id is a named constant.
- Send only the idea text, never names of parents, children or classes.
- Without an API key, the app falls back to the current matcher and says so in the UI.
- Store the model, prompt version, response and rule set with every proposal, so it can be defended later.
- Tests use recorded responses, never the network.

## Explanation for the parent

- Plain Czech a person who never read the decree understands. No official tone.
- At most four sentences: where the idea is (week, day, form), what changed and why, what it caused elsewhere ("proto v pátek není sladké").
- A rejection says why, gives the closest alternative and invites the parent to adjust the idea.
- The manager can edit the text before it is sent.

## Done when

- "carbonara", "kuřecí nudličky s rýží", "sladké každý den", an unknown dish and nonsense text each go through the whole flow with a sensible result.
- One sentence from a parent returns a week proposal with the meal and its ingredients.
- The basket of that week and month is shown per group, estimates labeled "odhad".
- An idea that does not fit gets a reason and an adjusted version that passes.
- Nothing is published or sent without the manager's approval.
- `npm run check` and `npm run build` pass.
