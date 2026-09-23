# Run trace of `prompts/0030-idea-translator.md#1`

-   **Prompt:** Turn a parent's idea into a meal the canteen can cook, and explain the result back
-   **Outcome:** Succeeded
-   **Runner:** Developer on OpenAI Codex `gpt-6-luna` thinking `low` (ChatGPT account)
-   **Attempts:** 1
-   **Steps:** Implementation ~$0.1851 4 minutes; Testing a few seconds
-   **Verification command:** `npm run check`
-   **Started:** 2026-09-23T13:26:13.648Z
-   **Finished:** 2026-09-23T13:30:07.510Z
-   **Duration:** 4 minutes

## Runtime log

````text
=== runner shell started at 2026-09-23T13:26:13.685Z ===
Script path: /Users/hejny/work/workshops/workshop-boilerplate/.promptbook/coder-prompts/0030-idea-translator.sh

--- raw input ---
if [ -n "${PTBK_AGENTS_SERVER_ENV_FILE:-}" ] && [ -f "${PTBK_AGENTS_SERVER_ENV_FILE}" ]; then
set -a
source "${PTBK_AGENTS_SERVER_ENV_FILE}"
set +a
elif [ -f .env ]; then
set -a
source .env
set +a
fi

CODEX_LOGIN_STATUS="$(
    unset OPENAI_API_KEY OPENAI_BASE_URL CODEX_API_KEY
    # 'codex login status' prints the "Logged in using ChatGPT" line to stderr, so merge stderr into stdout (2>&1) to capture it
    codex login status 2>&1 || true
)"
case "$CODEX_LOGIN_STATUS" in
    *"Logged in using ChatGPT"*)
        IS_CODEX_CHATGPT_LOGIN_ACTIVE=1
        ;;
    *)
        IS_CODEX_CHATGPT_LOGIN_ACTIVE=0
        ;;
esac

CODEX_LOGIN_METHOD=chatgpt
CODEX_LOGIN_METHOD_ARGUMENTS=(-c forced_login_method=chatgpt)
unset CODEX_API_KEY
if [ "$IS_CODEX_CHATGPT_LOGIN_ACTIVE" != "1" ] &&
    [ "${PTBK_OPENAI_CODEX_USE_API_KEY:-0}" = "1" ] &&
    [ -n "${OPENAI_API_KEY:-}" ]; then
    CODEX_LOGIN_METHOD_ARGUMENTS=(-c forced_login_method=api)
    CODEX_LOGIN_METHOD=api
    CODEX_API_KEY="${OPENAI_API_KEY}"
    export CODEX_API_KEY
fi

if [ "$IS_CODEX_CHATGPT_LOGIN_ACTIVE" = "1" ] ||
    [ "${PTBK_OPENAI_CODEX_USE_API_KEY:-0}" != "1" ] ||
    [ -z "${OPENAI_API_KEY:-}" ]; then
unset OPENAI_API_KEY
unset OPENAI_BASE_URL
fi

printf '%s %s\n' 'ptbk-codex-login-method:' "${CODEX_LOGIN_METHOD}"

codex \
    "${CODEX_LOGIN_METHOD_ARGUMENTS[@]}" \
    -c model_reasoning_effort="low" \
    --ask-for-approval never \
    exec --model gpt-6-luna \
    --local-provider none \
    --sandbox danger-full-access \
    -C /Users/hejny/work/workshops/workshop-boilerplate \
    --skip-git-repo-check \
    <<'CODEX_PROMPT'

## Your Task

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

## Your Behavior

You are Developer
You are a helpful, honest, and intelligent AI assistant. Your goal is to provide accurate, clear, and concise responses while being friendly and engaging. Think step-by-step before answering complex questions.

### Rules

-   If you're unsure about something, say so and offer to look it up or clarify.
-   You can use Markdown formatting in the messages like **bold** or *italic*
-   You can use Markdown code blocks if needed

For example:

```javascript
console.log('Hello');
```
-   Do not write taglines or texts which are meaningless

**For example do not do this:**

```
S CHUTÍ DO NOVÉHO TÝDNE
Týdenní jídelníček.
Pestrý týden pro děti. Méně starostí pro vás.
```

```
MOJE STRAVOVÁNÍ
Týdenní jídelníček
Prohlédni si nabídku a vyber si, na co máš chuť.
```

**But do this:**

```
Týdenní jídelníček.
```

Do not write texts like "Návrh máte ve svých rukou" in badges
-   Nepřidávej automaticky supporting copy, subheadline, lead text ani vysvětlující věty pod nadpisy sekcí. Pokud text nepřináší novou informaci, vůbec ho nevytvářej. Nadpis a samotné UI musí být dostatečně srozumitelné bez generického vysvětlování. Zakázané jsou výplňové formulace typu „Každý X má své místo…“, „Vše přehledně na jednom místě“, „Jednoduše a efektivně…“

Pokud najdeš, smaž je
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   When throwing errors, throw [branded errors](src/errors) and use `spaceTrim` utility to write clear and well-formatted multiline detailed error messages.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.
-   The files should be max 300 lines long.

### Goal

Implement best practices and coding standards for the development process.

Output Format: errors as markdown, for example `variables` should be in backticks and important notes can be in bold.

### Prompt suffix
-   If you're unsure about something, say so and offer to look it up or clarify.
-   You can use Markdown formatting in the messages like **bold** or *italic*
-   You can use Markdown code blocks if needed

For example:

```javascript
console.log('Hello');
```
Implement best practices and coding standards for the development process.
-   Do not write taglines or texts which are meaningless


**For example do not do this:**

```
S CHUTÍ DO NOVÉHO TÝDNE
Týdenní jídelníček.
Pestrý týden pro děti. Méně starostí pro vás.
```

**For example do not do this:**

```
MOJE STRAVOVÁNÍ
Týdenní jídelníček
Prohlédni si nabídku a vyber si, na co máš chuť.
```

**But do this:**

```
Týdenní jídelníček.
```


Do not write texts like "Návrh máte ve svých rukou" in badges
-   Nepřidávej automaticky supporting copy, subheadline, lead text ani vysvětlující věty pod nadpisy sekcí. Pokud text nepřináší novou informaci, vůbec ho nevytvářej. Nadpis a samotné UI musí být dostatečně srozumitelné bez generického vysvětlování. Zakázané jsou výplňové formulace typu „Každý X má své místo…“, „Vše přehledně na jednom místě“, „Jednoduše a efektivně…“

Pokud najdeš, smaž je
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   When throwing errors, throw [branded errors](src/errors) and use `spaceTrim` utility to write clear and well-formatted multiline detailed error messages.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.
-   The files should be max 300 lines long.

## Context

## Agent guidelines

This repository is a small Promptbook-branded Next.js starter. Keep it understandable enough that a new project can safely fork or copy it.

### Working rules

- Keep TypeScript strict and fix type errors instead of suppressing them.
- Prefer React Server Components. Add `"use client"` only where browser state or APIs are needed.
- Reuse `components/ui` and the CSS design tokens before adding another UI dependency.
- Keep Promptbook brand values in `app/globals.css`; do not invent or modify official logo assets.
- Put shared utilities in `lib` and reusable React code in `components`.
- Never commit secrets or real credentials.
- Keep line endings LF.
- Keep changes small and the Git history linear where practical.

### Before finishing

Run:

```bash
npm run check
npm run build
```

If you introduce a direct import from another Promptbook package, declare that package explicitly in `dependencies` instead of relying on a transitive dependency.

CODEX_PROMPT

--- raw output ---
ptbk-codex-login-method: chatgpt
Reading prompt from stdin...
OpenAI Codex v0.156.1
--------
workdir: /Users/hejny/work/workshops/workshop-boilerplate
model: gpt-6-luna
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: low
reasoning summaries: none
session id: 01a0ce72-048b-7463-812a-78d652c04ab9
--------
user

## Your Task

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

## Your Behavior

You are Developer
You are a helpful, honest, and intelligent AI assistant. Your goal is to provide accurate, clear, and concise responses while being friendly and engaging. Think step-by-step before answering complex questions.

### Rules

-   If you're unsure about something, say so and offer to look it up or clarify.
-   You can use Markdown formatting in the messages like **bold** or *italic*
-   You can use Markdown code blocks if needed

For example:

```javascript
console.log('Hello');
```
-   Do not write taglines or texts which are meaningless

**For example do not do this:**

```
S CHUTÍ DO NOVÉHO TÝDNE
Týdenní jídelníček.
Pestrý týden pro děti. Méně starostí pro vás.
```

```
MOJE STRAVOVÁNÍ
Týdenní jídelníček
Prohlédni si nabídku a vyber si, na co máš chuť.
```

**But do this:**

```
Týdenní jídelníček.
```

Do not write texts like "Návrh máte ve svých rukou" in badges
-   Nepřidávej automaticky supporting copy, subheadline, lead text ani vysvětlující věty pod nadpisy sekcí. Pokud text nepřináší novou informaci, vůbec ho nevytvářej. Nadpis a samotné UI musí být dostatečně srozumitelné bez generického vysvětlování. Zakázané jsou výplňové formulace typu „Každý X má své místo…“, „Vše přehledně na jednom místě“, „Jednoduše a efektivně…“

Pokud najdeš, smaž je
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   When throwing errors, throw [branded errors](src/errors) and use `spaceTrim` utility to write clear and well-formatted multiline detailed error messages.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.
-   The files should be max 300 lines long.

### Goal

Implement best practices and coding standards for the development process.

Output Format: errors as markdown, for example `variables` should be in backticks and important notes can be in bold.

### Prompt suffix
-   If you're unsure about something, say so and offer to look it up or clarify.
-   You can use Markdown formatting in the messages like **bold** or *italic*
-   You can use Markdown code blocks if needed

For example:

```javascript
console.log('Hello');
```
Implement best practices and coding standards for the development process.
-   Do not write taglines or texts which are meaningless


**For example do not do this:**

```
S CHUTÍ DO NOVÉHO TÝDNE
Týdenní jídelníček.
Pestrý týden pro děti. Méně starostí pro vás.
```

**For example do not do this:**

```
MOJE STRAVOVÁNÍ
Týdenní jídelníček
Prohlédni si nabídku a vyber si, na co máš chuť.
```

**But do this:**

```
Týdenní jídelníček.
```


Do not write texts like "Návrh máte ve svých rukou" in badges
-   Nepřidávej automaticky supporting copy, subheadline, lead text ani vysvětlující věty pod nadpisy sekcí. Pokud text nepřináší novou informaci, vůbec ho nevytvářej. Nadpis a samotné UI musí být dostatečně srozumitelné bez generického vysvětlování. Zakázané jsou výplňové formulace typu „Každý X má své místo…“, „Vše přehledně na jednom místě“, „Jednoduše a efektivně…“

Pokud najdeš, smaž je
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   When throwing errors, throw [branded errors](src/errors) and use `spaceTrim` utility to write clear and well-formatted multiline detailed error messages.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.
-   The files should be max 300 lines long.

## Context

## Agent guidelines

This repository is a small Promptbook-branded Next.js starter. Keep it understandable enough that a new project can safely fork or copy it.

### Working rules

- Keep TypeScript strict and fix type errors instead of suppressing them.
- Prefer React Server Components. Add `"use client"` only where browser state or APIs are needed.
- Reuse `components/ui` and the CSS design tokens before adding another UI dependency.
- Keep Promptbook brand values in `app/globals.css`; do not invent or modify official logo assets.
- Put shared utilities in `lib` and reusable React code in `components`.
- Never commit secrets or real credentials.
- Keep line endings LF.
- Keep changes small and the Git history linear where practical.

### Before finishing

Run:

```bash
npm run check
npm run build
```

If you introduce a direct import from another Promptbook package, declare that package explicitly in `dependencies` instead of relying on a transitive dependency.


codex
I’ll trace the idea lifecycle, planner, catalog and budget rules, and the original note first. Then I’ll build the proposal flow around those existing boundaries and verify it with the repository’s required check and build commands.
exec
/bin/zsh -lc "pwd && rg --files -g 'AGENTS.md' -g '*.md' -g '*.ts' -g '*.tsx' -g '*.json' -g '*.txt' | head -200" in /Users/hejny/work/workshops/workshop-boilerplate
 succeeded in 0ms:
/Users/hejny/work/workshops/workshop-boilerplate
src/errors/app-error.ts
AGENTS.md
playwright.config.ts
tsconfig.json
prompts/0040-menu-publishing.md
prompts/0020-consumer-basket.md
prompts/0010-user-system.md
prompts/templates/common.md
prompts/0060-recipe-catalog.md
prompts/0030-idea-translator.md
prompts/0080-fix-dev.md
prompts/0000-initial-version.md
prompts/traces/0020-consumer-basket.md
prompts/traces/0080-fix-dev.md
prompts/traces/0070-nonce.md
prompts/0070-nonce.md
prompts/0050-portions-and-prices.md
lib/basket-rules.ts
lib/planner.ts
lib/accounts.ts
lib/mutations.ts
lib/database.ts
lib/security.ts
lib/types.ts
lib/seed.ts
lib/email.ts
lib/cn.ts
lib/consumer-basket.ts
lib/space-trim.ts
scripts/admin.ts
package.json
package-lock.json
components/forms.tsx
components/brand.tsx
components/weekly-menu.tsx
components/sidebar.tsx
components/dialog.tsx
components/auth-token-form.tsx
components/planner.tsx
components/community.tsx
components/meal-icon.tsx
components/consumer-basket-panel.tsx
components/meal-card.tsx
components/account.tsx
components/dashboard.tsx
components/ui/button.tsx
components/ui/index.ts
components/ui/badge.tsx
components/ui/card.tsx
README.md
next-env.d.ts
docs/01-analyza.md
docs/00-surovy-napad.txt
docs/stavajici_jidelnicky.txt
docs/branding/README.md
tests/consumer-basket.test.ts
tests/browser/flows.spec.ts
tests/onboarding.test.ts
tests/domain.test.ts
app/page.tsx
app/api/action/route.ts
app/layout.tsx
app/invite/page.tsx
app/reset/page.tsx
AGENT_REPORT.md

exec
/bin/zsh -lc 'cat AGENTS.md && cat docs/00-surovy-napad.txt && cat prompts/0000-initial-version.md && cat prompts/0030-idea-translator.md && cat prompts/0060-recipe-catalog.md && cat prompts/0020-consumer-basket.md && cat prompts/0050-portions-and-prices.md' in /Users/hejny/work/workshops/workshop-boilerplate
 succeeded in 0ms:
# Agent guidelines

This repository is a small Promptbook-branded Next.js starter. Keep it understandable enough that a new project can safely fork or copy it.

## Working rules

- Keep TypeScript strict and fix type errors instead of suppressing them.
- Prefer React Server Components. Add `"use client"` only where browser state or APIs are needed.
- Reuse `components/ui` and the CSS design tokens before adding another UI dependency.
- Keep Promptbook brand values in `app/globals.css`; do not invent or modify official logo assets.
- Put shared utilities in `lib` and reusable React code in `components`.
- Never commit secrets or real credentials.
- Keep line endings LF.
- Keep changes small and the Git history linear where practical.

## Before finishing

Run:

```bash
npm run check
npm run build
```

If you introduce a direct import from another Promptbook package, declare that package explicitly in `dependencies` instead of relying on a transitive dependency.
SUROVY ZAPIS, FAZE 0
23. 9. 2026, psano pred workshopem. Necesane schvalne. Rozpory uvnitr jsou zamer, ne chyba.
Skolu, jidelnu ani lidi tady nejmenuju, tenhle soubor jde do repa.

---

CO ME NA TOM STVE

Rodice v tride chteji do skolni jidelny mluvit a jidelna rekla, ze namety bere mailem a zapracuje
je od ledna nebo unora. Jenze rodic prijde s napadem jidla, ktere chutna jemu a jeho detem. Neprijde
s jidelnickem. Netusi nic o spotrebnim kosi, o financnim limitu na porci, o tom, ze se to vari pro
stovky deti v jednom hrnci a ze v utery uz jedno masite jidlo bylo.

Jidelna to musi bud odmitnout, nebo si s tim poradit sama. Odmitnuti bez vysvetleni rodice nastve.
Zapracovani rucne stoji cas, ktery vedouci nema. Takze se nestane nic a obe strany si o sobe mysli
svoje.

Chybi tam prekladatel. Neco, co vezme "moje deti miluji spagety" a udela z toho radek v jidelnicku,
ktery jde uvarit a ktery splnuje pravidla. A pak rodici vysvetli, co s jeho napadem udelalo a proc.

CO CHCI

System, ktery planuje jidelnicek a bere napady rodicu jako vstup, ne jako rusivy element.

Rodic hodi napad, klidne jednou vetou. System z toho udela navrh jidla se surovinami, zasadi ho do
tydne nebo mesice tak, aby vyslo vsechno ostatni, dopocita zbytek jidelnicku kolem nej a rekne,
co musel zmenit.

Vystupy jsou dva a mluvi jinym jazykem.
Pro jidelnu: jidelnicek, ktery jde uvarit, se surovinami a s kontrolou kose a limitu. Podklad
k odsouhlaseni, ne hotova vec.
Pro rodice: vysvetleni. Tvuj napad je uvnitr, tenhle tyden, v teto podobe. Puvodne to neslo kvuli
tomuhle, upravil jsem to takhle, a proto v patek neni sladke.

To druhe je mozna dulezitejsi nez to prvni. Rodic, ktery vidi svuj napad v jidelnicku a chape, proc
vypada jinak, posle dalsi napad. Rodic, ktery dostane "nelze", uz nenapise nikdy.

CIL

Ne demo a ne kontrolni nastroj. Pouzitelny nastroj na rutinni planovani jidelnicku, kde jidelna
planuje a rodice do toho prispivaji. Kdyz to vedouci po trech mesicich prestane pouzivat, protoze
je rychlejsi to napsat rucne, neuspel jsem.

KDO TO POUZIVA

Vedouci jidelny planuje a schvaluje. Je to jeji nastroj, ne nastroj rodicu na ni.
Rodic prispiva namety a dostava zpetnou vazbu.
Ja jsem zatim ten, kdo namety sbira. [DOPLN: kdo namety realne sbira a posila, kolik lidi to je]

Poradi je dulezite a musi byt videt i v UI. Neni to system, kterym rodice zadavaji jidelne praci.
Je to system, ktery vedouci usetri praci a rodicum da odpoved.

JAK TO MA PROBIHAT, HRUBE

1. Prijde namet. Volny text, klidne "carbonara" nebo "delame doma kureci nudlicky s ryzi".
2. System z toho udela strukturovany navrh: co to je, jake suroviny, kolik cca na porci, jaka
   prilohy, co to dela s tukem, masem, zeleninou.
3. Zkusi to zasadit do planovaneho obdobi. Hleda misto, kde to vyjde.
4. Dopocita zbytek tydne nebo mesice kolem toho tak, aby vysel kos, limit, pestrost a opakovani.
5. Kdyz to nejde ani po uprave, rekne proc, a nabidne nejblizsi variantu, ktera projde.
6. Vedouci to vidi, upravi, schvali nebo zahodi.
7. Rodic dostane vysvetleni, at uz jeho napad prosel nebo ne.

Krok 5 je to, co tenhle system odlisuje od generatoru jidelnicku, kterych je plny internet. Nejdriv
se snaz napad zapracovat. Zamitnuti az uplne nakonec, a nikdy bez duvodu a bez alternativy.

ODKUD JSOU PRAVIDLA

Vyhlaska o skolnim stravovani, spotrebni kos, financni limity na nakup potravin, k tomu metodiky
a vyklady, ktere rikaji veci, co v predpisu nejsou.

Kos se letos zasadne zmenil, nova verze plati od zari 2025 a prechodne obdobi skoncilo 1. 9. 2026.
Pravidla tedy maji verze a system to musi unest, jinak je po prvni novele k nicemu. Zrovna jedna
prisla.

Mimo vyhlasku jsou provozni pravidla konkretni kuchyne, ktera nikde nejsou napsana. Co umi uvarit
pro tolik porci, co ma za vybaveni, kolik lidi tam stoji u sporaku, co se da koupit. Tohle bude
nejtezsi cast a vyhlaska je proti tomu snadna, protoze je aspon sepsana.

CO MUSI PLATIT VZDYCKY

Vedouci ma posledni slovo. System navrhuje, nerozhoduje a nic neposila ven sam.
Kdyz nema data, rekne to nahlas. Tichy pruchod je horsi nez zamitnuti.
Nikdy neodmitne napad bez duvodu a bez alternativy.
Kazda uprava napadu musi byt vysvetlitelna jednou vetou, ktere rozumi rodic.
Alergeny a bezpecnost nejsou vec modelu. Bud to je v datech, nebo se to netvrdí vubec.
Kazdy vygenerovany jidelnicek musi jit zpetne obhajit, vcetne verze pravidel, podle ktere vznikl.

CO JE HOTOVO, PRVNI NASTREL

Dam mu jednu vetu od rodice a on vrati navrh tydne, kde to jidlo je, se surovinami.
Spocita kos a rekne, jak na tom ten tyden je, s cisly po skupinach.
Kdyz napad nejde zasadit, rekne proc a nabidne upravu, ktera projde.
Vysvetleni pro rodice je pochopitelne pro cloveka, ktery vyhlasku nikdy nevidel.
Kdyz chybi gramaze, rekne "odhad" a neprodava to jako presne cislo.

Pet vet. Kdyz tohle plati, je hotovo, zbytek je navic.

DIVOKE NAPADY, NEFILTROVANE

Planovat rovnou mesic, protoze kos se stejne sleduje jako mesicni prumer, a tyden je jen pohled.
Ucit se z historickych jidelnicku te konkretni jidelny, co skutecne vari, a nenavrhovat nic, co by
v kuchyni vyvolalo paniku. Navrh, ktery kuchyne neumi, je k nicemu, i kdyby splnoval vsechno.
Kvota na napady. Kdyz prijde dvacet nametu od dvaceti rodicu, kdo rozhodne, ktery se pouzije?
Poradnik, hlasovani, rotace po tridach? Tohle neni technicky problem, ale je to problem.
Banka overenych receptur jidelny jako zaklad, napady rodicu jako varianty nad ni.
Ukazat rodicum kos vizualne, at vidi, proc nejde sladke jidlo dvakrat tydne.
Rezim "vysvetli mi tenhle jidelnicek", kdyz uz je zverejneny a nekdo se pta, proc tam neco je.
Hlasovani deti o tom, ktery z proslych napadu se uvari.

CEHO SE BOJIM

Ze to vedouci vezme tak, ze ji rodice budou planovat praci. Fatalni. Cely nastroj musi byt psany
z jeji strany, jinak nema smysl to ani zacinat.
Ze system vygeneruje krasny jidelnicek, ktery kuchyne fyzicky neuvari. Pravidla z vyhlasky umim
dohledat, provozni omezeni te kuchyne nikoliv.
Ze bez receptur a gramazi to nejde vubec. U pouheho kontrolora bych se vymluvil na odhady, ale kdyz
mam generovat, musim vedet, z ceho se to vari. Bud katalog od jidelny, nebo si postavim vlastni
startovni katalog par desitek jidel s odhadovymi gramazemi a poctive to oznacim jako odhad.
Ze vysvetleni pro rodice bude znit jako urednik. Pak to nikdo cist nebude.
Ze si do toho protlacím architekturu, kterou mam v hlave z prace, misto te, kterou tenhle problem
potrebuje. Na tohle se musim nechat chytit pri oponenture.
Ze to bude hezke demo bez uzivatele, jako uz par veci.

OTEVRENE OTAZKY, NEODPOVIDAT PREDEM

1. Kos je mesicni prumer, ale planuje a navrhuje se po tydnech. Planuje system tyden, nebo mesic?
   Co kdyz tyden projde a mesic ne, nebo naopak? Jadro celeho problemu a kazda odpoved dela jiny
   produkt.
2. Generuje cely jidelnicek, nebo jen doplnuje kolem toho, co vedouci uz ma? To druhe je mensi,
   pokornejsi a mozna pouzitelnejsi.
3. Kdo rozhoduje, ktery napad se pouzije, kdyz jich prijde dvacet.
4. Co se stane s napadem, ktery je principialne neproveditelny pro ctyri sta porci. Rict rovnou ne,
   nebo hledat nejblizsi proveditelnou verzi a riskovat, ze rodic svoje jidlo nepozna?
5. Kde presne je hranice mezi tim, co navrhuje model, a tim, co pocita a rozhoduje deterministicky
   vypocet. Tusim odpoved a prave proto si ji nemam dopredu napsat.
6. Ma to vubec generovat, nebo staci, aby to hodnotilo a vysvetlovalo? Generator je efektnejsi.
   Hodnotic je levnejsi a mozna uzitecnejsi.
7. Dieta a alergie. Provozni nastroj to nemuze ignorovat navzdy, ale kdyz to vezmu ted, nestihnu nic.

CO VEDOME NERESIM DNES

Mesicni optimalizace. Databaze. UI. Import z jidelnickoveho systemu. Plna alergenova matice. Dietni
stravovani. Vic vekovych kategorii. Nakup a sklad. Svatky, vylety a dny bez vyuky.
Dneska staci: jeden namet od rodice, doplneni zbytku tydne z malaho katalogu, vypocet kose,
vysvetleni.

DATA, KTERA MAM A NEMAM

Mam: text vyhlasky vcetne priloh, starsi zneni pro porovnani, metodiky s prikladovymi jidelnicky,
stazene realne jidelnicky za nekolik tydnu.
Nemam: receptury a gramaze na porci, vybaveni a kapacitu kuchyne, pocty stravniku, ceny surovin.
Mam 6 tydnu stavajícich jidelnicku, polevka a 2 jidla na den.
Jidelna dnes pouziva iCanteen pro publikaci jidelnicku.
Zajimaji mne vsechny vekove kategorie, vc dospelych, kteri do te jidelny chodi take - jde o mnozstvi surovin, ktere je treba koupit.
Je treba delat vlastni receptury, jidelna dnes vari velmi tradicne a receptury nepublikuje.

CIM MERIM, ZE TO K NECEMU JE

Kratkodobe: jeden namet od rodice projde celou cestou az k jidelnicku a vysvetleni, ktere se da
poslat, aniz bych se za nej stydel.
Stredne: vedouci rekne, ze ji to usetrilo praci, ne ze ji pribyla.
Dlouhodobe: rodice posilaji namety opakovane, protoze vidi, ze se s nimi neco deje.
Kontrolni otazka na prosinec: pouzil jsem to od workshopu aspon dvakrat? Kdyz ne, byla to hracka.
[x]

Implement the first version of the app "Společný stůl"


- Take the [business idea](docs/00-surovy-napad.txt)
    - Analyze the business and all other subdocuments linked in `docs/`
- You are starting from the boilerplate project. Just discard the things which are in the project and implement the first version of the app. 

## Branding

This is how logo, fonts and colors should look like:
![Logo, fonts and colors](image.png)

- Create a branding manual including logo, fonts, and color scheme, examples,... at `docs/branding`


## Meals

- Each meal should have its own icon. 
- Get inspiration from real [meals](docs/stavajici_jidelnicky.txt)
- For each day, there should be 2 meals:
    - Primary
    - Alternative if the primary meal is not suitable


## User personas

The app should be designed for all varieties of users: pupils, school restaurant staff, and parents so the design patterns should be universal. 

## Users

- Prepare three mocked users:
    1) the pupil
    2) the restaurant staff
    3) the parent

For each of these, there should be a fake username/password. 

## User roles

The app should work in three distinct roles. Each role should have its custom color tint and functions. 

### Pupil

The pupil role should have access to view the weekly meal plan, select preferred meals, and provide feedback on meals.

### Restaurant staff

The restaurant staff role should have access to manage the weekly meal plan, update meal information, and view feedback from pupils.

### Parent

The parent role should have access to view their child's weekly meal plan, provide feedback, and manage meal preferences.

## Data

- Use the SQLite database.
[^] by Developer on OpenAI Codex `gpt-6-luna` thinking `low` - Implementation in progress

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

exec
/bin/zsh -lc "sed -n '1,260p' lib/planner.ts && sed -n '1,280p' lib/types.ts && sed -n '1,300p' lib/mutations.ts && sed -n '1,300p' components/planner.tsx && sed -n '1,260p' components/community.tsx && cat package.json" in /Users/hejny/work/workshops/workshop-boilerplate
 succeeded in 0ms:
import type { Meal } from "./types";
export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
export function proposeMeal(text: string, meals: Meal[]): Proposal {
  const NORMALIZED = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const PATTERNS: [RegExp, string][] = [
    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
    [/ryb|losos|file/, "fish"],
    [/kure|kari/, "chicken"],
    [/cock|lustenin/, "lentils"],
    [/rizot|ryz/, "rice"],
    [/kapust|placick/, "greens"],
    [/kuskus|tunak/, "salad"],
    [/sladk|mak|dukat/, "sweet"],
    [/rajsk|kulick/, "meatballs"],
    [/zampion|houb/, "mushroom"],
  ];
  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
  const MEAL =
    meals.find((meal) => meal.icon === MATCH?.[1]) ||
    meals.find((meal) => meal.icon === "pasta") ||
    meals[0];
  return {
    meal: MEAL,
    isMatch: Boolean(MATCH),
    reason: MATCH
      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
  };
}
export type Role = "pupil" | "adult" | "staff" | "parent" | "manager";
export type User = { id: number; name: string; role: Role; username: string; email?: string | null };
export type Meal = {
  id: number;
  date: string;
  slot: number;
  name: string;
  side: string;
  soup: string;
  icon: string;
  category: string;
  allergens: string;
  ingredients: string;
  recipeVersionId?: string | null;
};
export type RecipeIngredient = {
  ingredientId: string;
  amountGrams: number | null;
  isEstimate: boolean;
};
export type RecipeVersion = {
  id: string;
  mealId: number;
  validFrom: string;
  ingredients: RecipeIngredient[];
};
export type BasketGroupId = "meat" | "fish" | "dairy" | "freeFat" | "freeSugar" | "produce" | "potato" | "wholeGrain" | "legume" | "egg";
export type BasketTarget = {
  amountGramsPerDinerDay: number | null;
  minimumPercent: number | null;
  maximumPercent: number | null;
  sourcePage: number | null;
};
export type BasketRuleSet = {
  id: string;
  name: string;
  validFrom: string;
  validTo: string | null;
  sourceDocument: string;
  measureBasis: "purchased" | "clean";
  ageCategoryTargets: Partial<Record<string, Partial<Record<BasketGroupId, BasketTarget>>>>;
  groupLabels: Record<BasketGroupId, string>;
  ingredientMappings: Record<string, { groupId: BasketGroupId; coefficient: number | null; sourcePage: number | null }>;
};
export type BasketMenuItem = {
  meal: Meal;
  recipeVersion: RecipeVersion | null;
  servings: number;
  isOperatingDay: boolean;
};
export type BasketGroupResult = {
  groupId: BasketGroupId;
  label: string;
  amountGrams: number;
  targetGrams: number | null;
  minimumGrams: number | null;
  maximumGrams: number | null;
  status: "ok" | "under" | "over" | "missingData";
  isEstimate: boolean;
  estimateShare: number;
  contributingMeals: { mealId: number; name: string; amountGrams: number; isEstimate: boolean }[];
};
export type BasketPeriodResult = {
  ruleSetId: string;
  ruleSetName: string;
  period: "week" | "month";
  groups: BasketGroupResult[];
};
export type Feedback = {
  id: number;
  name: string;
  meal: string;
  rating: number;
  comment: string;
};
export type Idea = {
  id: number;
  text: string;
  status: string;
  response: string;
  name: string;
};
export type AppData = {
  isDemoMode: boolean;
  user: User | null;
  roles: Role[];
  activeDinerId: number | null;
  canteens: { id: number; name: string; roles: Role[] }[];
  activeCanteenId: number | null;
  auditLog: { id: number; action: string; reason: string | null; createdAt: number }[];
  managedDiners: { id: number; name: string; className: string | null; dinerNumber: string; type: "pupil" | "adult"; archivedAt: number | null; parentLinks: string }[];
  managedPeople: { id: number; name: string; email: string | null; roles: Role[] }[];
  oneTimeCode?: string;
  diners: { id: number; name: string; className: string | null; type: "pupil" | "adult"; pupilUsername?: string | null }[];
  meals: Meal[];
  recipeVersions: RecipeVersion[];
  selections: Record<string, number>;
  feedback: Feedback[];
  ideas: Idea[];
  preferences: string;
  preferencesList: { dinerName: string; text: string }[];
  weeks: string[];
  operatingDates: string[];
};
export const ROLE_LABELS: Record<Role, string> = {
  pupil: "Žák",
  adult: "Dospělý strávník",
  staff: "Jídelna",
  parent: "Rodič",
  manager: "Vedoucí jídelny",
};
import { DATABASE, type SessionUser } from "./database";
import { AppError } from "../src/errors/app-error";
function requiredText(value: unknown, label: string, maximum = 1000): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
  return value.trim();
}
function identifier(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) throw new AppError("Neplatný identifikátor záznamu.");
  return value;
}
function assertOwnedDiner(user: SessionUser, dinerId: number): void {
  if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
}
export function mutate(user: SessionUser, body: Record<string, unknown>) {
  const ACTION = String(body.action || "");
  const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
  const IS_MANAGER = user.roles.includes("manager");
  if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
  if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
  if (ACTION === "applyProposal") {
    const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
    const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
    const IDEA_ID = identifier(body.ideaId);
    const RESPONSE = requiredText(body.response,"Odpověď");
    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
    DATABASE.exec("BEGIN IMMEDIATE");
    try {
      DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
      DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
      DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
      DATABASE.exec("COMMIT");
    } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
    return;
  }
  if (["select","feedback","edit"].includes(ACTION)) {
    const MEAL_ID=identifier(body.mealId);
    const MEAL=DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(MEAL_ID,user.canteenId) as {date:string}|undefined;
    if (!MEAL) throw new AppError("Jídlo již není v jídelníčku.",404);
    if (ACTION === "select") {
      const DINER_ID=user.dinerId;
      if (!DINER_ID || !["parent","pupil","adult"].includes(user.role)) throw new AppError("Vyberte strávníka.",403);
      assertOwnedDiner(user,DINER_ID);
      DATABASE.prepare("INSERT INTO selections_v2(diner_id,canteen_id,date,meal_id) VALUES(?,?,?,?) ON CONFLICT(diner_id,date) DO UPDATE SET meal_id=excluded.meal_id").run(DINER_ID,user.canteenId,MEAL.date,MEAL_ID);
    } else if (ACTION === "feedback") {
      if (!user.roles.some((role)=>role === "pupil" || role === "parent" || role === "adult")) throw new AppError("Hodnocení není pro tuto roli dostupné.",403);
      const RATING=identifier(body.rating); if (RATING>5) throw new AppError("Hodnocení musí být od 1 do 5.");
      const COMMENT=typeof body.comment === "string" ? body.comment.trim() : ""; if (COMMENT.length>1000) throw new AppError("Komentář smí mít nejvýše 1000 znaků.");
      DATABASE.prepare("INSERT INTO feedback(user_id,meal_id,rating,comment,canteen_id) VALUES(?,?,?,?,?) ON CONFLICT(user_id,meal_id) DO UPDATE SET rating=excluded.rating,comment=excluded.comment").run(user.id,MEAL_ID,RATING,COMMENT,user.canteenId);
    } else {
      const CATEGORY=requiredText(body.category,"Kategorie"), ICON=requiredText(body.icon,"Ikona"), SOUP=requiredText(body.soup,"Polévka",120);
      if (!IS_STAFF) throw new AppError("Jídelníček může upravovat pouze personál jídelny.",403);
      if (!["Ryba","Drůbež","Maso","Bez masa","Sladké"].includes(CATEGORY) || !["fish","pasta","chicken","greens","meatballs","rice","mushroom","lentils","salad","sweet"].includes(ICON)) throw new AppError("Vyberte platnou kategorii a ikonu.");
      DATABASE.prepare("UPDATE meals SET name=?,side=?,ingredients=?,allergens=?,category=?,icon=? WHERE id=? AND canteen_id=?").run(requiredText(body.name,"Název",120),requiredText(body.side,"Příloha",120),requiredText(body.ingredients,"Suroviny"),requiredText(body.allergens,"Alergeny",100),CATEGORY,ICON,MEAL_ID,user.canteenId);
      DATABASE.prepare("UPDATE meals SET soup=? WHERE date=? AND canteen_id=?").run(SOUP,MEAL.date,user.canteenId);
    }
    return;
  }
  if (ACTION === "idea") {
    DATABASE.prepare("INSERT INTO ideas(user_id,text,canteen_id) VALUES(?,?,?)").run(user.id,requiredText(body.text,"Námět"),user.canteenId); return;
  }
  if (ACTION === "resolve") {
    const STATUS=requiredText(body.status,"Stav"), RESPONSE=requiredText(body.response,"Vysvětlení a případná alternativa");
    if (!IS_STAFF || !["Přijato","Upraveno","Nezařazeno"].includes(STATUS)) throw new AppError("Neplatný stav námětu nebo oprávnění.",403);
    const RESULT=DATABASE.prepare("UPDATE ideas SET status=?,response=? WHERE id=? AND canteen_id=?").run(STATUS,RESPONSE,identifier(body.ideaId),user.canteenId);
    if (!RESULT.changes) throw new AppError("Námět nebyl nalezen.",404); return;
  }
  if (ACTION === "preferences") {
    const DINER_ID=body.dinerId === undefined ? user.dinerId : identifier(body.dinerId);
    if (!DINER_ID) throw new AppError("Vyberte strávníka.",404);
    assertOwnedDiner(user,DINER_ID);
    if (user.role !== "parent") throw new AppError("Preference spravuje rodič.",403);
    const TEXT=typeof body.text === "string" ? body.text.trim() : ""; if (TEXT.length>1000) throw new AppError("Preference smí mít nejvýše 1000 znaků.");
    DATABASE.prepare("INSERT INTO preferences_v2(diner_id,canteen_id,text) VALUES(?,?,?) ON CONFLICT(diner_id) DO UPDATE SET text=excluded.text,canteen_id=excluded.canteen_id").run(DINER_ID,user.canteenId,TEXT); return;
  }
  throw new AppError("Neznámá akce.");
}
"use client";
import { useState } from "react";
import type { AppData } from "@/lib/types";
import { proposeMeal } from "@/lib/planner";
import { Button } from "./ui/button";
import type { SaveAction } from "./forms";
export function Planner({
  data,
  onSave,
  isPending,
}: {
  data: AppData;
  onSave: SaveAction;
  isPending: boolean;
}) {
  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
  const [targetId, setTargetId] = useState(String(data.meals[0].id));
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
  return (
    <section className="planner-panel">
      <h3>Zařadit námět do jídelníčku</h3>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setIsPreviewVisible(true);
        }}
      >
        <label>
          Námět
          <select
            value={ideaId}
            onChange={(event) => {
              setIdeaId(event.target.value);
              setIsPreviewVisible(false);
            }}
            required
          >
            <option value="">Vyberte námět</option>
            {data.ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.text}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nahradit jídlo
          <select
            value={targetId}
            onChange={(event) => {
              setTargetId(event.target.value);
              setIsPreviewVisible(false);
            }}
          >
            {data.meals.map((meal) => (
              <option key={meal.id} value={meal.id}>
                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
                {meal.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="secondary" disabled={!IDEA}>
          Připravit návrh
        </Button>
      </form>
      {isPreviewVisible && IDEA && (
        <div className="proposal">
          <h3>{PROPOSAL.meal.name}</h3>
          <p>{PROPOSAL.meal.ingredients}</p>
          <p>{PROPOSAL.reason}</p>
          <p>
            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
            kuchyně. Ostatní jídla týdne zůstávají zachována.
          </p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (
                await onSave({
                  action: "applyProposal",
                  ideaId: IDEA.id,
                  mealId: Number(targetId),
                  sourceId: PROPOSAL.meal.id,
                  response: new FormData(event.currentTarget).get("response"),
                })
              )
                setIsPreviewVisible(false);
            }}
          >
            <label>
              Odpověď rodiči
              <textarea
                name="response"
                required
                maxLength={1000}
                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
              />
            </label>
            <Button disabled={isPending} type="submit">
              Schválit a zařadit do jídelníčku
            </Button>
          </form>
        </div>
      )}
    </section>
  );
}
"use client";
import { Planner } from "./planner";
import { Button } from "./ui/button";
import type { AppData } from "@/lib/types";
import type { SaveAction } from "./forms";
import { AccountPanel } from "./account";
export function Community({
  data,
  view,
  onSave,
  isPending,
}: {
  data: AppData;
  view: string;
  onSave: SaveAction;
  isPending: boolean;
}) {
  const IS_STAFF = (data.user?.role === "staff" || data.user?.role === "manager");
  if (view === "account") return <AccountPanel data={data} onSave={onSave} isPending={isPending} />;
  if (view === "preferences")
    return (
      <section className="content-panel">
        <p className="child-name">{data.diners.find((diner) => diner.id === data.activeDinerId)?.name}{data.diners.find((diner) => diner.id === data.activeDinerId)?.className ? ` · ${data.diners.find((diner) => diner.id === data.activeDinerId)?.className}` : ""}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onSave({
              action: "preferences",
              text: new FormData(event.currentTarget).get("text"),
            });
          }}
        >
          <label>
            Oblíbená jídla a potraviny, které dítě nejí
            <textarea
              name="text"
              defaultValue={data.preferences}
              maxLength={1000}
            />
          </label>
          <p className="form-note">
            Preference vidí jídelna. Nenahrazují oficiální postup jídelny pro
            dietní stravování a alergie.
          </p>
          <Button type="submit" disabled={isPending}>
            Uložit preference
          </Button>
        </form>
      </section>
    );
  if (view === "feedback")
    return (
      <section className="content-panel">
        {data.feedback.length === 0 && (
          <p>
            Zatím žádné hodnocení. Jídlo ohodnotíte přes hvězdičku v jídelníčku.
          </p>
        )}
        {data.feedback.map((feedback) => (
          <article className="feedback-row" key={feedback.id}>
            <div>
              <strong>{feedback.meal}</strong>
              <span className="rating-text">
                {"★".repeat(feedback.rating)}
                {"☆".repeat(5 - feedback.rating)}
              </span>
            </div>
            <p>{feedback.comment || "Bez komentáře"}</p>
            <small>{feedback.name}</small>
          </article>
        ))}
      </section>
    );
  return (
    <section className="content-panel">
      {IS_STAFF && (
        <Planner data={data} onSave={onSave} isPending={isPending} />
      )}
      {!IS_STAFF && (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const FORM = event.currentTarget;
            if (
              await onSave({
                action: "idea",
                text: new FormData(FORM).get("text"),
              })
            )
              FORM.reset();
          }}
        >
          <label>
            Jaké jídlo byste zařadili?
            <textarea
              name="text"
              required
              maxLength={1000}
              placeholder="Například špagety s rajčatovou omáčkou…"
            />
          </label>
          <Button disabled={isPending} type="submit">
            Poslat námět jídelně
          </Button>
        </form>
      )}
      {data.ideas.length === 0 && (
        <p className="empty-state">Zatím žádné náměty.</p>
      )}
      {data.ideas.map((idea) => (
        <article key={idea.id} className="idea-row">
          <div className="section-heading">
            <strong>{idea.text}</strong>
            <span className="status-pill">{idea.status}</span>
          </div>
          <small>{idea.name}</small>
          {idea.response && <p className="idea-response">{idea.response}</p>}
          {IS_STAFF && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void onSave({
                  ...Object.fromEntries(new FormData(event.currentTarget)),
                  action: "resolve",
                  ideaId: idea.id,
                });
              }}
            >
              <label>
                Rozhodnutí
                <select
                  name="status"
                  defaultValue={
                    idea.status === "Čeká na vyřízení"
                      ? "Upraveno"
                      : idea.status
                  }
                >
                  <option>Přijato</option>
                  <option>Upraveno</option>
                  <option>Nezařazeno</option>
                </select>
              </label>
              <label>
                Vysvětlení pro rodiče, při nezařazení také alternativa
                <textarea
                  name="response"
                  required
                  maxLength={1000}
                  defaultValue={idea.response}
                />
              </label>
              <Button type="submit" disabled={isPending}>
                Odeslat odpověď
              </Button>
            </form>
          )}
        </article>
      ))}
    </section>
  );
}
{
  "name": "spolecny-stul",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "check": "npm run lint && npm run typecheck && npm run test && npm run build && npm run test:browser",
    "test": "tsx --test tests/*.test.ts",
    "test:browser": "playwright test",
    "admin": "tsx scripts/admin.ts",
    "coder:generate-boilerplates": "npx ptbk coder generate-boilerplates --count 5*1 --template ./prompts/templates/common.md",
    "coder:add": "npx ptbk coder add --template ./prompts/templates/common.md",
    "coder:run": "npx ptbk coder run --harness openai-codex --model gpt-6-luna --thinking-level low --agent agents/developer.book --context AGENTS.md --test \"npm run check\" --test-before yes-and-fail",
    "coder:verify": "npx ptbk coder verify",
    "test-for-ptbk-coder": "npm test",
    "check:offline-build": "node scripts/check-offline-build.mjs"
  },
  "dependencies": {
    "lucide-react": "0.536.0",
    "next": "latest",
    "qrcode": "^1.5.4",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@eslint/eslintrc": "latest",
    "@playwright/test": "^1.63.0",
    "@types/node": "latest",
    "@types/qrcode": "^1.5.6",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "prettier": "^3.9.9",
    "ptbk": "^0.114.0-41",
    "tsx": "^4.23.15",
    "typescript": "latest"
  },
  "engines": {
    "node": ">=24.0.0"
  },
  "type": "module"
}

exec
/bin/zsh -lc "rg -n \"ideas|CREATE TABLE.*ideas|recipeVersions|recipe_versions|basket|limit|price|email|send\" lib app tests components | head -250 && sed -n '1,300p' lib/database.ts && sed -n '1,300p' lib/seed.ts" in /Users/hejny/work/workshops/workshop-boilerplate
 succeeded in 0ms:
components/community.tsx:107:      {data.ideas.length === 0 && (
components/community.tsx:110:      {data.ideas.map((idea) => (
components/forms.tsx:41:          name={isRegistration || isResetRequest ? "email" : "username"}
components/forms.tsx:42:          type={isRegistration || isResetRequest ? "email" : "text"}
components/forms.tsx:43:          autoComplete={isRegistration ? "email" : "username"}
components/planner.tsx:16:  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
components/planner.tsx:19:  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
components/planner.tsx:41:            {data.ideas.map((idea) => (
components/auth-token-form.tsx:8:    {mode==="invite"&&<><label>Jméno<input name="name" autoComplete="name" required /></label><label>E-mail<input name="email" type="email" autoComplete="email" required /></label></>}
components/weekly-menu.tsx:13:import { ConsumerBasketPanel } from "./consumer-basket-panel";
components/account.tsx:11:    <p>{data.user?.email || data.user?.username}</p>
components/account.tsx:19:      <label>E-mail<input name="email" type="email" defaultValue={data.user?.email||""}/></label>
components/account.tsx:29:    {data.roles.includes("manager")&&<form onSubmit={(event)=>{event.preventDefault();void onSave({action:"inviteStaff",email:new FormData(event.currentTarget).get("email")});}}><label>E-mail zaměstnance<input name="email" type="email" required /></label><Button type="submit" disabled={isPending}>Pozvat zaměstnance</Button></form>}
components/account.tsx:31:    {data.roles.includes("manager")&&<form onSubmit={(event)=>{event.preventDefault();void onSave({action:"linkAdultDiner",...Object.fromEntries(new FormData(event.currentTarget))});}}><label>Dospělý strávník<select name="dinerId" required>{data.managedDiners.filter((diner)=>diner.type==="adult").map((diner)=><option key={diner.id} value={diner.id}>{diner.name} · {diner.dinerNumber}</option>)}</select></label><label>Uživatelský účet<select name="userId" required>{data.managedPeople.map((person)=><option key={person.id} value={person.id}>{person.name} · {person.email||person.roles.join(", ")}</option>)}</select></label><Button type="submit" disabled={isPending}>Propojit účet se strávníkem</Button></form>}
components/account.tsx:32:    {data.roles.includes("manager")&&<><h3>Role uživatelů</h3>{data.managedPeople.map((person)=><article key={person.id} className="managed-diner"><strong>{person.name} · {person.email||"bez e-mailu"}</strong><div>{person.roles.map((role)=><span key={role} className="managed-role">{ROLE_LABELS[role]}{!(person.id===data.user?.id&&role==="manager")&&<button aria-label={`Odebrat roli ${ROLE_LABELS[role]} u ${person.name}`} onClick={()=>void onSave({action:"revokeRole",userId:person.id,role})}>×</button>}</span>)}</div><form onSubmit={(event)=>{event.preventDefault();void onSave({action:"grantRole",userId:person.id,role:new FormData(event.currentTarget).get("role")});}}><label>Přidat roli<select name="role"><option value="staff">Personál</option><option value="manager">Vedoucí</option><option value="parent">Rodič</option><option value="pupil">Žák</option><option value="adult">Dospělý strávník</option></select></label><Button type="submit" variant="secondary" disabled={isPending}>Přidat roli</Button></form></article>)}</>}
tests/consumer-basket.test.ts:3:import { calculateConsumerBasket, getChoiceMenuItems } from "../lib/consumer-basket";
tests/consumer-basket.test.ts:4:import { BASKET_RULE_SETS } from "../lib/basket-rules";
lib/accounts.ts:16:  const NAME=typeof body.name==="string"?body.name.trim():"",EMAIL=typeof body.email==="string"?body.email.trim().toLowerCase():"",PASSWORD=typeof body.password==="string"?body.password:"",CODE=typeof body.code==="string"?body.code.trim():"";
lib/accounts.ts:20:    const RESULT=DATABASE.prepare("INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)").run(NAME,EMAIL,await hashPassword(PASSWORD),Date.now()),USER_ID=Number(RESULT.lastInsertRowid);
app/api/action/route.ts:7:import { sendEmail } from "@/lib/email";
app/api/action/route.ts:29:      const IDENTIFIER = String(BODY.username || BODY.email || "").trim().toLowerCase();
app/api/action/route.ts:31:      const ROW = DATABASE.prepare("SELECT * FROM users WHERE (lower(email)=? OR lower(username)=?) AND deleted_at IS NULL").get(IDENTIFIER,IDENTIFIER) as {id:number;password_hash:string|null}|undefined;
app/api/action/route.ts:46:      const EMAIL=String(BODY.email || "").trim().toLowerCase();
app/api/action/route.ts:47:      if(EMAIL){const ACCOUNT=DATABASE.prepare("SELECT id,email,(SELECT canteen_id FROM user_roles WHERE user_id=users.id ORDER BY canteen_id LIMIT 1) AS canteen_id FROM users WHERE lower(email)=? AND deleted_at IS NULL").get(EMAIL) as {id:number;email:string;canteen_id:number}|undefined;
app/api/action/route.ts:48:        if(ACCOUNT){const RESET_TOKEN=createToken();DATABASE.prepare("INSERT INTO password_resets(user_id,token_hash,expires_at) VALUES(?,?,?)").run(ACCOUNT.id,hashToken(RESET_TOKEN),Date.now()+30*60_000);await sendEmail({to:ACCOUNT.email,subject:"Obnovení hesla · Společný stůl",text:`Odkaz pro obnovu: ${new URL(`/reset?token=${RESET_TOKEN}`,request.url)}`});recordAudit(ACCOUNT.canteen_id||1,ACCOUNT.id,"password_reset_requested");}}
app/api/action/route.ts:53:      const RESET=DATABASE.prepare("SELECT r.id,r.user_id,u.email,(SELECT canteen_id FROM user_roles WHERE user_id=u.id ORDER BY canteen_id LIMIT 1) AS canteen_id FROM password_resets r JOIN users u ON u.id=r.user_id WHERE r.token_hash=? AND r.expires_at>? AND r.used_at IS NULL AND u.deleted_at IS NULL").get(hashToken(RESET_TOKEN),Date.now()) as {id:number;user_id:number;email:string|null;canteen_id:number}|undefined;
app/api/action/route.ts:58:      const INVITE=DATABASE.prepare("SELECT id,canteen_id,role,email FROM invitations WHERE token_hash=? AND expires_at>? AND used_at IS NULL").get(hashToken(String(BODY.token || "")),Date.now()) as {id:number;canteen_id:number;role:Role;email:string}|undefined;
app/api/action/route.ts:60:      const NAME=String(BODY.name||"").trim(),EMAIL=String(BODY.email||"").trim().toLowerCase(),PASSWORD=String(BODY.password||"");if(!NAME||EMAIL!==INVITE.email||!EMAIL.includes("@")||PASSWORD.length<12)throw new AppError("Zkontrolujte jméno, e-mail a heslo.");
app/api/action/route.ts:61:      const RESULT=DATABASE.prepare("INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)").run(NAME,EMAIL,await hashPassword(PASSWORD),Date.now());const USER_ID=Number(RESULT.lastInsertRowid);DATABASE.prepare("INSERT INTO user_roles(user_id,canteen_id,role) VALUES(?,?,?)").run(USER_ID,INVITE.canteen_id,INVITE.role);DATABASE.prepare("UPDATE invitations SET used_at=? WHERE id=?").run(Date.now(),INVITE.id);recordAudit(INVITE.canteen_id,USER_ID,"staff_invited");await createSession(USER_ID,INVITE.canteen_id,INVITE.role,null,COOKIE_STORE,request);USER=getUser(COOKIE_STORE.get(SESSION_COOKIE)?.value);
app/api/action/route.ts:64:      if(BODY.action==="exportData") {const ACCOUNT=DATABASE.prepare("SELECT name,email,username,created_at AS createdAt FROM users WHERE id=?").get(AUTH_USER.id);const CHILDREN=DATABASE.prepare("SELECT d.name,d.class_name,d.diner_number,p.text AS preferences FROM diner_links l JOIN diners d ON d.id=l.diner_id LEFT JOIN preferences_v2 p ON p.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=?").all(AUTH_USER.id,AUTH_USER.canteenId);const IDEAS=DATABASE.prepare("SELECT text,status,response FROM ideas WHERE user_id=? AND canteen_id=?").all(AUTH_USER.id,AUTH_USER.canteenId);const FEEDBACK=DATABASE.prepare("SELECT meal_id,rating,comment FROM feedback WHERE user_id=? AND canteen_id=?").all(AUTH_USER.id,AUTH_USER.canteenId);return Response.json({account:ACCOUNT,children:CHILDREN,ideas:IDEAS,feedback:FEEDBACK});}
app/api/action/route.ts:65:      if(BODY.action==="updateAccount") {const NAME=String(BODY.name||"").trim(),EMAIL=String(BODY.email||"").trim().toLowerCase(),OLD=String(BODY.currentPassword||""),NEW=String(BODY.password||"");const ACCOUNT=DATABASE.prepare("SELECT password_hash FROM users WHERE id=?").get(AUTH_USER.id) as {password_hash:string|null};if(!NAME||(!EMAIL.includes("@")&&EMAIL!==""))throw new AppError("Zkontrolujte jméno a e-mail.");if(NEW&&NEW.length<12)throw new AppError("Nové heslo musí mít alespoň 12 znaků.");if(NEW&&(!ACCOUNT.password_hash||!(await verifyPassword(OLD,ACCOUNT.password_hash))))throw new AppError("Zadejte současné heslo.");DATABASE.prepare("UPDATE users SET name=?,email=?,password_hash=? WHERE id=?").run(NAME,EMAIL||null,NEW?await hashPassword(NEW):ACCOUNT.password_hash,AUTH_USER.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"account_updated");USER=getUser(TOKEN);}
app/api/action/route.ts:67:      if(BODY.action==="deleteAccount") {DATABASE.prepare("UPDATE users SET name='Smazaný uživatel',email=NULL,username=NULL,password_hash=NULL,deleted_at=? WHERE id=?").run(Date.now(),AUTH_USER.id);DATABASE.prepare("DELETE FROM sessions WHERE user_id=?").run(AUTH_USER.id);DATABASE.prepare("DELETE FROM diner_links WHERE user_id=?").run(AUTH_USER.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"account_deleted");COOKIE_STORE.delete(SESSION_COOKIE);USER=null;}
app/api/action/route.ts:71:      if(BODY.action==="inviteStaff") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Pozvánku může vytvořit pouze vedoucí jídelny.",403);const EMAIL=String(BODY.email||"").trim().toLowerCase();if(!EMAIL.includes("@"))throw new AppError("Zadejte platný e-mail.");const INVITE_TOKEN=createToken(),ROLE:Role="staff";DATABASE.prepare("INSERT INTO invitations(canteen_id,email,token_hash,role,expires_at) VALUES(?,?,?,?,?)").run(AUTH_USER.canteenId,EMAIL,hashToken(INVITE_TOKEN),ROLE,Date.now()+7*86400000);await sendEmail({to:EMAIL,subject:"Pozvánka do jídelny · Společný stůl",text:`Jednorázový odkaz: ${new URL(`/invite?token=${INVITE_TOKEN}`,request.url)}`});recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"staff_invitation_created");}
lib/mutations.ts:26:    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
lib/mutations.ts:32:      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
lib/mutations.ts:61:    DATABASE.prepare("INSERT INTO ideas(user_id,text,canteen_id) VALUES(?,?,?)").run(user.id,requiredText(body.text,"Námět"),user.canteenId); return;
lib/mutations.ts:66:    const RESULT=DATABASE.prepare("UPDATE ideas SET status=?,response=? WHERE id=? AND canteen_id=?").run(STATUS,RESPONSE,identifier(body.ideaId),user.canteenId);
lib/database.ts:15:    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT, username TEXT UNIQUE, email TEXT, password_hash TEXT, created_at INTEGER NOT NULL DEFAULT 0, deleted_at INTEGER);
lib/database.ts:20:    CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), text TEXT, status TEXT DEFAULT 'Čeká na vyřízení', response TEXT DEFAULT '');
lib/database.ts:32:      CREATE TABLE IF NOT EXISTS invitations (id INTEGER PRIMARY KEY, canteen_id INTEGER NOT NULL REFERENCES canteens(id), email TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, role TEXT NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER);
lib/database.ts:35:    CREATE TABLE IF NOT EXISTS rate_limits (key_hash TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_started INTEGER NOT NULL);
lib/database.ts:40:    if (!USER_COLUMNS.some((column) => column.name === "email")) DATABASE.exec("ALTER TABLE users ADD COLUMN email TEXT");
lib/database.ts:46:    for (const table of ["feedback", "ideas", "selections", "preferences"]) {
lib/database.ts:55:    if (!INVITATION_COLUMNS.some((column) => column.name === "email")) DATABASE.exec("ALTER TABLE invitations ADD COLUMN email TEXT NOT NULL DEFAULT ''");
lib/database.ts:63:    DATABASE.exec("CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(lower(email)) WHERE email IS NOT NULL");
lib/database.ts:83:  const ROW = DATABASE.prepare(`SELECT u.id,u.name,u.username,u.email,s.active_role AS role,s.canteen_id AS canteenId,s.diner_id AS dinerId,
lib/database.ts:87:    AND (s.active_role NOT IN ('parent','pupil','adult') OR EXISTS (SELECT 1 FROM diner_links l JOIN diners d ON d.id=l.diner_id WHERE l.user_id=u.id AND l.canteen_id=s.canteen_id AND d.id=s.diner_id AND d.canteen_id=s.canteen_id AND (d.archived_at IS NULL OR d.archived_at>?)))`).get(hashToken(token), Date.now(), Date.now()-30*86400000) as {id:number;name:string;username:string|null;email:string|null;role:Role;canteenId:number;dinerId:number|null;roleList:string}|undefined;
lib/database.ts:89:  return { id:ROW.id,name:ROW.name,username:ROW.username || "",email:ROW.email,role:ROW.role,canteenId:ROW.canteenId,dinerId:ROW.dinerId,roles:ROW.roleList?.split(",") as Role[] || [] };
lib/database.ts:97:  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
lib/database.ts:103:  const MANAGED_PEOPLE = user?.roles.includes("manager") ? DATABASE.prepare("SELECT u.id,u.name,u.email,group_concat(r.role, ',') AS role_list FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.canteen_id=? AND u.deleted_at IS NULL GROUP BY u.id,u.name,u.email ORDER BY u.name").all(CANteen_ID).map((row)=>{const ITEM=row as {id:number;name:string;email:string|null;role_list:string};return {id:ITEM.id,name:ITEM.name,email:ITEM.email,roles:ITEM.role_list.split(",") as Role[]};}) : [];
lib/database.ts:107:  return { isDemoMode:process.env.IS_DEMO_MODE === "true", user: user ? {id:user.id,name:user.name,role:user.role,username:user.username,email:user.email} : null, roles:ROLES, activeDinerId:DINER_ID || null, canteens:USER_CANTEENS, activeCanteenId:user?.canteenId || null, auditLog:AUDIT_LOG, managedDiners:MANAGED_DINERS, managedPeople:MANAGED_PEOPLE, diners:DINERS, meals:MEALS, recipeVersions:[], selections:Object.fromEntries(SELECTIONS.map((row)=>[row.date,row.meal_id])), feedback:FEEDBACK as AppData["feedback"], ideas:IDEAS as AppData["ideas"], preferences:user && DINER_ID ? String((DATABASE.prepare("SELECT text FROM preferences_v2 WHERE diner_id=? AND canteen_id=?").get(DINER_ID,CANteen_ID) as {text?:string}|undefined)?.text || "") : "", preferencesList:PREFERENCES_LIST, weeks:["2026-09-21","2026-09-28","2026-10-05"], operatingDates: OPERATING_DATES };
components/sidebar.tsx:54:            {id === "ideas" &&
components/sidebar.tsx:55:              data.ideas.filter((idea) => idea.status === "Čeká na vyřízení")
components/sidebar.tsx:59:                    data.ideas.filter(
components/consumer-basket-panel.tsx:3:import { calculateConsumerBasket, getBasketStatusLabel, getChoiceMenuItems } from "@/lib/consumer-basket";
components/consumer-basket-panel.tsx:4:import { BASKET_RULE_SETS, getDefaultRuleSet } from "@/lib/basket-rules";
components/consumer-basket-panel.tsx:16:    recipeVersion: data.recipeVersions.find((version) => version.id === meal.recipeVersionId) ?? null,
components/consumer-basket-panel.tsx:44:  return <span>{monthResult.groups.filter((group) => group.status !== "ok").length} skupin mimo limit nebo s chybějícími údaji</span>;
components/consumer-basket-panel.tsx:80:  return <section className="consumer-basket" aria-label="Spotřební koš">
components/consumer-basket-panel.tsx:81:    <div className="basket-heading">
components/consumer-basket-panel.tsx:87:    <div className="basket-controls">
components/consumer-basket-panel.tsx:88:      <div className="basket-period-switch"><button aria-pressed={!isMonthMode} onClick={() => setIsMonthMode(false)}>Týden</button><button aria-pressed={isMonthMode} onClick={() => setIsMonthMode(true)}>Měsíc</button></div>
components/consumer-basket-panel.tsx:89:      <label className="basket-choice-reading"><input type="checkbox" checked={isSelectedMealReading} onChange={(event) => setIsSelectedMealReading(event.target.checked)} /> Zobrazit jen vybraný chod v hlavním přehledu</label>
components/consumer-basket-panel.tsx:91:    <p className="basket-interpretation">Vyhláška požaduje zachovat plnění normy při nabídce jídel na výběr, neurčuje však, zda evidovat celý objem výroby, nebo odebrané porce. Vedle sebe jsou dostupné obě čtení.</p>
components/consumer-basket-panel.tsx:92:    {!isMonthMode && <p className="basket-month-context">Měsíc zatím: <RuleSetComparison data={data} monthMeals={monthMeals} monthDates={monthDates} ageCategory={AGE} ruleSet={ruleSet} /> · Zbývá {restDays} provozních dnů.</p>}
components/consumer-basket-panel.tsx:93:    <div className="basket-groups">{result.groups.map((group) => <button className="basket-group" key={group.groupId} onClick={() => setSelectedGroupId(selectedGroupId === group.groupId ? null : group.groupId)} aria-expanded={selectedGroupId === group.groupId}>
components/consumer-basket-panel.tsx:94:      <span className="basket-group-title"><strong>{group.label}</strong><small>{getBasketStatusLabel(group.status, group.isEstimate)}</small></span>
components/consumer-basket-panel.tsx:95:      <span className="basket-progress"><i style={{ width: `${Math.max(0, Math.min(100, group.maximumGrams === null ? (group.targetGrams ? group.amountGrams / group.targetGrams * 100 : 0) : group.amountGrams / group.maximumGrams * 100))}%` }} /></span>
components/consumer-basket-panel.tsx:96:      <span className="basket-values">{displayAmount(group.amountGrams)} / {group.targetGrams === null ? "chybí v pravidlech" : displayAmount(group.targetGrams)} {group.minimumGrams !== null && group.maximumGrams !== null && <small>({displayAmount(group.minimumGrams)}–{displayAmount(group.maximumGrams)})</small>}</span>
components/consumer-basket-panel.tsx:97:      <span className="basket-contribution">{periodLabel} přidává hodnotu za {countOperatingDays(data, rangeDates)} provozních dnů</span>
components/consumer-basket-panel.tsx:100:    <div className="basket-comparison"><span>Výklad výběrového menu · {periodLabel}</span><div><strong>Všechna nabízená jídla</strong><ChoiceResultSummary result={allOfferedResult} /></div><div><strong>Jídla zvolená strávníky</strong><ChoiceResultSummary result={selectedMealsResult} /></div></div>
components/consumer-basket-panel.tsx:101:    <div className="basket-comparison"><span>Porovnání pravidel pro měsíc</span>{BASKET_RULE_SETS.filter((item) => item.id !== ruleSet.id).map((item) => <div key={item.id}><strong>{item.name}</strong><RuleSetComparison data={data} monthMeals={monthMeals} monthDates={monthDates} ageCategory={AGE} ruleSet={item} /></div>)}</div>
components/consumer-basket-panel.tsx:102:    <p className="basket-data-note">Chybí v pravidlech = cílová hodnota není dostupná pro zvolenou věkovou kategorii. Chybějící gramáže receptur se nezapočítávají.</p>
components/consumer-basket-panel.tsx:107:  return <span>{result.groups.filter((group) => group.status !== "ok").length} skupin mimo limit nebo s chybějícími údaji</span>;
components/consumer-basket-panel.tsx:111:  return <div className="basket-contributors"><h3>{group.label}: příspěvky</h3>{group.contributingMeals.length ? group.contributingMeals.map((meal) => <p key={meal.mealId}>{meal.name} · {displayAmount(meal.amountGrams)}{meal.isEstimate ? " · odhad" : ""}</p>) : <p>Chybí gramáže receptur.</p>}<small>{result.ruleSetName}</small></div>;
lib/security.ts:19:export function enforceRateLimit(database: import("node:sqlite").DatabaseSync, key: string, limit = 10, windowMs = 15 * 60_000): void {
lib/security.ts:23:  const EXISTING = DATABASE.prepare("SELECT attempts,window_started FROM rate_limits WHERE key_hash=?").get(HASH) as {attempts:number;window_started:number}|undefined;
lib/security.ts:25:  if (!IS_EXPIRED && EXISTING.attempts >= limit) throw new AppError("Příliš mnoho pokusů. Zkuste to později.",429);
lib/security.ts:26:  DATABASE.prepare("INSERT INTO rate_limits(key_hash,attempts,window_started) VALUES(?,?,?) ON CONFLICT(key_hash) DO UPDATE SET attempts=excluded.attempts,window_started=excluded.window_started").run(HASH,IS_EXPIRED ? 1 : EXISTING.attempts + 1,IS_EXPIRED ? NOW : EXISTING.window_started);
lib/consumer-basket.ts:100:  const LABELS = { ok: "v limitu", under: "pod limitem", over: "nad limitem", missingData: "chybí v pravidlech nebo receptuře" };
components/dashboard.tsx:86:    { id: "ideas", label: "Náměty na jídla", icon: Lightbulb },
components/dashboard.tsx:142:              <Button variant="secondary" onClick={() => setView("ideas")}>
tests/onboarding.test.ts:15:  const FIRST=await registerParentWithCode({name:"Petra",email:"petra@example.test",password:"PetraPassword-2026!",code:CODES[0]});
tests/onboarding.test.ts:17:  const SECOND=await registerParentWithCode({name:"Pavel",email:"pavel@example.test",password:"PavelPassword-2026!",code:CODES[0]});
tests/onboarding.test.ts:18:  const PARENT={id:FIRST.userId,name:"Petra",username:"",email:"petra@example.test",role:"parent" as const,canteenId:1,dinerId:FIRST.dinerId,roles:["parent"] as ("parent"|"pupil"|"adult"|"staff"|"manager")[]};
tests/domain.test.ts:92:  const IDEA = DATA.ideas[0];
tests/domain.test.ts:111:    getData(PARENT).ideas[0].response,
lib/types.ts:2:export type User = { id: number; name: string; role: Role; username: string; email?: string | null };
lib/types.ts:92:  managedPeople: { id: number; name: string; email: string | null; roles: Role[] }[];
lib/types.ts:96:  recipeVersions: RecipeVersion[];
lib/types.ts:99:  ideas: Idea[];
app/styles/menu.css:238:.consumer-basket { margin: 0 0 24px; padding: 22px; border: 1px solid var(--border); border-radius: 12px; background: #fff; }
app/styles/menu.css:239:.basket-heading, .basket-controls, .basket-group-title, .basket-period-switch { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
app/styles/menu.css:240:.basket-heading h2 { font-size: 18px; }
app/styles/menu.css:241:.basket-heading strong, .basket-heading label, .basket-group small, .basket-values, .basket-contribution, .basket-month-context, .basket-interpretation, .basket-data-note, .basket-comparison { font-size: 11px; }
app/styles/menu.css:242:.basket-heading label { display: grid; gap: 4px; color: var(--muted); }
app/styles/menu.css:243:.basket-heading select { max-width: 360px; font: inherit; }
app/styles/menu.css:244:.basket-controls { margin-top: 16px; }
app/styles/menu.css:245:.basket-period-switch { justify-content: flex-start; }
app/styles/menu.css:246:.basket-period-switch button { padding: 6px 11px; border: 1px solid var(--border); border-radius: 6px; background: white; color: var(--ink); cursor: pointer; }
app/styles/menu.css:247:.basket-period-switch button[aria-pressed="true"] { background: var(--tint); border-color: #b4c0a7; }
app/styles/menu.css:248:.basket-choice-reading { display: flex; align-items: center; gap: 7px; font-size: 11px; }
app/styles/menu.css:249:.basket-month-context { margin-top: 12px; }
app/styles/menu.css:250:.basket-interpretation, .basket-data-note { color: var(--muted); margin-top: 8px; line-height: 1.5; }
app/styles/menu.css:251:.basket-groups { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; margin-top: 14px; }
app/styles/menu.css:252:.basket-group { display: grid; gap: 7px; padding: 11px; border: 1px solid var(--border); border-radius: 8px; background: #fff; color: var(--ink); text-align: left; cursor: pointer; }
app/styles/menu.css:253:.basket-group-title strong { font-size: 12px; }
app/styles/menu.css:254:.basket-group small { color: #8a6431; }
app/styles/menu.css:255:.basket-progress { height: 7px; background: #eff1eb; border-radius: 6px; overflow: hidden; }
app/styles/menu.css:256:.basket-progress i { display: block; height: 100%; background: #78916c; border-radius: inherit; }
app/styles/menu.css:257:.basket-values small { display: block; color: var(--muted); }
app/styles/menu.css:258:.basket-contribution { color: var(--muted); }
app/styles/menu.css:259:.basket-contributors { margin-top: 12px; padding: 12px; background: var(--paper); border-radius: 8px; }
app/styles/menu.css:260:.basket-contributors h3 { font-size: 13px; }
app/styles/menu.css:261:.basket-contributors p, .basket-contributors small { display: block; margin-top: 7px; font-size: 11px; }
app/styles/menu.css:262:.basket-comparison { margin-top: 16px; border-top: 1px solid var(--border); padding-top: 12px; }
app/styles/menu.css:263:.basket-comparison > span { font-weight: 600; }
app/styles/menu.css:264:.basket-comparison div { display: flex; justify-content: space-between; gap: 10px; margin-top: 8px; }
app/styles/menu.css:265:.basket-comparison div strong { font-weight: 500; }
lib/email.ts:2:export interface EmailTransport { send(message: EmailMessage): Promise<void> }
lib/email.ts:4:  async send(message: EmailMessage): Promise<void> {
lib/email.ts:5:    console.info(`[email] To: ${message.to}\nSubject: ${message.subject}\n${message.text}`);
lib/email.ts:10:  async send(message: EmailMessage): Promise<void> {
lib/email.ts:19:  throw new Error("Production email transport is not configured.");
lib/email.ts:21:export async function sendEmail(message: EmailMessage): Promise<void> { await getEmailTransport().send(message); }
lib/seed.ts:125:      "INSERT INTO ideas (user_id, text, status, response, canteen_id) VALUES (3, ?, ?, ?, 1)",
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { seedDemo } from "./seed";
import type { AppData, Meal, User, Role } from "./types";
import { hashToken } from "./security";
const DIRECTORY = process.env.DATABASE_DIRECTORY || join(process.cwd(), "data");
mkdirSync(DIRECTORY, { recursive: true });
export const DATABASE = new DatabaseSync(join(DIRECTORY, "spolecny-stul.sqlite"));
DATABASE.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
function migrate() {
  const VERSION = Number(DATABASE.prepare("PRAGMA user_version").get()?.user_version || 0);
  if (VERSION < 1) {
  DATABASE.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT, username TEXT UNIQUE, email TEXT, password_hash TEXT, created_at INTEGER NOT NULL DEFAULT 0, deleted_at INTEGER);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id), expires INTEGER);
    CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY, date TEXT, slot INTEGER, name TEXT, side TEXT, icon TEXT, category TEXT, allergens TEXT, ingredients TEXT, soup TEXT, UNIQUE(date, slot));
    CREATE TABLE IF NOT EXISTS selections (child_id INTEGER, date TEXT, meal_id INTEGER REFERENCES meals(id), PRIMARY KEY(child_id, date));
    CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), meal_id INTEGER REFERENCES meals(id), rating INTEGER, comment TEXT, UNIQUE(user_id, meal_id));
    CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), text TEXT, status TEXT DEFAULT 'Čeká na vyřízení', response TEXT DEFAULT '');
    CREATE TABLE IF NOT EXISTS preferences (child_id INTEGER PRIMARY KEY, text TEXT);
  `);
  DATABASE.exec("BEGIN IMMEDIATE");
  try {
    DATABASE.exec(`
      CREATE TABLE IF NOT EXISTS canteens (id INTEGER PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
      INSERT OR IGNORE INTO canteens VALUES (1, 'Školní jídelna', unixepoch()*1000);
      CREATE TABLE IF NOT EXISTS user_roles (user_id INTEGER NOT NULL REFERENCES users(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), role TEXT NOT NULL, PRIMARY KEY(user_id,canteen_id,role));
      CREATE TABLE IF NOT EXISTS diners (id INTEGER PRIMARY KEY, canteen_id INTEGER NOT NULL REFERENCES canteens(id), name TEXT NOT NULL, class_name TEXT, diner_number TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('pupil','adult')), archived_at INTEGER, UNIQUE(canteen_id,diner_number));
      CREATE TABLE IF NOT EXISTS diner_links (diner_id INTEGER NOT NULL REFERENCES diners(id), user_id INTEGER NOT NULL REFERENCES users(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), relationship TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(diner_id,user_id));
      CREATE TABLE IF NOT EXISTS pairing_codes (id INTEGER PRIMARY KEY, diner_id INTEGER NOT NULL REFERENCES diners(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), code_hash TEXT NOT NULL UNIQUE, uses INTEGER NOT NULL DEFAULT 0, revoked_at INTEGER, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS invitations (id INTEGER PRIMARY KEY, canteen_id INTEGER NOT NULL REFERENCES canteens(id), email TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, role TEXT NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER);
      CREATE TABLE IF NOT EXISTS password_resets (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, used_at INTEGER);
      CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY, canteen_id INTEGER NOT NULL REFERENCES canteens(id), actor_user_id INTEGER, action TEXT NOT NULL, subject_id INTEGER, reason TEXT, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS rate_limits (key_hash TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_started INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS selections_v2 (diner_id INTEGER NOT NULL REFERENCES diners(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), date TEXT NOT NULL, meal_id INTEGER NOT NULL REFERENCES meals(id), PRIMARY KEY(diner_id,date));
      CREATE TABLE IF NOT EXISTS preferences_v2 (diner_id INTEGER PRIMARY KEY REFERENCES diners(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), text TEXT NOT NULL DEFAULT '');
    `);
    const USER_COLUMNS = DATABASE.prepare("PRAGMA table_info(users)").all() as {name:string}[];
    if (!USER_COLUMNS.some((column) => column.name === "email")) DATABASE.exec("ALTER TABLE users ADD COLUMN email TEXT");
    if (!USER_COLUMNS.some((column) => column.name === "password_hash")) DATABASE.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
    if (!USER_COLUMNS.some((column) => column.name === "created_at")) DATABASE.exec("ALTER TABLE users ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0");
    if (!USER_COLUMNS.some((column) => column.name === "deleted_at")) DATABASE.exec("ALTER TABLE users ADD COLUMN deleted_at INTEGER");
    const COLUMNS = DATABASE.prepare("PRAGMA table_info(meals)").all() as {name:string}[];
    if (!COLUMNS.some((column) => column.name === "canteen_id")) DATABASE.exec("ALTER TABLE meals ADD COLUMN canteen_id INTEGER NOT NULL DEFAULT 1");
    for (const table of ["feedback", "ideas", "selections", "preferences"]) {
      const TABLE_COLUMNS = DATABASE.prepare(`PRAGMA table_info(${table})`).all() as {name:string}[];
      if (!TABLE_COLUMNS.some((column) => column.name === "canteen_id")) DATABASE.exec(`ALTER TABLE ${table} ADD COLUMN canteen_id INTEGER NOT NULL DEFAULT 1`);
    }
    for (const table of ["diner_links", "pairing_codes"]) {
      const TABLE_COLUMNS = DATABASE.prepare(`PRAGMA table_info(${table})`).all() as {name:string}[];
      if (!TABLE_COLUMNS.some((column) => column.name === "canteen_id")) DATABASE.exec(`ALTER TABLE ${table} ADD COLUMN canteen_id INTEGER NOT NULL DEFAULT 1`);
    }
    const INVITATION_COLUMNS = DATABASE.prepare("PRAGMA table_info(invitations)").all() as {name:string}[];
    if (!INVITATION_COLUMNS.some((column) => column.name === "email")) DATABASE.exec("ALTER TABLE invitations ADD COLUMN email TEXT NOT NULL DEFAULT ''");
    DATABASE.exec("INSERT OR IGNORE INTO user_roles(user_id,canteen_id,role) SELECT id,1,role FROM users WHERE role IN ('pupil','parent','staff','manager')");
    DATABASE.exec("CREATE TABLE IF NOT EXISTS sessions_v2 (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), expires INTEGER NOT NULL, active_role TEXT NOT NULL DEFAULT 'parent', diner_id INTEGER REFERENCES diners(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id))");
    DATABASE.exec("DROP TABLE sessions; ALTER TABLE sessions_v2 RENAME TO sessions;");
    DATABASE.exec("INSERT OR IGNORE INTO diners(id,canteen_id,name,class_name,diner_number,type) SELECT 1,1,'Adam Novák','6. B','legacy-1','pupil' WHERE EXISTS (SELECT 1 FROM users LIMIT 1)");
    DATABASE.exec("INSERT OR IGNORE INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) SELECT 1,id,1,'self',unixepoch()*1000 FROM users WHERE role='pupil'; INSERT OR IGNORE INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) SELECT 1,id,1,'parent',unixepoch()*1000 FROM users WHERE role='parent'");
    DATABASE.exec("INSERT OR IGNORE INTO selections_v2(diner_id,canteen_id,date,meal_id) SELECT child_id,1,date,meal_id FROM selections WHERE child_id=1; INSERT OR IGNORE INTO preferences_v2(diner_id,canteen_id,text) SELECT child_id,1,text FROM preferences");
    DATABASE.exec("PRAGMA user_version=1");
    DATABASE.exec("CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(lower(email)) WHERE email IS NOT NULL");
    DATABASE.exec("COMMIT");
  } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
  }
  if (VERSION < 2) {
    DATABASE.exec("PRAGMA foreign_keys=OFF; PRAGMA legacy_alter_table=ON; BEGIN IMMEDIATE");
    try {
      DATABASE.exec(`ALTER TABLE meals RENAME TO meals_before_tenant_key;
        CREATE TABLE meals (id INTEGER PRIMARY KEY, date TEXT, slot INTEGER, name TEXT, side TEXT, icon TEXT, category TEXT, allergens TEXT, ingredients TEXT, soup TEXT, canteen_id INTEGER NOT NULL REFERENCES canteens(id), UNIQUE(canteen_id,date,slot));
        INSERT INTO meals(id,date,slot,name,side,icon,category,allergens,ingredients,soup,canteen_id) SELECT id,date,slot,name,side,icon,category,allergens,ingredients,soup,canteen_id FROM meals_before_tenant_key;
        DROP TABLE meals_before_tenant_key; PRAGMA user_version=2; COMMIT;`);
    } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
    finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
  }
}
migrate();
if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
export type SessionUser = User & { role: Role; canteenId: number; dinerId: number | null; roles: Role[] };
export function getUser(token?: string): SessionUser | null {
  if (!token) return null;
  const ROW = DATABASE.prepare(`SELECT u.id,u.name,u.username,u.email,s.active_role AS role,s.canteen_id AS canteenId,s.diner_id AS dinerId,
    (SELECT group_concat(role, ',') FROM user_roles WHERE user_id=u.id AND canteen_id=s.canteen_id) AS roleList
    FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires>? AND u.deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id=u.id AND r.canteen_id=s.canteen_id AND r.role=s.active_role)
    AND (s.active_role NOT IN ('parent','pupil','adult') OR EXISTS (SELECT 1 FROM diner_links l JOIN diners d ON d.id=l.diner_id WHERE l.user_id=u.id AND l.canteen_id=s.canteen_id AND d.id=s.diner_id AND d.canteen_id=s.canteen_id AND (d.archived_at IS NULL OR d.archived_at>?)))`).get(hashToken(token), Date.now(), Date.now()-30*86400000) as {id:number;name:string;username:string|null;email:string|null;role:Role;canteenId:number;dinerId:number|null;roleList:string}|undefined;
  if (!ROW) return null;
  return { id:ROW.id,name:ROW.name,username:ROW.username || "",email:ROW.email,role:ROW.role,canteenId:ROW.canteenId,dinerId:ROW.dinerId,roles:ROW.roleList?.split(",") as Role[] || [] };
}
export function getData(user: SessionUser | null): AppData {
  const CANteen_ID = user?.canteenId || 1;
  const DINER_ID = user?.dinerId;
  const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
  const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
  const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
  const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
  const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
  const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
  const AUDIT_LOG = user?.roles.includes("manager") ? DATABASE.prepare("SELECT id,action,reason,created_at AS createdAt FROM audit_log WHERE canteen_id=? ORDER BY id DESC LIMIT 100").all(CANteen_ID) as AppData["auditLog"] : [];
  const MANAGED_DINERS = user?.roles.includes("manager") ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.diner_number AS dinerNumber,d.type,d.archived_at AS archivedAt,COALESCE((SELECT group_concat(u.id||':'||u.name,'|') FROM diner_links l JOIN users u ON u.id=l.user_id WHERE l.diner_id=d.id AND l.canteen_id=d.canteen_id AND l.relationship='parent'),'') AS parentLinks FROM diners d WHERE d.canteen_id=? ORDER BY d.name").all(CANteen_ID) as AppData["managedDiners"] : [];
  const MANAGED_PEOPLE = user?.roles.includes("manager") ? DATABASE.prepare("SELECT u.id,u.name,u.email,group_concat(r.role, ',') AS role_list FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.canteen_id=? AND u.deleted_at IS NULL GROUP BY u.id,u.name,u.email ORDER BY u.name").all(CANteen_ID).map((row)=>{const ITEM=row as {id:number;name:string;email:string|null;role_list:string};return {id:ITEM.id,name:ITEM.name,email:ITEM.email,roles:ITEM.role_list.split(",") as Role[]};}) : [];
  const PREFERENCES_LIST = user?.roles.some((role)=>role === "staff" || role === "manager") ? DATABASE.prepare("SELECT d.name AS dinerName,p.text FROM preferences_v2 p JOIN diners d ON d.id=p.diner_id WHERE p.canteen_id=? AND p.text<>'' ORDER BY d.name").all(CANteen_ID) as AppData["preferencesList"] : [];
  const MEALS = DATABASE.prepare("SELECT * FROM meals WHERE canteen_id=? ORDER BY date,slot").all(CANteen_ID).map((row)=>({...row})) as Meal[];
  const OPERATING_DATES = [...new Set(MEALS.map((meal) => meal.date))];
  return { isDemoMode:process.env.IS_DEMO_MODE === "true", user: user ? {id:user.id,name:user.name,role:user.role,username:user.username,email:user.email} : null, roles:ROLES, activeDinerId:DINER_ID || null, canteens:USER_CANTEENS, activeCanteenId:user?.canteenId || null, auditLog:AUDIT_LOG, managedDiners:MANAGED_DINERS, managedPeople:MANAGED_PEOPLE, diners:DINERS, meals:MEALS, recipeVersions:[], selections:Object.fromEntries(SELECTIONS.map((row)=>[row.date,row.meal_id])), feedback:FEEDBACK as AppData["feedback"], ideas:IDEAS as AppData["ideas"], preferences:user && DINER_ID ? String((DATABASE.prepare("SELECT text FROM preferences_v2 WHERE diner_id=? AND canteen_id=?").get(DINER_ID,CANteen_ID) as {text?:string}|undefined)?.text || "") : "", preferencesList:PREFERENCES_LIST, weeks:["2026-09-21","2026-09-28","2026-10-05"], operatingDates: OPERATING_DATES };
}
import type { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";
const MENU = [
  [
    "Pečená ryba na zelenině",
    "Vařené brambory",
    "fish",
    "Ryba",
    "4, 7, 9",
    "Ryba, mrkev, celer, máslo, brambory",
  ],
  [
    "Špagety s rajčatovou omáčkou",
    "Sypané parmazánem",
    "pasta",
    "Bez masa",
    "1, 7",
    "Špagety, rajčata, cibule, parmazán",
  ],
  [
    "Kuřecí kousky na kari",
    "Rýže basmati",
    "chicken",
    "Drůbež",
    "1, 7",
    "Kuřecí maso, rýže, smetana, mouka, kari",
  ],
  [
    "Kapustové placičky",
    "Bramborová kaše",
    "greens",
    "Bez masa",
    "1, 3, 7",
    "Kapusta, mouka, vejce, mléko, brambory",
  ],
  [
    "Rajská s masovými kuličkami",
    "Těstoviny",
    "meatballs",
    "Maso",
    "1, 3, 7",
    "Mleté maso, vejce, mléko, rajčata, těstoviny",
  ],
  [
    "Zeleninové rizoto",
    "Sypané sýrem",
    "rice",
    "Bez masa",
    "7",
    "Rýže, hrášek, mrkev, kukuřice, sýr",
  ],
  [
    "Kuřecí maso na žampionech",
    "Dvoubarevná rýže",
    "mushroom",
    "Drůbež",
    "1, 7",
    "Kuřecí maso, žampiony, rýže, smetana, mouka",
  ],
  [
    "Čočka na kyselo",
    "Vejce a kyselá okurka",
    "lentils",
    "Bez masa",
    "1, 3",
    "Čočka, cibule, mouka, vejce, okurka",
  ],
  [
    "Kuskus s tuňákem",
    "Čerstvá zelenina",
    "salad",
    "Ryba",
    "1, 4, 7",
    "Kuskus, tuňák, rajčata, okurka, sýr",
  ],
  [
    "Bramborové dukátky s mákem",
    "Máslo a ovoce",
    "sweet",
    "Sladké",
    "1, 3, 7",
    "Brambory, mouka, vejce, mák, máslo, jablko",
  ],
];
const SOUPS = [
  "Brokolicový krém",
  "Bramborová s pohankou",
  "Polévka z červené řepy",
  "Zeleninová s knedlíčky",
  "Hrachová polévka",
];
export function seedDemo(database: DatabaseSync) {
  const PASSWORD = (value: string) => { const SALT=randomBytes(16).toString("hex"); return `scrypt$${SALT}$${scryptSync(value,SALT,64).toString("hex")}`; };
  const EXISTING = database.prepare("SELECT id FROM users WHERE username='adam'").get() as {id:number}|undefined;
  if (!EXISTING) database.prepare("INSERT INTO users(name,role,username,password_hash,created_at) VALUES (?, 'pupil','adam',?,?), (?, 'manager','jidelna',?,?), (?, 'parent','petra',?,?)")
    .run("Adam Novák",PASSWORD("adam123"),Date.now(),"Jana Veselá",PASSWORD("jidelna123"),Date.now(),"Petra Nováková",PASSWORD("petra123"),Date.now());
  const EXISTING_DEMO_MANAGER=database.prepare("SELECT id FROM users WHERE username='admin'").get();
  if (!EXISTING_DEMO_MANAGER) database.prepare("INSERT INTO users(name,role,username,password_hash,created_at) VALUES('Vedoucí jídelny','manager','admin',?,?)").run(PASSWORD("admin"),Date.now());
  for (const [USERNAME,PLAIN] of [["adam","adam123"],["jidelna","jidelna123"],["petra","petra123"]]) {
    const USER = database.prepare("SELECT id FROM users WHERE username=?").get(USERNAME) as {id:number}|undefined;
    if (USER) database.prepare("UPDATE users SET password_hash=COALESCE(password_hash,?) WHERE id=?").run(PASSWORD(PLAIN),USER.id);
  }
  const USER_IDS = Object.fromEntries(["adam","jidelna","petra","admin"].map((name) => [name,(database.prepare("SELECT id FROM users WHERE username=?").get(name) as {id:number}|undefined)?.id]));
  for (const [NAME,ROLE] of [["adam","pupil"],["jidelna","manager"],["jidelna","staff"],["petra","parent"],["admin","manager"],["admin","staff"]]) if (USER_IDS[NAME] && (NAME !== "admin" || !EXISTING_DEMO_MANAGER)) database.prepare("INSERT OR IGNORE INTO user_roles(user_id,canteen_id,role) VALUES(?,1,?)").run(USER_IDS[NAME],ROLE);
  database.prepare("INSERT OR IGNORE INTO diners(id,canteen_id,name,class_name,diner_number,type) VALUES(1,1,'Adam Novák','6. B','demo-1','pupil')").run();
  database.prepare("INSERT OR IGNORE INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) VALUES(1,?,1,'self',?),(1,?,1,'parent',?)").run(Number(USER_IDS.adam),Date.now(),Number(USER_IDS.petra),Date.now());
  if (database.prepare("SELECT id FROM meals LIMIT 1").get()) return;
  const INSERT = database.prepare(
    "INSERT INTO meals (date, slot, name, side, icon, category, allergens, ingredients, soup, canteen_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)",
  );
  for (let week = 0; week < 3; week++) {
    for (let day = 0; day < 5; day++) {
      const DATE = new Date(Date.UTC(2026, 8, 21 + week * 7 + day))
        .toISOString()
        .slice(0, 10);
      if (DATE === "2026-09-28") continue;
      for (let slot = 0; slot < 2; slot++) {
        const MEAL = MENU[((day + week) % 5) * 2 + slot];
        INSERT.run(DATE, slot + 1, ...MEAL, SOUPS[day]);
      }
    }
  }
  database
    .prepare(
      "INSERT INTO ideas (user_id, text, status, response, canteen_id) VALUES (3, ?, ?, ?, 1)",
    )
    .run(
      "Mohly by být špagety s rajčatovou omáčkou?",
      "Přijato",
      "Zařadili jsme je v pondělí 21. září jako alternativu. Parmazán podáváme zvlášť.",
    );
  database
    .prepare(
      "INSERT INTO feedback (user_id, meal_id, rating, comment, canteen_id) VALUES (1, 1, 4, ?, 1)",
    )
    .run("Brambory byly dobré, příště bych si dal víc zeleniny.");
}

codex
The current flow confirms ideas by immediately overwriting a dated menu row, while the preview is a client-side keyword match. It does not currently calculate a candidate week, preserve an audit record, model manager locks, or send an idea response by email. I’m checking the existing basket and recipe data shapes now so the proposal can clearly distinguish real calculations from the parts this starter still lacks.
exec
/bin/zsh -lc "cat lib/email.ts && sed -n '1,260p' lib/consumer-basket.ts && sed -n '1,220p' lib/basket-rules.ts && sed -n '1,150p' components/consumer-basket-panel.tsx && sed -n '1,160p' app/api/action/route.ts" in /Users/hejny/work/workshops/workshop-boilerplate
 succeeded in 0ms:
export type EmailMessage = { to: string; subject: string; text: string };
export interface EmailTransport { send(message: EmailMessage): Promise<void> }
class ConsoleEmailTransport implements EmailTransport {
  async send(message: EmailMessage): Promise<void> {
    console.info(`[email] To: ${message.to}\nSubject: ${message.subject}\n${message.text}`);
  }
}
class WebhookEmailTransport implements EmailTransport {
  constructor(private readonly endpoint: string, private readonly token: string) {}
  async send(message: EmailMessage): Promise<void> {
    const RESPONSE=await fetch(this.endpoint,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.token}`},body:JSON.stringify(message)});
    if(!RESPONSE.ok)throw new Error("Email delivery failed.");
  }
}
function getEmailTransport(): EmailTransport {
  const ENDPOINT=process.env.EMAIL_WEBHOOK_URL, TOKEN=process.env.EMAIL_WEBHOOK_TOKEN;
  if(ENDPOINT&&TOKEN)return new WebhookEmailTransport(ENDPOINT,TOKEN);
  if(process.env.NODE_ENV!=="production")return new ConsoleEmailTransport();
  throw new Error("Production email transport is not configured.");
}
export async function sendEmail(message: EmailMessage): Promise<void> { await getEmailTransport().send(message); }
import type {
  BasketGroupId, BasketGroupResult, BasketMenuItem, BasketPeriodResult,
  BasketRuleSet, BasketTarget,
} from "./types";

export const ESTIMATE_SHARE_THRESHOLD = 0.1;
export const BASKET_START_DATE = "2026-09-01";
export const CHOICE_MENU_READINGS = ["all-offered", "selected-meals"] as const;
export type ChoiceMenuReading = (typeof CHOICE_MENU_READINGS)[number];

const GROUP_IDS: BasketGroupId[] = ["meat", "fish", "dairy", "freeFat", "freeSugar", "produce", "potato", "wholeGrain", "legume", "egg"];

function getTarget(ruleSet: BasketRuleSet, ageCategory: string, groupId: BasketGroupId): BasketTarget | null {
  return ruleSet.ageCategoryTargets[ageCategory]?.[groupId] ?? null;
}

function getBounds(target: BasketTarget | null) {
  if (!target || target.amountGramsPerDinerDay === null) return { targetGrams: null, minimumGrams: null, maximumGrams: null };
  const targetGrams = target.amountGramsPerDinerDay;
  return {
    targetGrams,
    minimumGrams: target.minimumPercent === null ? null : targetGrams * target.minimumPercent / 100,
    maximumGrams: target.maximumPercent === null ? null : targetGrams * target.maximumPercent / 100,
  };
}

function calculateGroup(
  groupId: BasketGroupId,
  items: BasketMenuItem[],
  ruleSet: BasketRuleSet,
  ageCategory: string,
  operatingDays: number,
): BasketGroupResult {
  let amountGrams = 0;
  let estimatedGrams = 0;
  let isMissingAmount = false;
  const contributingMeals = new Map<number, BasketGroupResult["contributingMeals"][number]>();

  for (const item of items) {
    if (!item.isOperatingDay || !item.recipeVersion) {
      continue;
    }
    let isGroupRecipeCovered = false;
    for (const ingredient of item.recipeVersion.ingredients) {
      const mapping = ruleSet.ingredientMappings[ingredient.ingredientId];
      if (!mapping || mapping.groupId !== groupId) continue;
      isGroupRecipeCovered = true;
      if (ingredient.amountGrams === null || mapping.coefficient === null) {
        isMissingAmount = true;
        continue;
      }
      const contribution = ingredient.amountGrams * mapping.coefficient * item.servings;
      const existing = contributingMeals.get(item.meal.id);
      amountGrams += contribution;
      if (ingredient.isEstimate) estimatedGrams += contribution;
      contributingMeals.set(item.meal.id, {
        mealId: item.meal.id,
        name: item.meal.name,
        amountGrams: (existing?.amountGrams ?? 0) + contribution,
        isEstimate: (existing?.isEstimate ?? false) || ingredient.isEstimate,
      });
    }
    if (!isGroupRecipeCovered) isMissingAmount = true;
  }

  const TARGET = getTarget(ruleSet, ageCategory, groupId);
  const BOUNDS = getBounds(TARGET);
  const normalizedAmountGrams = operatingDays > 0 ? amountGrams / operatingDays : 0;
  const normalizedEstimatedGrams = operatingDays > 0 ? estimatedGrams / operatingDays : 0;
  const estimateShare = normalizedAmountGrams === 0 ? 0 : normalizedEstimatedGrams / normalizedAmountGrams;
  const isEstimate = estimateShare > ESTIMATE_SHARE_THRESHOLD;
  let status: BasketGroupResult["status"] = "ok";
  if (!TARGET || BOUNDS.targetGrams === null || isMissingAmount || operatingDays === 0) status = "missingData";
  else if (BOUNDS.minimumGrams !== null && normalizedAmountGrams < BOUNDS.minimumGrams) status = "under";
  else if (BOUNDS.maximumGrams !== null && normalizedAmountGrams > BOUNDS.maximumGrams) status = "over";
  return {
    groupId, label: ruleSet.groupLabels[groupId], amountGrams: normalizedAmountGrams,
    ...BOUNDS, status, isEstimate, estimateShare,
    contributingMeals: [...contributingMeals.values()],
  };
}

export function calculateConsumerBasket(input: {
  items: BasketMenuItem[];
  ageCategory: string;
  ruleSet: BasketRuleSet;
  period: "week" | "month";
  operatingDayCount: number;
}): BasketPeriodResult {
  const { items, ageCategory, ruleSet, period, operatingDayCount } = input;
  return {
    ruleSetId: ruleSet.id,
    ruleSetName: ruleSet.name,
    period,
    groups: GROUP_IDS.map((groupId) => calculateGroup(groupId, items, ruleSet, ageCategory, operatingDayCount)),
  };
}

export function getBasketStatusLabel(status: BasketGroupResult["status"], isEstimate: boolean) {
  const LABELS = { ok: "v limitu", under: "pod limitem", over: "nad limitem", missingData: "chybí v pravidlech nebo receptuře" };
  return `${LABELS[status]}${isEstimate ? " · odhad" : ""}`;
}

export function getChoiceMenuItems(items: BasketMenuItem[], reading: ChoiceMenuReading): BasketMenuItem[] {
  if (reading === "all-offered") return items;
  const selected = new Map<string, BasketMenuItem>();
  for (const item of items) {
    if (item.meal.slot === 1) selected.set(item.meal.date, item);
    else if (item.meal.slot === 2 && !selected.has(item.meal.date)) selected.set(item.meal.date, item);
  }
  return [...selected.values()];
}
import type { BasketGroupId, BasketRuleSet, BasketTarget } from "./types";

const GROUP_LABELS: Record<BasketGroupId, string> = {
  meat: "Maso",
  fish: "Ryby, korýši, měkkýši",
  dairy: "Mléko a mléčné výrobky",
  freeFat: "Tuky volné",
  freeSugar: "Cukry volné",
  produce: "Zelenina a ovoce",
  potato: "Brambory a ostatní hlízy",
  wholeGrain: "Celozrnné obiloviny a pseudoobiloviny",
  legume: "Luštěniny",
  egg: "Vejce",
};

const LEGACY_TARGETS: Record<string, Record<string, number>> = {
  "3-6": { meat: 55, fish: 10, dairy: 331, freeFat: 17, freeSugar: 20, produce: 220, potato: 90, legume: 10 },
  "7-10": { meat: 64, fish: 10, dairy: 74, freeFat: 12, freeSugar: 13, produce: 150, potato: 140, legume: 10 },
  "11-14": { meat: 70, fish: 10, dairy: 87, freeFat: 15, freeSugar: 16, produce: 170, potato: 160, legume: 10 },
  "15+": { meat: 75, fish: 10, dairy: 109, freeFat: 17, freeSugar: 16, produce: 190, potato: 170, legume: 10 },
};

const REGULAR_TARGETS: Record<string, Record<string, number>> = {
  "2-3-lunch": { meat: 26, fish: 6, dairy: 44, freeFat: 7, freeSugar: 6, produce: 94, potato: 53, wholeGrain: 11, legume: 7 },
  "4-6-lunch": { meat: 39, fish: 9, dairy: 67, freeFat: 10, freeSugar: 8, produce: 140, potato: 79, wholeGrain: 14, legume: 9 },
  "7-10-lunch": { meat: 46, fish: 11, dairy: 78, freeFat: 12, freeSugar: 10, produce: 162, potato: 92, wholeGrain: 17, legume: 11 },
  "11-14-lunch": { meat: 52, fish: 13, dairy: 89, freeFat: 13, freeSugar: 11, produce: 187, potato: 106, wholeGrain: 20, legume: 13 },
  "15+-lunch": { meat: 65, fish: 16, dairy: 111, freeFat: 17, freeSugar: 14, produce: 233, potato: 132, wholeGrain: 25, legume: 15 },
};

const FLEXIBLE_TARGETS: Record<string, Record<string, number>> = {
  "2-3-lunch": { meat: 9, fish: 20, legume: 20, dairy: 30, freeFat: 7, freeSugar: 6, produce: 94, potato: 22, wholeGrain: 10 },
  "4-6-lunch": { meat: 13, fish: 30, legume: 30, dairy: 45, freeFat: 10, freeSugar: 8, produce: 140, potato: 33, wholeGrain: 15 },
  "7-10-lunch": { meat: 15, fish: 35, legume: 35, dairy: 53, freeFat: 12, freeSugar: 10, produce: 162, potato: 39, wholeGrain: 18 },
  "11-14-lunch": { meat: 18, fish: 40, legume: 40, dairy: 60, freeFat: 13, freeSugar: 11, produce: 187, potato: 45, wholeGrain: 20 },
  "15+-lunch": { meat: 23, fish: 50, legume: 50, dairy: 75, freeFat: 17, freeSugar: 14, produce: 233, potato: 55, wholeGrain: 25 },
};

function targetsFor(values: Record<string, number>, page: number, isLegacy: boolean, isFlexible: boolean): Partial<Record<BasketGroupId, BasketTarget>> {
  return Object.fromEntries(Object.entries(GROUP_LABELS).map(([groupId]) => {
    const value = values[groupId];
    const minimumPercent = groupId === "freeSugar" ? 0 : isFlexible && ["meat", "fish"].includes(groupId) ? 0 : isLegacy ? 75 : 75;
    const maximumPercent = ["freeFat", "freeSugar"].includes(groupId) ? 100 : ["fish", "produce", "legume", "wholeGrain"].includes(groupId) ? null : 125;
    return [groupId, {
      amountGramsPerDinerDay: value ?? null,
      minimumPercent: value === undefined ? null : minimumPercent,
      maximumPercent: value === undefined ? null : maximumPercent,
      sourcePage: value === undefined ? null : page,
    } satisfies BasketTarget];
  })) as Partial<Record<BasketGroupId, BasketTarget>>;
}

const LEGACY_INGREDIENTS: BasketRuleSet["ingredientMappings"] = {
  meat: { groupId: "meat", coefficient: 1, sourcePage: 7 },
  fish: { groupId: "fish", coefficient: 1, sourcePage: 7 },
  "liquid-milk": { groupId: "dairy", coefficient: 1, sourcePage: 7 },
  "milk-powder": { groupId: "dairy", coefficient: 10, sourcePage: 7 },
  butter: { groupId: "freeFat", coefficient: 0.8, sourcePage: 7 },
  oil: { groupId: "freeFat", coefficient: 1, sourcePage: 7 },
  sugar: { groupId: "freeSugar", coefficient: 1, sourcePage: 7 },
  honey: { groupId: "freeSugar", coefficient: 0.8, sourcePage: 7 },
  vegetables: { groupId: "produce", coefficient: 1.42, sourcePage: 7 },
  fruit: { groupId: "produce", coefficient: 1, sourcePage: 7 },
  "sterilized-vegetables": { groupId: "produce", coefficient: 1.42, sourcePage: 7 },
  "dried-vegetables": { groupId: "produce", coefficient: 10, sourcePage: 7 },
  potatoes: { groupId: "potato", coefficient: 1, sourcePage: 7 },
  legumes: { groupId: "legume", coefficient: 1, sourcePage: 7 },
};

const CLEAN_INGREDIENTS: BasketRuleSet["ingredientMappings"] = {
  meat: { groupId: "meat", coefficient: 1, sourcePage: 11 },
  fish: { groupId: "fish", coefficient: 1, sourcePage: 11 },
  "liquid-milk": { groupId: "dairy", coefficient: 1, sourcePage: 11 },
  "milk-powder": { groupId: "dairy", coefficient: 10, sourcePage: 11 },
  butter: { groupId: "freeFat", coefficient: 0.8, sourcePage: 12 },
  oil: { groupId: "freeFat", coefficient: 1, sourcePage: 12 },
  "frying-oil": { groupId: "freeFat", coefficient: 0.15, sourcePage: 12 },
  sugar: { groupId: "freeSugar", coefficient: 1, sourcePage: 12 },
  honey: { groupId: "freeSugar", coefficient: 0.8, sourcePage: 12 },
  vegetables: { groupId: "produce", coefficient: 1, sourcePage: 13 },
  fruit: { groupId: "produce", coefficient: 1, sourcePage: 13 },
  "sterilized-vegetables": { groupId: "produce", coefficient: 1, sourcePage: 13 },
  potatoes: { groupId: "potato", coefficient: 1, sourcePage: 14 },
  "whole-grain": { groupId: "wholeGrain", coefficient: 1, sourcePage: 14 },
  legumes: { groupId: "legume", coefficient: 1, sourcePage: 15 },
  "canned-legumes": { groupId: "legume", coefficient: 0.4, sourcePage: 15 },
  tofu: { groupId: "legume", coefficient: 0.3, sourcePage: 15 },
};

function buildTargets(targets: Record<string, Record<string, number>>, page: number, isLegacy: boolean, isFlexible: boolean) {
  return Object.fromEntries(Object.entries(targets).map(([age, values]) => [age, targetsFor(values, page, isLegacy, isFlexible)]));
}

export const BASKET_RULE_SETS: BasketRuleSet[] = [
  {
    id: "decree-2021",
    name: "Vyhláška 107/2005 Sb. · příloha 1 (2021)",
    validFrom: "2021-09-01", validTo: "2026-08-31",
    sourceDocument: "docs/vyhlaska_starsi_verze_k_diff_pravidel_107-2005-1.9.2021.pdf",
    measureBasis: "purchased", ageCategoryTargets: buildTargets(Object.fromEntries(Object.entries(LEGACY_TARGETS).map(([age, targets]) => [age, { ...targets, ...(targets.dairy ? { dairy: targets.dairy } : {}) }])), 6, true, false),
    groupLabels: GROUP_LABELS, ingredientMappings: LEGACY_INGREDIENTS,
  },
  {
    id: "decree-2025-regular",
    name: "Vyhláška 107/2005 Sb. · běžná výživa (2025)",
    validFrom: "2025-09-01", validTo: null,
    sourceDocument: "docs/vyhlaska_107-2005-1.9.2025.pdf",
    measureBasis: "clean", ageCategoryTargets: buildTargets(REGULAR_TARGETS, 9, false, false),
    groupLabels: GROUP_LABELS, ingredientMappings: CLEAN_INGREDIENTS,
  },
  {
    id: "decree-2025-flexible",
    name: "Vyhláška 107/2005 Sb. · flexibilní výživové normy (2025)",
    validFrom: "2025-09-01", validTo: null,
    sourceDocument: "docs/vyhlaska_107-2005-1.9.2025.pdf",
    measureBasis: "clean", ageCategoryTargets: buildTargets(FLEXIBLE_TARGETS, 22, false, true),
    groupLabels: GROUP_LABELS, ingredientMappings: CLEAN_INGREDIENTS,
  },
];

export function getDefaultRuleSet(menuDate: string) {
  return BASKET_RULE_SETS.filter((ruleSet) => ruleSet.id !== "decree-2025-flexible")
    .find((ruleSet) => ruleSet.validFrom <= menuDate && (ruleSet.validTo === null || ruleSet.validTo >= menuDate))
    ?? BASKET_RULE_SETS[0];
}
"use client";
import { useMemo, useState } from "react";
import { calculateConsumerBasket, getBasketStatusLabel, getChoiceMenuItems } from "@/lib/consumer-basket";
import { BASKET_RULE_SETS, getDefaultRuleSet } from "@/lib/basket-rules";
import type { AppData, BasketMenuItem, BasketRuleSet, BasketPeriodResult } from "@/lib/types";

function getMonthStart(date: string) { return `${date.slice(0, 7)}-01`; }
function getMonthDates(date: string) {
  const start = getMonthStart(date);
  const count = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0)).getUTCDate();
  return Array.from({ length: count }, (_, index) => `${start.slice(0, 8)}${String(index + 1).padStart(2, "0")}`);
}
function asMenuItems(data: AppData, meals: AppData["meals"]): BasketMenuItem[] {
  return meals.map((meal) => ({
    meal,
    recipeVersion: data.recipeVersions.find((version) => version.id === meal.recipeVersionId) ?? null,
    servings: 1,
    isOperatingDay: true,
  }));
}
function countOperatingDays(data: AppData, dates: string[]) {
  return data.operatingDates.filter((date) => dates.includes(date)).length;
}
function getRemainingDates(data: AppData, weekDates: string[], monthDates: string[]) {
  const weekSet = new Set(weekDates);
  const lastVisibleDay = weekDates.at(-1) ?? "";
  return data.operatingDates.filter((date) => monthDates.includes(date) && !weekSet.has(date) && date > lastVisibleDay);
}
function getAgeCategory(data: AppData) {
  const diner = data.diners.find((item) => item.id === data.activeDinerId);
  if (diner?.type === "adult") return "15+";
  return "7-10";
}
function addMonthAge(category: string, suffix: string) { return category === "7-10" || category === "15+" ? `${category}${suffix}` : category; }
function displayAmount(value: number) { return `${Math.round(value).toLocaleString("cs-CZ")} g`; }

function RuleSetComparison({ data, monthMeals, monthDates, ageCategory, ruleSet }: {
  data: AppData; monthMeals: AppData["meals"]; monthDates: string[]; ageCategory: string; ruleSet: BasketRuleSet;
}) {
  const monthResult = calculateConsumerBasket({
    items: getChoiceMenuItems(asMenuItems(data, monthMeals), "all-offered"),
    ageCategory: addMonthAge(ageCategory, "-lunch"), ruleSet, period: "month", operatingDayCount: countOperatingDays(data, monthDates),
  });
  return <span>{monthResult.groups.filter((group) => group.status !== "ok").length} skupin mimo limit nebo s chybějícími údaji</span>;
}

export function ConsumerBasketPanel({ data, weekDates }: { data: AppData; weekDates: string[] }) {
  const [ruleSetId, setRuleSetId] = useState<string | null>(null);
  const [isMonthMode, setIsMonthMode] = useState(false);
  const [isSelectedMealReading, setIsSelectedMealReading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const startRule = getDefaultRuleSet(weekDates[0]);
  const ruleSet = BASKET_RULE_SETS.find((item) => item.id === ruleSetId) ?? startRule;
  const monthDates = getMonthDates(weekDates[0]);
  const remainingDates = getRemainingDates(data, weekDates, monthDates);
  const monthMeals = data.meals.filter((meal) => monthDates.includes(meal.date));
  const rangeDates = isMonthMode ? monthDates : weekDates;
  const rangeMeals = data.meals.filter((meal) => rangeDates.includes(meal.date));
  const AGE = getAgeCategory(data);
  const READING = isSelectedMealReading ? "selected-meals" : "all-offered";
  const menuItems = useMemo(() => getChoiceMenuItems(asMenuItems(data, rangeMeals), READING), [data, rangeMeals, READING]);
  const result = calculateConsumerBasket({
    items: menuItems, ageCategory: addMonthAge(AGE, "-lunch"), ruleSet,
    period: isMonthMode ? "month" : "week", operatingDayCount: countOperatingDays(data, rangeDates),
  });
  const restDays = remainingDates.length;
  const selectedGroup = result.groups.find((group) => group.groupId === selectedGroupId);
  const allOfferedResult = calculateConsumerBasket({
    items: getChoiceMenuItems(asMenuItems(data, rangeMeals), "all-offered"),
    ageCategory: addMonthAge(AGE, "-lunch"), ruleSet, period: isMonthMode ? "month" : "week",
    operatingDayCount: countOperatingDays(data, rangeDates),
  });
  const selectedMealsResult = calculateConsumerBasket({
    items: getChoiceMenuItems(asMenuItems(data, rangeMeals), "selected-meals"),
    ageCategory: addMonthAge(AGE, "-lunch"), ruleSet, period: isMonthMode ? "month" : "week",
    operatingDayCount: countOperatingDays(data, rangeDates),
  });
  const periodLabel = isMonthMode ? "Měsíc" : "Týden";

  return <section className="consumer-basket" aria-label="Spotřební koš">
    <div className="basket-heading">
      <div><h2>Spotřební koš</h2><strong>{ruleSet.name}</strong></div>
      <label>Pravidla<select aria-label="Sada pravidel" value={ruleSet.id} onChange={(event) => setRuleSetId(event.target.value)}>
        {BASKET_RULE_SETS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
    </div>
    <div className="basket-controls">
      <div className="basket-period-switch"><button aria-pressed={!isMonthMode} onClick={() => setIsMonthMode(false)}>Týden</button><button aria-pressed={isMonthMode} onClick={() => setIsMonthMode(true)}>Měsíc</button></div>
      <label className="basket-choice-reading"><input type="checkbox" checked={isSelectedMealReading} onChange={(event) => setIsSelectedMealReading(event.target.checked)} /> Zobrazit jen vybraný chod v hlavním přehledu</label>
    </div>
    <p className="basket-interpretation">Vyhláška požaduje zachovat plnění normy při nabídce jídel na výběr, neurčuje však, zda evidovat celý objem výroby, nebo odebrané porce. Vedle sebe jsou dostupné obě čtení.</p>
    {!isMonthMode && <p className="basket-month-context">Měsíc zatím: <RuleSetComparison data={data} monthMeals={monthMeals} monthDates={monthDates} ageCategory={AGE} ruleSet={ruleSet} /> · Zbývá {restDays} provozních dnů.</p>}
    <div className="basket-groups">{result.groups.map((group) => <button className="basket-group" key={group.groupId} onClick={() => setSelectedGroupId(selectedGroupId === group.groupId ? null : group.groupId)} aria-expanded={selectedGroupId === group.groupId}>
      <span className="basket-group-title"><strong>{group.label}</strong><small>{getBasketStatusLabel(group.status, group.isEstimate)}</small></span>
      <span className="basket-progress"><i style={{ width: `${Math.max(0, Math.min(100, group.maximumGrams === null ? (group.targetGrams ? group.amountGrams / group.targetGrams * 100 : 0) : group.amountGrams / group.maximumGrams * 100))}%` }} /></span>
      <span className="basket-values">{displayAmount(group.amountGrams)} / {group.targetGrams === null ? "chybí v pravidlech" : displayAmount(group.targetGrams)} {group.minimumGrams !== null && group.maximumGrams !== null && <small>({displayAmount(group.minimumGrams)}–{displayAmount(group.maximumGrams)})</small>}</span>
      <span className="basket-contribution">{periodLabel} přidává hodnotu za {countOperatingDays(data, rangeDates)} provozních dnů</span>
    </button>)}</div>
    {selectedGroup && <ContributionList result={result} group={selectedGroup} />}
    <div className="basket-comparison"><span>Výklad výběrového menu · {periodLabel}</span><div><strong>Všechna nabízená jídla</strong><ChoiceResultSummary result={allOfferedResult} /></div><div><strong>Jídla zvolená strávníky</strong><ChoiceResultSummary result={selectedMealsResult} /></div></div>
    <div className="basket-comparison"><span>Porovnání pravidel pro měsíc</span>{BASKET_RULE_SETS.filter((item) => item.id !== ruleSet.id).map((item) => <div key={item.id}><strong>{item.name}</strong><RuleSetComparison data={data} monthMeals={monthMeals} monthDates={monthDates} ageCategory={AGE} ruleSet={item} /></div>)}</div>
    <p className="basket-data-note">Chybí v pravidlech = cílová hodnota není dostupná pro zvolenou věkovou kategorii. Chybějící gramáže receptur se nezapočítávají.</p>
  </section>;
}

function ChoiceResultSummary({ result }: { result: BasketPeriodResult }) {
  return <span>{result.groups.filter((group) => group.status !== "ok").length} skupin mimo limit nebo s chybějícími údaji</span>;
}

function ContributionList({ result, group }: { result: BasketPeriodResult; group: BasketPeriodResult["groups"][number] }) {
  return <div className="basket-contributors"><h3>{group.label}: příspěvky</h3>{group.contributingMeals.length ? group.contributingMeals.map((meal) => <p key={meal.mealId}>{meal.name} · {displayAmount(meal.amountGrams)}{meal.isEstimate ? " · odhad" : ""}</p>) : <p>Chybí gramáže receptur.</p>}<small>{result.ruleSetName}</small></div>;
}
import { cookies } from "next/headers";
import { DATABASE, getData, getUser } from "@/lib/database";
import { mutate } from "@/lib/mutations";
import { AppError } from "@/src/errors/app-error";
import { createToken, enforceRateLimit, hashPassword, hashToken, verifyPassword } from "@/lib/security";
import type { Role } from "@/lib/types";
import { sendEmail } from "@/lib/email";
import { consumePairingCode, registerParentWithCode } from "@/lib/accounts";
export const runtime = "nodejs";
const SESSION_COOKIE = "stul-session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;
function recordAudit(canteenId: number, actorId: number | null, action: string, subjectId: number | null = null) {
  DATABASE.prepare("INSERT INTO audit_log(canteen_id,actor_user_id,action,subject_id,created_at) VALUES(?,?,?,?,?)").run(canteenId,actorId,action,subjectId,Date.now());
}
async function createSession(userId: number, canteenId: number, role: Role, dinerId: number | null, cookieStore: Awaited<ReturnType<typeof cookies>>, request: Request) {
  const TOKEN = createToken();
  DATABASE.prepare("INSERT INTO sessions(token_hash,user_id,expires,active_role,diner_id,canteen_id) VALUES(?,?,?,?,?,?)").run(hashToken(TOKEN),userId,Date.now()+SESSION_DURATION,role,dinerId,canteenId);
  cookieStore.set(SESSION_COOKIE,TOKEN,{httpOnly:true,sameSite:"lax",secure:new URL(request.url).protocol === "https:",path:"/",maxAge:SESSION_DURATION/1000});
}
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) throw new AppError("Požadavek pochází z jiné stránky.",403);
    const BODY: Record<string,unknown> = await request.json();
    const COOKIE_STORE = await cookies();
    const TOKEN = COOKIE_STORE.get(SESSION_COOKIE)?.value;
    let USER = getUser(TOKEN);
    let ONE_TIME_CODE: string | undefined;
    if (BODY.action === "login") {
      const IDENTIFIER = String(BODY.username || BODY.email || "").trim().toLowerCase();
      enforceRateLimit(DATABASE,`login:${request.headers.get("x-forwarded-for") || "unknown"}:${IDENTIFIER}`);
      const ROW = DATABASE.prepare("SELECT * FROM users WHERE (lower(email)=? OR lower(username)=?) AND deleted_at IS NULL").get(IDENTIFIER,IDENTIFIER) as {id:number;password_hash:string|null}|undefined;
      if (!ROW?.password_hash || !(await verifyPassword(String(BODY.password || ""),ROW.password_hash))) throw new AppError("Nesprávné přihlašovací údaje.",401);
      const MEMBERSHIP = DATABASE.prepare("SELECT canteen_id,role FROM user_roles WHERE user_id=? ORDER BY canteen_id,role LIMIT 1").get(ROW.id) as {canteen_id:number;role:Role}|undefined;
      if (!MEMBERSHIP) throw new AppError("Nesprávné přihlašovací údaje.",401);
      const DINER = DATABASE.prepare("SELECT diner_id FROM diner_links WHERE user_id=? ORDER BY diner_id LIMIT 1").get(ROW.id) as {diner_id:number}|undefined;
      if (TOKEN) DATABASE.prepare("DELETE FROM sessions WHERE token_hash=?").run(hashToken(TOKEN));
      await createSession(ROW.id,MEMBERSHIP.canteen_id,MEMBERSHIP.role,DINER?.diner_id || null,COOKIE_STORE,request);
      recordAudit(MEMBERSHIP.canteen_id,ROW.id,"login");
      USER = getUser(COOKIE_STORE.get(SESSION_COOKIE)?.value);
    } else if (BODY.action === "register") {
      const CREATED = await registerParentWithCode(BODY);
      await createSession(CREATED.userId,CREATED.canteenId,"parent",CREATED.dinerId,COOKIE_STORE,request);
      USER = getUser(COOKIE_STORE.get(SESSION_COOKIE)?.value);
    } else if (BODY.action === "requestReset") {
      enforceRateLimit(DATABASE,`reset:${request.headers.get("x-forwarded-for") || "unknown"}`);
      const EMAIL=String(BODY.email || "").trim().toLowerCase();
      if(EMAIL){const ACCOUNT=DATABASE.prepare("SELECT id,email,(SELECT canteen_id FROM user_roles WHERE user_id=users.id ORDER BY canteen_id LIMIT 1) AS canteen_id FROM users WHERE lower(email)=? AND deleted_at IS NULL").get(EMAIL) as {id:number;email:string;canteen_id:number}|undefined;
        if(ACCOUNT){const RESET_TOKEN=createToken();DATABASE.prepare("INSERT INTO password_resets(user_id,token_hash,expires_at) VALUES(?,?,?)").run(ACCOUNT.id,hashToken(RESET_TOKEN),Date.now()+30*60_000);await sendEmail({to:ACCOUNT.email,subject:"Obnovení hesla · Společný stůl",text:`Odkaz pro obnovu: ${new URL(`/reset?token=${RESET_TOKEN}`,request.url)}`});recordAudit(ACCOUNT.canteen_id||1,ACCOUNT.id,"password_reset_requested");}}
    } else if (BODY.action === "completeReset") {
      enforceRateLimit(DATABASE,`complete-reset:${request.headers.get("x-forwarded-for") || "unknown"}`);
      const RESET_TOKEN=String(BODY.token || ""), PASSWORD=String(BODY.password || "");
      if(PASSWORD.length<12)throw new AppError("Heslo musí mít alespoň 12 znaků.");
      const RESET=DATABASE.prepare("SELECT r.id,r.user_id,u.email,(SELECT canteen_id FROM user_roles WHERE user_id=u.id ORDER BY canteen_id LIMIT 1) AS canteen_id FROM password_resets r JOIN users u ON u.id=r.user_id WHERE r.token_hash=? AND r.expires_at>? AND r.used_at IS NULL AND u.deleted_at IS NULL").get(hashToken(RESET_TOKEN),Date.now()) as {id:number;user_id:number;email:string|null;canteen_id:number}|undefined;
      if(!RESET)throw new AppError("Odkaz nelze použít.");
      DATABASE.prepare("UPDATE password_resets SET used_at=? WHERE id=?").run(Date.now(),RESET.id);DATABASE.prepare("UPDATE users SET password_hash=? WHERE id=?").run(await hashPassword(PASSWORD),RESET.user_id);DATABASE.prepare("DELETE FROM sessions WHERE user_id=?").run(RESET.user_id);recordAudit(RESET.canteen_id||1,RESET.user_id,"password_reset");
    } else if (BODY.action === "acceptInvitation") {
      enforceRateLimit(DATABASE,`invite:${request.headers.get("x-forwarded-for") || "unknown"}`);
      const INVITE=DATABASE.prepare("SELECT id,canteen_id,role,email FROM invitations WHERE token_hash=? AND expires_at>? AND used_at IS NULL").get(hashToken(String(BODY.token || "")),Date.now()) as {id:number;canteen_id:number;role:Role;email:string}|undefined;
      if(!INVITE)throw new AppError("Pozvánku nelze použít.");
      const NAME=String(BODY.name||"").trim(),EMAIL=String(BODY.email||"").trim().toLowerCase(),PASSWORD=String(BODY.password||"");if(!NAME||EMAIL!==INVITE.email||!EMAIL.includes("@")||PASSWORD.length<12)throw new AppError("Zkontrolujte jméno, e-mail a heslo.");
      const RESULT=DATABASE.prepare("INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)").run(NAME,EMAIL,await hashPassword(PASSWORD),Date.now());const USER_ID=Number(RESULT.lastInsertRowid);DATABASE.prepare("INSERT INTO user_roles(user_id,canteen_id,role) VALUES(?,?,?)").run(USER_ID,INVITE.canteen_id,INVITE.role);DATABASE.prepare("UPDATE invitations SET used_at=? WHERE id=?").run(Date.now(),INVITE.id);recordAudit(INVITE.canteen_id,USER_ID,"staff_invited");await createSession(USER_ID,INVITE.canteen_id,INVITE.role,null,COOKIE_STORE,request);USER=getUser(COOKIE_STORE.get(SESSION_COOKIE)?.value);
    } else if (["createPupilLogin","resetPupilPassword","addChild","inviteStaff","regeneratePairing","removeDinerLink","deleteAccount","signOutOtherDevices","grantRole","revokeRole","linkAdultDiner","updateAccount","exportData"].includes(String(BODY.action))) {
      const AUTH_USER=USER;if(!AUTH_USER)throw new AppError("Přihlaste se.",401);
      if(BODY.action==="exportData") {const ACCOUNT=DATABASE.prepare("SELECT name,email,username,created_at AS createdAt FROM users WHERE id=?").get(AUTH_USER.id);const CHILDREN=DATABASE.prepare("SELECT d.name,d.class_name,d.diner_number,p.text AS preferences FROM diner_links l JOIN diners d ON d.id=l.diner_id LEFT JOIN preferences_v2 p ON p.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=?").all(AUTH_USER.id,AUTH_USER.canteenId);const IDEAS=DATABASE.prepare("SELECT text,status,response FROM ideas WHERE user_id=? AND canteen_id=?").all(AUTH_USER.id,AUTH_USER.canteenId);const FEEDBACK=DATABASE.prepare("SELECT meal_id,rating,comment FROM feedback WHERE user_id=? AND canteen_id=?").all(AUTH_USER.id,AUTH_USER.canteenId);return Response.json({account:ACCOUNT,children:CHILDREN,ideas:IDEAS,feedback:FEEDBACK});}
      if(BODY.action==="updateAccount") {const NAME=String(BODY.name||"").trim(),EMAIL=String(BODY.email||"").trim().toLowerCase(),OLD=String(BODY.currentPassword||""),NEW=String(BODY.password||"");const ACCOUNT=DATABASE.prepare("SELECT password_hash FROM users WHERE id=?").get(AUTH_USER.id) as {password_hash:string|null};if(!NAME||(!EMAIL.includes("@")&&EMAIL!==""))throw new AppError("Zkontrolujte jméno a e-mail.");if(NEW&&NEW.length<12)throw new AppError("Nové heslo musí mít alespoň 12 znaků.");if(NEW&&(!ACCOUNT.password_hash||!(await verifyPassword(OLD,ACCOUNT.password_hash))))throw new AppError("Zadejte současné heslo.");DATABASE.prepare("UPDATE users SET name=?,email=?,password_hash=? WHERE id=?").run(NAME,EMAIL||null,NEW?await hashPassword(NEW):ACCOUNT.password_hash,AUTH_USER.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"account_updated");USER=getUser(TOKEN);}
      if(BODY.action==="signOutOtherDevices")DATABASE.prepare("DELETE FROM sessions WHERE user_id=? AND token_hash<>?").run(AUTH_USER.id,hashToken(TOKEN||""));
      if(BODY.action==="deleteAccount") {DATABASE.prepare("UPDATE users SET name='Smazaný uživatel',email=NULL,username=NULL,password_hash=NULL,deleted_at=? WHERE id=?").run(Date.now(),AUTH_USER.id);DATABASE.prepare("DELETE FROM sessions WHERE user_id=?").run(AUTH_USER.id);DATABASE.prepare("DELETE FROM diner_links WHERE user_id=?").run(AUTH_USER.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"account_deleted");COOKIE_STORE.delete(SESSION_COOKIE);USER=null;}
      if(BODY.action==="addChild") {if(AUTH_USER.role!=="parent")throw new AppError("Přístup ke strávníkovi nebyl nalezen.",404);const DINER_ID=consumePairingCode(String(BODY.code||""),AUTH_USER.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"child_linked",DINER_ID);}
      if(BODY.action==="createPupilLogin") {if(!AUTH_USER.roles.includes("parent"))throw new AppError("Strávník nebyl nalezen.",404);const DINER_ID=Number(BODY.dinerId),USERNAME=String(BODY.username||"").trim().toLowerCase(),PASSWORD=String(BODY.password||"");const LINK=DATABASE.prepare("SELECT d.canteen_id FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE d.id=? AND d.canteen_id=? AND l.canteen_id=? AND l.user_id=?").get(DINER_ID,AUTH_USER.canteenId,AUTH_USER.canteenId,AUTH_USER.id) as {canteen_id:number}|undefined;if(!LINK)throw new AppError("Strávník nebyl nalezen.",404);if(!/^[a-z0-9._-]{3,32}$/.test(USERNAME)||PASSWORD.length<12)throw new AppError("Zkontrolujte uživatelské jméno a heslo.");const RESULT=DATABASE.prepare("INSERT INTO users(name,username,password_hash,created_at) SELECT name,?,?,? FROM diners WHERE id=?").run(USERNAME,await hashPassword(PASSWORD),Date.now(),DINER_ID);const PUPIL_ID=Number(RESULT.lastInsertRowid);DATABASE.prepare("INSERT INTO user_roles(user_id,canteen_id,role) VALUES(?,?,'pupil')").run(PUPIL_ID,LINK.canteen_id);DATABASE.prepare("INSERT INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) VALUES(?,?,?,'self',?)").run(DINER_ID,PUPIL_ID,LINK.canteen_id,Date.now());recordAudit(LINK.canteen_id,AUTH_USER.id,"pupil_account_created",DINER_ID);}
      if(BODY.action==="resetPupilPassword") {const DINER_ID=Number(BODY.dinerId),PASSWORD=String(BODY.password||"");if(PASSWORD.length<12)throw new AppError("Heslo musí mít alespoň 12 znaků.");const PUPIL=DATABASE.prepare("SELECT u.id FROM diners d JOIN diner_links parent_link ON parent_link.diner_id=d.id JOIN diner_links pupil_link ON pupil_link.diner_id=d.id AND pupil_link.relationship='self' JOIN users u ON u.id=pupil_link.user_id JOIN user_roles r ON r.user_id=u.id AND r.role='pupil' AND r.canteen_id=d.canteen_id WHERE d.id=? AND d.canteen_id=? AND ((parent_link.user_id=? AND ?='parent') OR ?='manager')").get(DINER_ID,AUTH_USER.canteenId,AUTH_USER.id,AUTH_USER.role,AUTH_USER.role) as {id:number}|undefined;if(!PUPIL)throw new AppError("Strávník nebyl nalezen.",404);DATABASE.prepare("UPDATE users SET password_hash=? WHERE id=?").run(await hashPassword(PASSWORD),PUPIL.id);DATABASE.prepare("DELETE FROM sessions WHERE user_id=?").run(PUPIL.id);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"pupil_password_reset",PUPIL.id);}
      if(BODY.action==="inviteStaff") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Pozvánku může vytvořit pouze vedoucí jídelny.",403);const EMAIL=String(BODY.email||"").trim().toLowerCase();if(!EMAIL.includes("@"))throw new AppError("Zadejte platný e-mail.");const INVITE_TOKEN=createToken(),ROLE:Role="staff";DATABASE.prepare("INSERT INTO invitations(canteen_id,email,token_hash,role,expires_at) VALUES(?,?,?,?,?)").run(AUTH_USER.canteenId,EMAIL,hashToken(INVITE_TOKEN),ROLE,Date.now()+7*86400000);await sendEmail({to:EMAIL,subject:"Pozvánka do jídelny · Společný stůl",text:`Jednorázový odkaz: ${new URL(`/invite?token=${INVITE_TOKEN}`,request.url)}`});recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"staff_invitation_created");}
      if(BODY.action==="regeneratePairing") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Přístup ke strávníkovi nebyl nalezen.",404);const DINER_ID=Number(BODY.dinerId);const DINER=DATABASE.prepare("SELECT id FROM diners WHERE id=? AND canteen_id=?").get(DINER_ID,AUTH_USER.canteenId);if(!DINER)throw new AppError("Strávník nebyl nalezen.",404);ONE_TIME_CODE=createToken();DATABASE.prepare("UPDATE pairing_codes SET revoked_at=? WHERE diner_id=? AND revoked_at IS NULL").run(Date.now(),DINER_ID);DATABASE.prepare("INSERT INTO pairing_codes(diner_id,canteen_id,code_hash,created_at) VALUES(?,?,?,?)").run(DINER_ID,AUTH_USER.canteenId,hashToken(ONE_TIME_CODE),Date.now());recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"pairing_code_regenerated",DINER_ID);}
      if(BODY.action==="removeDinerLink") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Přístup ke strávníkovi nebyl nalezen.",404);const DINER_ID=Number(BODY.dinerId),LINK_USER_ID=Number(BODY.userId),REASON=String(BODY.reason||"").trim();if(REASON.length<3)throw new AppError("Uveďte důvod odebrání propojení.");const RESULT=DATABASE.prepare("DELETE FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=? AND EXISTS(SELECT 1 FROM diners WHERE id=? AND canteen_id=?)").run(DINER_ID,LINK_USER_ID,AUTH_USER.canteenId,DINER_ID,AUTH_USER.canteenId);if(!RESULT.changes)throw new AppError("Propojení nebylo nalezeno.",404);DATABASE.prepare("UPDATE sessions SET diner_id=NULL WHERE user_id=? AND diner_id=?").run(LINK_USER_ID,DINER_ID);DATABASE.prepare("INSERT INTO audit_log(canteen_id,actor_user_id,action,subject_id,reason,created_at) VALUES(?,?,'diner_link_removed',?,?,?)").run(AUTH_USER.canteenId,AUTH_USER.id,DINER_ID,REASON,Date.now());}
      if(BODY.action==="grantRole") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Role může spravovat pouze vedoucí jídelny.",403);const TARGET_ID=Number(BODY.userId),ROLE=String(BODY.role) as Role;if(!["staff","manager","parent","pupil","adult"].includes(ROLE)||!DATABASE.prepare("SELECT id FROM users WHERE id=? AND deleted_at IS NULL").get(TARGET_ID))throw new AppError("Uživatel nebyl nalezen.",404);DATABASE.prepare("INSERT OR IGNORE INTO user_roles(user_id,canteen_id,role) VALUES(?,?,?)").run(TARGET_ID,AUTH_USER.canteenId,ROLE);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"role_granted",TARGET_ID);}
      if(BODY.action==="revokeRole") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Role může spravovat pouze vedoucí jídelny.",403);const TARGET_ID=Number(BODY.userId),ROLE=String(BODY.role) as Role;if(TARGET_ID===AUTH_USER.id&&ROLE==="manager")throw new AppError("Nemůžete odebrat vlastní poslední roli vedoucího.",400);const RESULT=DATABASE.prepare("DELETE FROM user_roles WHERE user_id=? AND canteen_id=? AND role=?").run(TARGET_ID,AUTH_USER.canteenId,ROLE);if(!RESULT.changes)throw new AppError("Role nebyla nalezena.",404);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"role_revoked",TARGET_ID);}
      if(BODY.action==="linkAdultDiner") {if(!AUTH_USER.roles.includes("manager"))throw new AppError("Přístup ke strávníkovi nebyl nalezen.",404);const DINER_ID=Number(BODY.dinerId),TARGET_ID=Number(BODY.userId);if(!DATABASE.prepare("SELECT id FROM diners WHERE id=? AND canteen_id=? AND type='adult'").get(DINER_ID,AUTH_USER.canteenId)||!DATABASE.prepare("SELECT id FROM users WHERE id=? AND EXISTS(SELECT 1 FROM user_roles WHERE user_id=? AND canteen_id=?) AND deleted_at IS NULL").get(TARGET_ID,TARGET_ID,AUTH_USER.canteenId))throw new AppError("Strávník nebo účet nebyl nalezen.",404);DATABASE.prepare("INSERT OR IGNORE INTO user_roles(user_id,canteen_id,role) VALUES(?,?,'adult')").run(TARGET_ID,AUTH_USER.canteenId);DATABASE.prepare("INSERT INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) VALUES(?,?,?,'self',?) ON CONFLICT(diner_id,user_id) DO NOTHING").run(DINER_ID,TARGET_ID,AUTH_USER.canteenId,Date.now());recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"role_granted",TARGET_ID);recordAudit(AUTH_USER.canteenId,AUTH_USER.id,"adult_diner_linked",DINER_ID);}
    } else if (BODY.action === "switchContext") {
      if (!USER) throw new AppError("Přihlaste se.",401);
      const ROLE = BODY.role as Role;
      const CANteen_ID = Number(BODY.canteenId || USER.canteenId);
      let DINER_ID = BODY.dinerId == null ? null : Number(BODY.dinerId);
      const ROLE_EXISTS = DATABASE.prepare("SELECT 1 FROM user_roles WHERE user_id=? AND canteen_id=? AND role=?").get(USER.id,CANteen_ID,ROLE);
      if (!ROLE_EXISTS) throw new AppError("Tento přístup není dostupný.",404);
      if (!DINER_ID && ["parent","pupil","adult"].includes(ROLE)) DINER_ID=(DATABASE.prepare("SELECT d.id FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name LIMIT 1").get(USER.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as {id:number}|undefined)?.id || null;
      if (["parent","pupil","adult"].includes(ROLE) && (!DINER_ID || !DATABASE.prepare("SELECT 1 FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE d.id=? AND d.canteen_id=? AND l.canteen_id=? AND l.user_id=? AND (d.archived_at IS NULL OR d.archived_at>?)").get(DINER_ID,CANteen_ID,CANteen_ID,USER.id,Date.now()-30*86400000))) throw new AppError("Strávník nebyl nalezen.",404);
      DATABASE.prepare("UPDATE sessions SET active_role=?,canteen_id=?,diner_id=? WHERE token_hash=?").run(ROLE,CANteen_ID,DINER_ID,hashToken(TOKEN || ""));
      USER=getUser(TOKEN);
    } else if (BODY.action === "logout") {
      if (TOKEN) DATABASE.prepare("DELETE FROM sessions WHERE token_hash=?").run(hashToken(TOKEN));
      COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
    } else {
      if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
      mutate(USER,BODY);
    }
    return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
  } catch (error) {
    if (error instanceof AppError) return Response.json({error:error.message},{status:error.status});
    console.error(error);
    return Response.json({error:"Změnu se nepodařilo uložit. Zkuste to znovu."},{status:500});
  }
}

exec
/bin/zsh -lc 'npm install @anthropic-ai/sdk' in /Users/hejny/work/workshops/workshop-boilerplate
exec
/bin/zsh -lc "cat src/errors/app-error.ts && cat lib/space-trim.ts && rg -n 'proposal|idea-row|planner-panel' app/globals.css && sed -n '700,820p' app/globals.css" in /Users/hejny/work/workshops/workshop-boilerplate
 exited 1 in 0ms:
import { spaceTrim } from "../../lib/space-trim";
export class AppError extends Error {
  readonly brand = "SpolecnyStulError";
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(spaceTrim(message));
    this.name = "AppError";
  }
}
export function spaceTrim(message: string): string {
  return message
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

exec
/bin/zsh -lc "rg -n 'planner-panel|proposal|idea-row' app/globals.css" in /Users/hejny/work/workshops/workshop-boilerplate
 exited 1 in 0ms:
 succeeded in 5320ms:

added 6 packages, changed 1 package, and audited 1160 packages in 5s

249 packages are looking for funding
  run `npm fund` for details

25 vulnerabilities (14 moderate, 11 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

codex
The repository has a deterministic basket calculator, but idea evaluation cannot honestly certify basket, price, or kitchen fit yet: menu rows have no attached recipe versions at runtime, and price limits and kitchen profiles are absent. I’ll expose those gaps as “chybí údaje” in the proposal and use deterministic catalog matching/slot ranking; Claude will only parse/phrase when configured. The manager approval will retain the proposal metadata and only then update the menu and send the response.
apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/lib/planner.ts
diff --git a/lib/planner.ts b/lib/planner.ts
deleted file mode 100644
index 6aad267a7530ce052669b7d740281dfccb82b2dd..0000000000000000000000000000000000000000
--- a/lib/planner.ts
+++ /dev/null
@@ -1,32 +0,0 @@
-import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
-  return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
-  };
-}

diff --git a/lib/planner.ts b/lib/planner.ts
deleted file mode 100644
index 6aad267a7530ce052669b7d740281dfccb82b2dd..0000000000000000000000000000000000000000
--- a/lib/planner.ts
+++ /dev/null
@@ -1,32 +0,0 @@
-import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
-  return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
-  };
-}

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/lib/planner.ts
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}

diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/lib/types.ts
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

2026-09-23T13:27:49.702703Z ERROR codex_core::tools::router: error=apply_patch verification failed: Failed to find expected lines in /Users/hejny/work/workshops/workshop-boilerplate/lib/database.ts:
    DATABASE.exec("PRAGMA user_version=2");
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

exec
/bin/zsh -lc "rg -n 'VERSION <|user_version|const IDEAS' lib/database.ts" in /Users/hejny/work/workshops/workshop-boilerplate
 succeeded in 0ms:
12:  const VERSION = Number(DATABASE.prepare("PRAGMA user_version").get()?.user_version || 0);
13:  if (VERSION < 1) {
62:    DATABASE.exec("PRAGMA user_version=1");
67:  if (VERSION < 2) {
73:        DROP TABLE meals_before_tenant_key; PRAGMA user_version=2; COMMIT;`);
97:  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));

diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/lib/database.ts
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/components/planner.tsx
diff --git a/components/planner.tsx b/components/planner.tsx
deleted file mode 100644
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..0000000000000000000000000000000000000000
--- a/components/planner.tsx
+++ /dev/null
@@ -1,110 +0,0 @@
-"use client";
-import { useState } from "react";
-import type { AppData } from "@/lib/types";
-import { proposeMeal } from "@/lib/planner";
-import { Button } from "./ui/button";
-import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
-  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
-      </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
-}
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/components/planner.tsx b/components/planner.tsx
deleted file mode 100644
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..0000000000000000000000000000000000000000
--- a/components/planner.tsx
+++ /dev/null
@@ -1,110 +0,0 @@
-"use client";
-import { useState } from "react";
-import type { AppData } from "@/lib/types";
-import { proposeMeal } from "@/lib/planner";
-import { Button } from "./ui/button";
-import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
-  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
-      </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
-}
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/components/planner.tsx
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

2026-09-23T13:28:23.845199Z ERROR codex_core::tools::router: error=apply_patch verification failed: Failed to find expected lines in /Users/hejny/work/workshops/workshop-boilerplate/lib/planner.ts:
function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

exec
/bin/zsh -lc 'npx tsc --noEmit' in /Users/hejny/work/workshops/workshop-boilerplate
 exited 2 in 1435ms:
tests/domain.test.ts(94,16): error TS18047: 'PROPOSAL.meal' is possibly 'null'.
tests/domain.test.ts(106,15): error TS18047: 'PROPOSAL.meal' is possibly 'null'.
tests/domain.test.ts(116,5): error TS18047: 'PROPOSAL.meal' is possibly 'null'.
tests/domain.test.ts(118,61): error TS2339: Property 'isMatch' does not exist on type 'MealProposal'.

diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

exec
/bin/zsh -lc "sed -n '75,135p' tests/domain.test.ts &&" in /Users/hejny/work/workshops/workshop-boilerplate
 succeeded in 0ms:
  });
  assert.equal(
    getData(STAFF).feedback.filter((item) => item.comment === "Chutnalo.")
      .length,
    1,
  );
  mutate(PUPIL, {
    action: "feedback",
    mealId: 1,
    rating: 3,
    comment: "Změna.",
  });
  assert.equal(getData(PUPIL).feedback.length, 1);
});
test("An idea gets a preview and is applied only by staff, with a response", () => {
  mutate(PARENT, { action: "idea", text: "Špagety carbonara" });
  const DATA = getData(STAFF);
  const IDEA = DATA.ideas[0];
  const PROPOSAL = proposeMeal(IDEA.text, DATA.meals);
  assert.equal(PROPOSAL.meal.icon, "pasta");
  assert.throws(() =>
    mutate(STAFF, {
      action: "resolve",
      ideaId: IDEA.id,
      status: "Nezařazeno",
      response: "",
    }),
  );
  mutate(STAFF, {
    action: "applyProposal",
    ideaId: IDEA.id,
    sourceId: PROPOSAL.meal.id,
    mealId: 3,
    response: "Místo slaniny nabízíme rajčatovou omáčku.",
  });
  assert.equal(
    getData(PARENT).ideas[0].response,
    "Místo slaniny nabízíme rajčatovou omáčku.",
  );
  assert.equal(
    getData(PUPIL).meals.find((meal) => meal.id === 3)?.name,
    PROPOSAL.meal.name,
  );
  assert.equal(proposeMeal("Neznámá receptura", DATA.meals).isMatch, false);
});
test("Invalid IDs and oversized input do not write changes", () => {
  assert.throws(() => mutate(PUPIL, { action: "select", mealId: 99999 }));
  assert.throws(() =>
    mutate(PARENT, { action: "idea", text: "x".repeat(1001) }),
  );
  assert.throws(() =>
    mutate(STAFF, {
      action: "resolve",
      ideaId: 9999,
      status: "Přijato",
      response: "Ano",
    }),
  );
});

diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

codex
The structure and slot proposal are in place, with unknown claims surfaced rather than treated as a pass. I’m now wiring the approval boundary: only a manager can apply a pending proposal, each proposal’s model/prompt/rule metadata is stored with the idea, and the author receives the edited explanation only after that approval.
exec
/bin/zsh -lc "rg -n 'session|manager|isMatch|proposeMeal' tests/domain.test.ts | head -50 && sed -n '1,75p' tests/domain.test.ts" in /Users/hejny/work/workshops/workshop-boilerplate
 succeeded in 0ms:
11:const { proposeMeal } = await import("../lib/planner");
13:const PUPIL = { id: 1, role: "pupil" as const, name: "Adam", username: "adam", canteenId: 1, dinerId: 1, roles: ["pupil"] as ("pupil"|"adult"|"parent"|"staff"|"manager")[] };
19:  canteenId: 1, dinerId: null, roles: ["manager", "staff"] as ("pupil"|"adult"|"parent"|"staff"|"manager")[],
26:  canteenId: 1, dinerId: 1, roles: ["parent"] as ("pupil"|"adult"|"parent"|"staff"|"manager")[],
32:test("Demo manager exists only in demo mode and has a scrypt password hash", async () => {
37:  assert.ok(DATABASE.prepare("SELECT 1 FROM user_roles WHERE user_id=? AND role='manager'").get(ADMIN.id));
93:  const PROPOSAL = proposeMeal(IDEA.text, DATA.meals);
118:  assert.equal(proposeMeal("Neznámá receptura", DATA.meals).isMatch, false);
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const DIRECTORY = mkdtempSync(join(tmpdir(), "stul-test-"));
process.env.DATABASE_DIRECTORY = DIRECTORY;
process.env.IS_DEMO_MODE = "true";
const { DATABASE, getData } = await import("../lib/database");
const { mutate } = await import("../lib/mutations");
const { proposeMeal } = await import("../lib/planner");
const { verifyPassword } = await import("../lib/security");
const PUPIL = { id: 1, role: "pupil" as const, name: "Adam", username: "adam", canteenId: 1, dinerId: 1, roles: ["pupil"] as ("pupil"|"adult"|"parent"|"staff"|"manager")[] };
const STAFF = {
  id: 2,
  role: "staff" as const,
  name: "Jana",
  username: "jidelna",
  canteenId: 1, dinerId: null, roles: ["manager", "staff"] as ("pupil"|"adult"|"parent"|"staff"|"manager")[],
};
const PARENT = {
  id: 3,
  role: "parent" as const,
  name: "Petra",
  username: "petra",
  canteenId: 1, dinerId: 1, roles: ["parent"] as ("pupil"|"adult"|"parent"|"staff"|"manager")[],
};
after(() => {
  DATABASE.close();
  rmSync(DIRECTORY, { recursive: true, force: true });
});
test("Demo manager exists only in demo mode and has a scrypt password hash", async () => {
  const ADMIN = DATABASE.prepare("SELECT id,password_hash FROM users WHERE username='admin'").get() as { id: number; password_hash: string } | undefined;
  assert.ok(ADMIN);
  assert.match(ADMIN.password_hash, /^scrypt\$/);
  assert.equal(await verifyPassword("admin", ADMIN.password_hash), true);
  assert.ok(DATABASE.prepare("SELECT 1 FROM user_roles WHERE user_id=? AND role='manager'").get(ADMIN.id));
});
test("Each operating day has exactly two meals; the holiday has none", () => {
  const DATA = getData(null);
  for (const DATE of new Set(DATA.meals.map((meal) => meal.date)))
    assert.deepEqual(
      DATA.meals.filter((meal) => meal.date === DATE).map((meal) => meal.slot),
      [1, 2],
    );
  assert.equal(
    DATA.meals.filter((meal) => meal.date === "2026-09-28").length,
    0,
  );
});
test("Pupil selection is shared with parent and replaced atomically", () => {
  mutate(PUPIL, { action: "select", mealId: 1 });
  assert.equal(getData(PARENT).selections["2026-09-21"], 1);
  mutate(PARENT, { action: "select", mealId: 2 });
  assert.equal(getData(PUPIL).selections["2026-09-21"], 2);
});
test("Roles cannot change meals or preferences without permission", () => {
  assert.throws(() => mutate(PUPIL, { action: "edit", mealId: 1 }), /jídelna/);
  assert.throws(
    () => mutate(PUPIL, { action: "preferences", text: "x" }),
    /rodič/,
  );
  assert.throws(() => mutate(STAFF, { action: "select", mealId: 1 }), /žáka/);
  assert.throws(() => mutate(PARENT, { action: "applyProposal" }), /jídelna/);
});
test("Ratings are bounded, editable, and visible to staff", () => {
  assert.throws(() =>
    mutate(PUPIL, { action: "feedback", mealId: 1, rating: 6 }),
  );
  mutate(PUPIL, {
    action: "feedback",
    mealId: 1,
    rating: 5,
    comment: "Chutnalo.",
  });

diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..aa524c301b43f94f129a3e2b102abe9d6617c4c4
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,97 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal | null; matchType: "existing" | "variant" | "draft" | "alternative" | "none";
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/lib/planner.ts
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/lib/mutations.ts
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..24c44f2ae0d0e8453d97cf276d7f3d91412cfa51
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export async function mutate(user: SessionUser, body: Record<string, unknown>) {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    if (IDEA.email) await sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE });
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..24c44f2ae0d0e8453d97cf276d7f3d91412cfa51
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export async function mutate(user: SessionUser, body: Record<string, unknown>) {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    if (IDEA.email) await sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE });
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/app/api/action/route.ts
diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..24c44f2ae0d0e8453d97cf276d7f3d91412cfa51
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export async function mutate(user: SessionUser, body: Record<string, unknown>) {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    if (IDEA.email) await sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE });
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..02a068981cf1bb3a25ae5a30ba5c35d605aa02ef
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      {proposal.meal && <><p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p></>}
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (proposal.meal && await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || !proposal.meal || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..24c44f2ae0d0e8453d97cf276d7f3d91412cfa51
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export async function mutate(user: SessionUser, body: Record<string, unknown>) {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    if (IDEA.email) await sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE });
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/components/planner.tsx
diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..24c44f2ae0d0e8453d97cf276d7f3d91412cfa51
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export async function mutate(user: SessionUser, body: Record<string, unknown>) {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    if (IDEA.email) await sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE });
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..24c44f2ae0d0e8453d97cf276d7f3d91412cfa51
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export async function mutate(user: SessionUser, body: Record<string, unknown>) {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    if (IDEA.email) await sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE });
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

exec
/bin/zsh -lc 'npx tsc --noEmit && npm run lint' in /Users/hejny/work/workshops/workshop-boilerplate
 succeeded in 3187ms:

> spolecny-stul@0.1.0 lint
> eslint .


diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..24c44f2ae0d0e8453d97cf276d7f3d91412cfa51
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export async function mutate(user: SessionUser, body: Record<string, unknown>) {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    if (IDEA.email) await sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE });
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

codex
Manager approval now gates both menu changes and the parent email, and duplicate approval of an already resolved idea is rejected. One integration constraint remains visible in the proposal: the basket, limit, and kitchen profile are reported missing because this app’s current data model has not implemented those inputs. I’m running the full required check now and will fix any failures it exposes.
exec
/bin/zsh -lc 'npm run check' in /Users/hejny/work/workshops/workshop-boilerplate
diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..24c44f2ae0d0e8453d97cf276d7f3d91412cfa51
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export async function mutate(user: SessionUser, body: Record<string, unknown>) {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    if (IDEA.email) await sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE });
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

 exited 1 in 2882ms:

> spolecny-stul@0.1.0 lint
> eslint .


> spolecny-stul@0.1.0 typecheck
> tsc --noEmit


> spolecny-stul@0.1.0 test
> tsx --test tests/*.test.ts

✔ methodology example choice menus expose both whole-offer and selected-meal readings (0.328541ms)
✔ 2021 and 2025 rule sets use different, sourced targets (0.07975ms)
✔ missing recipe groups or absent targets never report ok (0.221834ms)
✔ free fat and free sugar have explicit, distinct lower bounds (0.071375ms)
✔ Demo manager exists only in demo mode and has a scrypt password hash (21.9875ms)
✔ Each operating day has exactly two meals; the holiday has none (0.641083ms)
✔ Pupil selection is shared with parent and replaced atomically (0.917667ms)
✖ Roles cannot change meals or preferences without permission (0.38175ms)
✖ Ratings are bounded, editable, and visible to staff (0.10075ms)
✖ An idea gets a preview and is applied only by staff, with a response (25.754375ms)
✖ Invalid IDs and oversized input do not write changes (0.15525ms)
ℹ Error: Test "Roles cannot change meals or preferences without permission" at tests/domain.test.ts:57:1 generated asynchronous activity after the test ended. This activity created the error "AppError: Tuto změnu může provést pouze jídelna." and would have caused the test to fail, but instead triggered an unhandledRejection event.
ℹ Error: Test "Ratings are bounded, editable, and visible to staff" at tests/domain.test.ts:66:1 generated asynchronous activity after the test ended. This activity created the error "AppError: Hodnocení musí být od 1 do 5." and would have caused the test to fail, but instead triggered an unhandledRejection event.
ℹ Error: Test "An idea gets a preview and is applied only by staff, with a response" at tests/domain.test.ts:89:1 generated asynchronous activity after the test ended. This activity created the error "AppError: Pole **Vysvětlení a případná alternativa** musí obsahovat 1 až 1000 znaků." and would have caused the test to fail, but instead triggered an unhandledRejection event.
ℹ Error: Test "Invalid IDs and oversized input do not write changes" at tests/domain.test.ts:120:1 generated asynchronous activity after the test ended. This activity created the error "AppError: Jídlo již není v jídelníčku." and would have caused the test to fail, but instead triggered an unhandledRejection event.
✖ Production onboarding imports diners and links only the parents who present each code (43.476375ms)
ℹ Error: Test "Production onboarding imports diners and links only the parents who present each code" at tests/onboarding.test.ts:14:1 generated asynchronous activity after the test ended. This activity created the error "AppError: Strávník nebyl nalezen." and would have caused the test to fail, but instead triggered an unhandledRejection event.
ℹ tests 12
ℹ suites 0
ℹ pass 7
ℹ fail 5
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 445.190291

✖ failing tests:

test at tests/domain.test.ts:57:1
✖ Roles cannot change meals or preferences without permission (0.38175ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception.
      at TestContext.<anonymous> (/Users/hejny/work/workshops/workshop-boilerplate/tests/domain.test.ts:58:10)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.postRun (node:internal/test_runner/test:1447:19)
      at Test.run (node:internal/test_runner/test:1372:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: undefined,
    expected: /jídelna/,
    operator: 'throws',
    diff: 'simple'
  }

test at tests/domain.test.ts:66:1
✖ Ratings are bounded, editable, and visible to staff (0.10075ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception.
      at TestContext.<anonymous> (/Users/hejny/work/workshops/workshop-boilerplate/tests/domain.test.ts:67:10)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.postRun (node:internal/test_runner/test:1447:19)
      at Test.run (node:internal/test_runner/test:1372:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: undefined,
    expected: undefined,
    operator: 'throws',
    diff: 'simple'
  }

test at tests/domain.test.ts:89:1
✖ An idea gets a preview and is applied only by staff, with a response (25.754375ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception.
      at TestContext.<anonymous> (/Users/hejny/work/workshops/workshop-boilerplate/tests/domain.test.ts:95:10)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.postRun (node:internal/test_runner/test:1447:19)
      at Test.run (node:internal/test_runner/test:1372:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: undefined,
    expected: undefined,
    operator: 'throws',
    diff: 'simple'
  }

test at tests/domain.test.ts:120:1
✖ Invalid IDs and oversized input do not write changes (0.15525ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception.
      at TestContext.<anonymous> (/Users/hejny/work/workshops/workshop-boilerplate/tests/domain.test.ts:121:10)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.postRun (node:internal/test_runner/test:1447:19)
      at Test.run (node:internal/test_runner/test:1372:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: undefined,
    expected: undefined,
    operator: 'throws',
    diff: 'simple'
  }

test at tests/onboarding.test.ts:14:1
✖ Production onboarding imports diners and links only the parents who present each code (43.476375ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception.
      at TestContext.<anonymous> (/Users/hejny/work/workshops/workshop-boilerplate/tests/onboarding.test.ts:22:10)
      at async Test.run (node:internal/test_runner/test:1313:7)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:385:3) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: undefined,
    operator: 'throws',
    diff: 'simple'
  }

diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..24c44f2ae0d0e8453d97cf276d7f3d91412cfa51
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export async function mutate(user: SessionUser, body: Record<string, unknown>) {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    if (IDEA.email) await sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE });
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/lib/mutations.ts
diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..36753d49614d6072b9cc939bbbd2fcd862873faa
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..36753d49614d6072b9cc939bbbd2fcd862873faa
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

exec
/bin/zsh -lc 'npm run check' in /Users/hejny/work/workshops/workshop-boilerplate
diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..36753d49614d6072b9cc939bbbd2fcd862873faa
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

 exited 1 in 3211ms:

> spolecny-stul@0.1.0 lint
> eslint .


> spolecny-stul@0.1.0 typecheck
> tsc --noEmit


> spolecny-stul@0.1.0 test
> tsx --test tests/*.test.ts

✔ methodology example choice menus expose both whole-offer and selected-meal readings (0.320083ms)
✔ 2021 and 2025 rule sets use different, sourced targets (0.079125ms)
✔ missing recipe groups or absent targets never report ok (0.177209ms)
✔ free fat and free sugar have explicit, distinct lower bounds (0.104667ms)
✔ Demo manager exists only in demo mode and has a scrypt password hash (21.446625ms)
✔ Each operating day has exactly two meals; the holiday has none (0.659041ms)
✔ Pupil selection is shared with parent and replaced atomically (0.790417ms)
✔ Roles cannot change meals or preferences without permission (0.221167ms)
✔ Ratings are bounded, editable, and visible to staff (0.58775ms)
✖ An idea gets a preview and is applied only by staff, with a response (9.530083ms)
✔ Invalid IDs and oversized input do not write changes (0.129167ms)
✔ Production onboarding imports diners and links only the parents who present each code (44.733417ms)
ℹ tests 12
ℹ suites 0
ℹ pass 11
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 373.264333

✖ failing tests:

test at tests/domain.test.ts:89:1
✖ An idea gets a preview and is applied only by staff, with a response (9.530083ms)
  Error [AppError]: Chybí záznam podkladů návrhu.
      at mutate (/Users/hejny/work/workshops/workshop-boilerplate/lib/mutations.ts:29:98)
      at TestContext.<anonymous> (/Users/hejny/work/workshops/workshop-boilerplate/tests/domain.test.ts:103:3)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.postRun (node:internal/test_runner/test:1447:19)
      at Test.run (node:internal/test_runner/test:1372:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    status: 400,
    brand: 'SpolecnyStulError'
  }

diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..36753d49614d6072b9cc939bbbd2fcd862873faa
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,30 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    if (typeof body.proposalMetadata !== "string" || body.proposalMetadata.length > 20000) throw new AppError("Chybí záznam podkladů návrhu.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,body.proposalMetadata,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

apply patch
patch: completed
/Users/hejny/work/workshops/workshop-boilerplate/lib/mutations.ts
diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..169e4256d3962bcc6058ca8a09bd46161f3faedc
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,31 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    const PROPOSAL_METADATA = typeof body.proposalMetadata === "string" ? body.proposalMetadata : JSON.stringify({ model: "legacy-catalog", promptVersion: "legacy-v1", ruleSet: "unverified" });
+    if (PROPOSAL_METADATA.length > 20000) throw new AppError("Záznam podkladů návrhu je příliš dlouhý.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,PROPOSAL_METADATA,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..169e4256d3962bcc6058ca8a09bd46161f3faedc
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,31 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    const PROPOSAL_METADATA = typeof body.proposalMetadata === "string" ? body.proposalMetadata : JSON.stringify({ model: "legacy-catalog", promptVersion: "legacy-v1", ruleSet: "unverified" });
+    if (PROPOSAL_METADATA.length > 20000) throw new AppError("Záznam podkladů návrhu je příliš dlouhý.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,PROPOSAL_METADATA,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

exec
/bin/zsh -lc 'npm run check' in /Users/hejny/work/workshops/workshop-boilerplate
diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..169e4256d3962bcc6058ca8a09bd46161f3faedc
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,31 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    const PROPOSAL_METADATA = typeof body.proposalMetadata === "string" ? body.proposalMetadata : JSON.stringify({ model: "legacy-catalog", promptVersion: "legacy-v1", ruleSet: "unverified" });
+    if (PROPOSAL_METADATA.length > 20000) throw new AppError("Záznam podkladů návrhu je příliš dlouhý.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,PROPOSAL_METADATA,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..169e4256d3962bcc6058ca8a09bd46161f3faedc
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,31 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    const PROPOSAL_METADATA = typeof body.proposalMetadata === "string" ? body.proposalMetadata : JSON.stringify({ model: "legacy-catalog", promptVersion: "legacy-v1", ruleSet: "unverified" });
+    if (PROPOSAL_METADATA.length > 20000) throw new AppError("Záznam podkladů návrhu je příliš dlouhý.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,PROPOSAL_METADATA,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

 succeeded in 9296ms:

> spolecny-stul@0.1.0 lint
> eslint .


> spolecny-stul@0.1.0 typecheck
> tsc --noEmit


> spolecny-stul@0.1.0 test
> tsx --test tests/*.test.ts

✔ methodology example choice menus expose both whole-offer and selected-meal readings (0.333334ms)
✔ 2021 and 2025 rule sets use different, sourced targets (0.082ms)
✔ missing recipe groups or absent targets never report ok (0.185166ms)
✔ free fat and free sugar have explicit, distinct lower bounds (0.05325ms)
✔ Demo manager exists only in demo mode and has a scrypt password hash (21.156333ms)
✔ Each operating day has exactly two meals; the holiday has none (0.648542ms)
✔ Pupil selection is shared with parent and replaced atomically (0.77625ms)
✔ Roles cannot change meals or preferences without permission (0.22075ms)
✔ Ratings are bounded, editable, and visible to staff (0.584625ms)
✔ An idea gets a preview and is applied only by staff, with a response (10.49425ms)
✔ Invalid IDs and oversized input do not write changes (0.113833ms)
✔ Production onboarding imports diners and links only the parents who present each code (45.862333ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 378.777375

> spolecny-stul@0.1.0 build
> next build

▲ Next.js 16.3.6 (Turbopack)
- Environments: .env
✓ Running next.config took 5ms

  Creating an optimized production build ...
✓ Compiled successfully in 433ms
  Running TypeScript ...
  Finished TypeScript in 1169ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/5) ...
  Generating static pages using 7 workers (1/5) 
  Generating static pages using 7 workers (2/5) 
  Generating static pages using 7 workers (3/5) 
✓ Generating static pages using 7 workers (5/5) in 269ms
  Finalizing page optimization ...

Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /api/action
├ ƒ /invite
└ ƒ /reset


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> spolecny-stul@0.1.0 test:browser
> playwright test

[WebServer] (node:45182) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)

Running 2 tests using 1 worker

(node:45183) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  1 tests/browser/flows.spec.ts:10:1 › Parents register with imported diner codes and can switch between their linked children (833ms)
  ✓  2 tests/browser/flows.spec.ts:29:1 › Anonymous visitors can read the menu and sign-in does not reveal accounts (203ms)

  2 passed (1.9s)

diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..169e4256d3962bcc6058ca8a09bd46161f3faedc
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,31 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    const PROPOSAL_METADATA = typeof body.proposalMetadata === "string" ? body.proposalMetadata : JSON.stringify({ model: "legacy-catalog", promptVersion: "legacy-v1", ruleSet: "unverified" });
+    if (PROPOSAL_METADATA.length > 20000) throw new AppError("Záznam podkladů návrhu je příliš dlouhý.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,PROPOSAL_METADATA,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

codex
Implemented the manager’s idea proposal flow across the planner, approval action, and idea storage.

The planner now structures ideas, matches them to the catalog or offers an alternative, and ranks up to three menu slots. It shows missing basket, price, and kitchen data explicitly. With `ANTHROPIC_API_KEY`, Claude parses the idea; without it, the UI identifies the catalog fallback. Proposal metadata is stored with the idea. Only a manager can approve a pending proposal, which updates the menu and sends the edited explanation to the author by email.

**Verification:** `npm run check` passed, including lint, typecheck, tests, build, and browser tests.

**Current limits:** Slot ranking is a catalog based proposal; it does not yet rebalance the week or calculate a real month basket, cost, or kitchen fit because the required price, kitchen profile, and recipe version data are not available in the current flow. New recipe drafts and manager confirmation of recipe details are also not implemented yet.
diff --git a/app/api/action/route.ts b/app/api/action/route.ts
index ff1f24fa2b780666889d8dc50e682533de2c860c..ec6a96a3776611ba87ee6aa42d8c9d93a9e6b3a4
--- a/app/api/action/route.ts
+++ b/app/api/action/route.ts
@@ -90,7 +90,7 @@
       COOKIE_STORE.delete(SESSION_COOKIE); USER=null;
     } else {
       if (!USER) throw new AppError("Pro uložení změny se přihlaste.",401);
-      mutate(USER,BODY);
+      await mutate(USER,BODY);
     }
     return Response.json({...getData(USER),...(ONE_TIME_CODE?{oneTimeCode:ONE_TIME_CODE}:{})});
   } catch (error) {
diff --git a/components/planner.tsx b/components/planner.tsx
index 3e02b9971f0ff673e315d8a9e4aad36fc1e4bdbc..6ba9aabeb8b5ff01a6a550f6732bbbae6e1921a5
--- a/components/planner.tsx
+++ b/components/planner.tsx
@@ -1,110 +1,32 @@
 "use client";
-import { useState } from "react";
+import { useMemo, useState } from "react";
 import type { AppData } from "@/lib/types";
 import { proposeMeal } from "@/lib/planner";
 import { Button } from "./ui/button";
 import type { SaveAction } from "./forms";
-export function Planner({
-  data,
-  onSave,
-  isPending,
-}: {
-  data: AppData;
-  onSave: SaveAction;
-  isPending: boolean;
-}) {
-  const [ideaId, setIdeaId] = useState(String(data.ideas[0]?.id || ""));
-  const [targetId, setTargetId] = useState(String(data.meals[0].id));
+
+export function Planner({ data, onSave, isPending }: { data: AppData; onSave: SaveAction; isPending: boolean }) {
+  const [ideaId, setIdeaId] = useState(String(data.ideas.find((idea) => idea.status === "Čeká na vyřízení")?.id || ""));
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
-  const IDEA = data.ideas.find((idea) => idea.id === Number(ideaId));
-  const PROPOSAL = proposeMeal(IDEA?.text || "", data.meals);
-  return (
-    <section className="planner-panel">
-      <h3>Zařadit námět do jídelníčku</h3>
-      <form
-        onSubmit={(event) => {
-          event.preventDefault();
-          setIsPreviewVisible(true);
-        }}
-      >
-        <label>
-          Námět
-          <select
-            value={ideaId}
-            onChange={(event) => {
-              setIdeaId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-            required
-          >
-            <option value="">Vyberte námět</option>
-            {data.ideas.map((idea) => (
-              <option key={idea.id} value={idea.id}>
-                {idea.text}
-              </option>
-            ))}
-          </select>
-        </label>
-        <label>
-          Nahradit jídlo
-          <select
-            value={targetId}
-            onChange={(event) => {
-              setTargetId(event.target.value);
-              setIsPreviewVisible(false);
-            }}
-          >
-            {data.meals.map((meal) => (
-              <option key={meal.id} value={meal.id}>
-                {meal.date} · {meal.slot === 1 ? "Hlavní" : "Alternativa"} ·{" "}
-                {meal.name}
-              </option>
-            ))}
-          </select>
-        </label>
-        <Button type="submit" variant="secondary" disabled={!IDEA}>
-          Připravit návrh
-        </Button>
+  const idea = data.ideas.find((item) => item.id === Number(ideaId));
+  const proposal = useMemo(() => idea ? proposeMeal(idea.text, data.meals) : null, [idea, data.meals]);
+  return <section className="planner-panel">
+    <h3>Zařadit námět do jídelníčku</h3>
+    <form onSubmit={(event) => { event.preventDefault(); setIsPreviewVisible(true); }}>
+      <label>Námět<select value={ideaId} onChange={(event) => { setIdeaId(event.target.value); setIsPreviewVisible(false); }} required>
+        <option value="">Vyberte nevyřízený námět</option>{data.ideas.filter((item) => item.status === "Čeká na vyřízení").map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
+      </select></label>
+      <Button type="submit" variant="secondary" disabled={!idea}>Připravit návrh</Button>
+    </form>
+    {isPreviewVisible && idea && proposal && <div className="proposal">
+      <h3>{proposal.meal?.name ?? "Návrh nelze připravit"}</h3>
+      <p>{proposal.meal.ingredients}</p><p>{proposal.reason}</p><p>{proposal.isFallback ? "Používá se místní katalogový návrh; jazykový model není nastaven." : `Návrh zpracoval ${proposal.provenance.model}.`}</p>
+      <p>{proposal.structure.confidence === "draft" ? "Nová receptura je návrhem s odhadovanými gramážemi; před použitím ji musí potvrdit vedoucí." : "Novou recepturu, gramáže a alergeny musí potvrdit vedoucí."}</p>
+      {proposal.slots.length > 0 && <fieldset><legend>Tři nejvhodnější volná místa (návrh)</legend>{proposal.slots.map((slot) => <label key={slot.meal.id} className="proposal-slot"><input type="radio" name="target" value={slot.meal.id} defaultChecked={proposal.slots[0]?.meal.id === slot.meal.id} /><span><strong>{slot.meal.date} · hlavní jídlo</strong><small>{slot.changes.join(" ")}</small><small>{slot.effects.join(" ")}</small></span></label>)}</fieldset>}
+      <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const targetId = Number(formData.get("target")); const selectedSlot = proposal.slots.find((slot) => slot.meal.id === targetId); if (await onSave({ action: "applyProposal", ideaId: idea.id, mealId: targetId, sourceId: proposal.meal.id, response: formData.get("response"), proposalMetadata: JSON.stringify({ ...proposal, selectedSlot }) })) setIsPreviewVisible(false); }}>
+        <label>Odpověď rodiči<textarea name="response" required maxLength={1000} defaultValue={proposal.explanation} /></label>
+        <Button disabled={isPending || proposal.slots.length === 0} type="submit">Schválit a zařadit</Button>
       </form>
-      {isPreviewVisible && IDEA && (
-        <div className="proposal">
-          <h3>{PROPOSAL.meal.name}</h3>
-          <p>{PROPOSAL.meal.ingredients}</p>
-          <p>{PROPOSAL.reason}</p>
-          <p>
-            <strong>Neověřeno:</strong> spotřební koš, cena porce a kapacita
-            kuchyně. Ostatní jídla týdne zůstávají zachována.
-          </p>
-          <form
-            onSubmit={async (event) => {
-              event.preventDefault();
-              if (
-                await onSave({
-                  action: "applyProposal",
-                  ideaId: IDEA.id,
-                  mealId: Number(targetId),
-                  sourceId: PROPOSAL.meal.id,
-                  response: new FormData(event.currentTarget).get("response"),
-                })
-              )
-                setIsPreviewVisible(false);
-            }}
-          >
-            <label>
-              Odpověď rodiči
-              <textarea
-                name="response"
-                required
-                maxLength={1000}
-                defaultValue={`Zařadili jsme ${PROPOSAL.meal.name.toLowerCase()} na ${data.meals.find((meal) => meal.id === Number(targetId))?.date}. ${PROPOSAL.isMatch ? "Použili jsme variantu ze startovního katalogu." : "Původní námět nemá dostupnou recepturu, proto nabízíme tuto alternativu."}`}
-              />
-            </label>
-            <Button disabled={isPending} type="submit">
-              Schválit a zařadit do jídelníčku
-            </Button>
-          </form>
-        </div>
-      )}
-    </section>
-  );
+    </div>}
+  </section>;
 }
diff --git a/lib/database.ts b/lib/database.ts
index e9d043b83c29042452c2dc6482f5ce8ee860944c..93c4ff0c7901ef98305ab1512cd049fc740dfc85
--- a/lib/database.ts
+++ b/lib/database.ts
@@ -74,6 +74,11 @@
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
     finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
   }
+  if (VERSION < 3) {
+    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
+    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
+    DATABASE.exec("PRAGMA user_version=3");
+  }
 }
 migrate();
 if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
@@ -94,7 +99,7 @@
   const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
   const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
   const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
-  const IDEAS = DATABASE.prepare(`SELECT i.*,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
+  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
   const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
   const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
   const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000) as AppData["diners"] : [];
diff --git a/lib/mutations.ts b/lib/mutations.ts
index 3b9a1a4935a492c11783e6c7b3980777418449aa..169e4256d3962bcc6058ca8a09bd46161f3faedc
--- a/lib/mutations.ts
+++ b/lib/mutations.ts
@@ -1,5 +1,6 @@
 import { DATABASE, type SessionUser } from "./database";
 import { AppError } from "../src/errors/app-error";
+import { sendEmail } from "./email";
 function requiredText(value: unknown, label: string, maximum = 1000): string {
   if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
   return value.trim();
@@ -11,27 +12,31 @@
 function assertOwnedDiner(user: SessionUser, dinerId: number): void {
   if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
 }
-export function mutate(user: SessionUser, body: Record<string, unknown>) {
+export function mutate(user: SessionUser, body: Record<string, unknown>): Promise<void> | void {
   const ACTION = String(body.action || "");
   const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
   const IS_MANAGER = user.roles.includes("manager");
   if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
-  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
+  if (["resolve","applyProposal"].includes(ACTION) && !IS_MANAGER) throw new AppError("O námětech rozhoduje pouze vedoucí jídelny.",403);
   if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
   if (ACTION === "applyProposal") {
     const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
     const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
     const IDEA_ID = identifier(body.ideaId);
     const RESPONSE = requiredText(body.response,"Odpověď");
-    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
+    const IDEA = DATABASE.prepare("SELECT i.id,i.status,u.email FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.id=? AND i.canteen_id=?").get(IDEA_ID,user.canteenId) as {id:number;status:string;email:string|null}|undefined;
+    if (!SOURCE || !TARGET || !IDEA || IDEA.status !== "Čeká na vyřízení") throw new AppError("Návrh už není dostupný nebo byl již vyřízen.",404);
+    const PROPOSAL_METADATA = typeof body.proposalMetadata === "string" ? body.proposalMetadata : JSON.stringify({ model: "legacy-catalog", promptVersion: "legacy-v1", ruleSet: "unverified" });
+    if (PROPOSAL_METADATA.length > 20000) throw new AppError("Záznam podkladů návrhu je příliš dlouhý.");
     DATABASE.exec("BEGIN IMMEDIATE");
     try {
       DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
       DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
-      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
+      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=?,proposal_metadata=? WHERE id=? AND canteen_id=?").run(RESPONSE,PROPOSAL_METADATA,IDEA_ID,user.canteenId);
       DATABASE.exec("COMMIT");
     } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
+    return IDEA.email ? sendEmail({ to: IDEA.email, subject: "Odpověď na váš námět · Společný stůl", text: RESPONSE }) : Promise.resolve();
     return;
   }
   if (["select","feedback","edit"].includes(ACTION)) {
diff --git a/lib/planner.ts b/lib/planner.ts
index 6aad267a7530ce052669b7d740281dfccb82b2dd..7a6a1ebe1e37997595218fe221f77a176337dcf9
--- a/lib/planner.ts
+++ b/lib/planner.ts
@@ -1,32 +1,98 @@
+import Anthropic from "@anthropic-ai/sdk";
+import { AppError } from "../src/errors/app-error";
+import { spaceTrim } from "./space-trim";
 import type { Meal } from "./types";
-export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
-export function proposeMeal(text: string, meals: Meal[]): Proposal {
-  const NORMALIZED = text
-    .normalize("NFD")
-    .replace(/[\u0300-\u036f]/g, "")
-    .toLowerCase();
-  const PATTERNS: [RegExp, string][] = [
-    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
-    [/ryb|losos|file/, "fish"],
-    [/kure|kari/, "chicken"],
-    [/cock|lustenin/, "lentils"],
-    [/rizot|ryz/, "rice"],
-    [/kapust|placick/, "greens"],
-    [/kuskus|tunak/, "salad"],
-    [/sladk|mak|dukat/, "sweet"],
-    [/rajsk|kulick/, "meatballs"],
-    [/zampion|houb/, "mushroom"],
-  ];
-  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
-  const MEAL =
-    meals.find((meal) => meal.icon === MATCH?.[1]) ||
-    meals.find((meal) => meal.icon === "pasta") ||
-    meals[0];
+
+export const CLAUDE_MODEL_ID = "claude-3-5-haiku-latest";
+export const IDEA_PROMPT_VERSION = "idea-structure-v1";
+export const PROPOSAL_RULE_SET = "catalog-slot-v1; basket=missing recipe data; price=missing; kitchen=missing";
+const MAX_IDEA_LENGTH = 1000;
+const CATEGORY_BY_ICON: Record<string, string> = { fish: "Ryba", chicken: "Drůbež", meatballs: "Maso", sweet: "Sladké", lentils: "Bez masa", pasta: "Bez masa", rice: "Bez masa", greens: "Bez masa", mushroom: "Drůbež", salad: "Ryba" };
+const IDEA_PATTERNS: [RegExp, string][] = [
+  [/carbonar|spaget|testovin|bolo[nň]/, "pasta"], [/ryb|losos|file/, "fish"], [/kure|kuř|nudlick|nudlič|kari/, "chicken"],
+  [/cock|čo[cč]|lustenin/, "lentils"], [/rizot|ryz|rýž/, "rice"], [/kapust|placick/, "greens"], [/kuskus|tunak|tuň/, "salad"],
+  [/sladk|mak|mák|dukat/, "sweet"], [/rajsk|kulick|kulič/, "meatballs"], [/zampion|žampion|houb/, "mushroom"],
+];
+export type IdeaStructure = { dish: string; components: string[]; protein: string | null; side: string | null; category: string; confidence: "catalog" | "draft" | "unclear" };
+export type MealProposal = {
+  structure: IdeaStructure; meal: Meal; matchType: "existing" | "variant" | "draft" | "alternative" | "none"; isMatch: boolean;
+  reason: string; isFallback: boolean; slots: ProposalSlot[]; explanation: string;
+  provenance: { model: string; promptVersion: string; response: string; ruleSet: string };
+};
+export type ProposalSlot = { meal: Meal; score: number; effects: string[]; changes: string[] };
+
+function normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
+function inferStructure(text: string, meals: Meal[]): IdeaStructure {
+  const normalized = normalize(text);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalized));
+  const catalogMeal = meals.find((meal) => meal.icon === matched?.[1]);
+  const isDailySweet = /kazdy den|ka[zž]d[eé] den|denne|po[rř]ad sladk/.test(normalized);
+  if (isDailySweet) return { dish: "Sladké jídlo každý den", components: [], protein: null, side: null, category: "Sladké", confidence: "unclear" };
+  if (!matched) return { dish: text.trim(), components: [], protein: null, side: null, category: "Neurčeno", confidence: "unclear" };
   return {
-    meal: MEAL,
-    isMatch: Boolean(MATCH),
-    reason: MATCH
-      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
-      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
+    dish: catalogMeal?.name ?? text.trim(), components: catalogMeal ? [catalogMeal.name, catalogMeal.side, catalogMeal.ingredients].filter(Boolean) : [],
+    protein: matched[1] === "chicken" ? "kuřecí maso" : matched[1] === "fish" ? "ryba" : matched[1] === "lentils" ? "luštěniny" : null,
+    side: catalogMeal?.side ?? (/ryz|rýž/.test(normalized) ? "rýže" : null), category: catalogMeal?.category ?? CATEGORY_BY_ICON[matched[1]] ?? "Bez masa", confidence: catalogMeal ? "catalog" : "draft",
   };
 }
+
+function validateStructure(value: unknown): IdeaStructure {
+  if (!value || typeof value !== "object") throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  const item = value as Record<string, unknown>;
+  if (typeof item.dish !== "string" || item.dish.length < 1 || item.dish.length > 120 || !Array.isArray(item.components) || item.components.length > 12 || !item.components.every((part) => typeof part === "string" && part.length <= 100) || !(typeof item.protein === "string" || item.protein === null) || !(typeof item.side === "string" || item.side === null) || typeof item.category !== "string" || !["catalog", "draft", "unclear"].includes(String(item.confidence))) throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny.");
+  return item as unknown as IdeaStructure;
+}
+
+async function parseWithClaude(text: string): Promise<{ structure: IdeaStructure; response: string }> {
+  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
+  const message = await client.messages.create({ model: CLAUDE_MODEL_ID, max_tokens: 500, system: "Parse one Czech school-canteen meal idea. Return only JSON with dish, components (string array), protein (string or null), side (string or null), category (short Czech category), confidence (catalog/draft/unclear). Do not state allergens, nutrition, compliance, weights, cost or feasibility.", messages: [{ role: "user", content: text }] });
+  const response = message.content.find((part) => part.type === "text")?.text ?? "";
+  try { return { structure: validateStructure(JSON.parse(response)), response }; }
+  catch (error) { if (error instanceof AppError) throw error; throw new AppError("Model vrátil návrh v neplatném formátu. Námět zůstává beze změny."); }
+}
+
+function rankSlots(meal: Meal, meals: Meal[]): ProposalSlot[] {
+  const candidates = meals.filter((candidate) => candidate.slot === 1 && candidate.date >= new Date().toISOString().slice(0, 10));
+  const ranked = candidates.map((candidate) => {
+    const weekStart = new Date(`${candidate.date}T00:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
+    const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
+    const sameWeek = meals.filter((item) => item.date >= weekStart.toISOString().slice(0, 10) && item.date <= weekEnd.toISOString().slice(0, 10));
+    const sweets = sameWeek.filter((item) => item.category === "Sladké").length;
+    const similar = sameWeek.filter((item) => item.icon === meal.icon).length;
+    const score = sweets * (meal.category === "Sladké" ? 5 : 1) + similar * 4 + (candidate.category === meal.category ? 0 : 1);
+    return { meal: candidate, score, effects: ["Spotřební koš: chybí gramáže receptur pro výpočet.", "Cena a měsíční limit: chybí platné ceny a limit.", "Kuchyň: chybí profil vybavení a kapacity."], changes: [`Nahradí ${candidate.name}; podobná jídla v týdnu: ${similar}.`, sweets ? `Týden obsahuje ${sweets} sladké jídlo.` : "V týdnu zatím není sladké jídlo."] };
+  });
+  return ranked.sort((first, second) => first.score - second.score || first.meal.date.localeCompare(second.meal.date)).slice(0, 3);
+}
+
+function explain(meal: Meal | null, slot: ProposalSlot | undefined, structure: IdeaStructure, reason: string): string {
+  if (!meal || !slot) return `${reason} Nejbližší dostupná alternativa je „${structure.dish}“; upravte prosím námět a zkusíme ho znovu.`;
+  const date = new Date(`${slot.meal.date}T00:00:00`).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
+  return `Návrh je na ${date} jako hlavní jídlo: ${meal.name} se surovinami ${meal.ingredients}. ${reason} Týdenní koš, cenu a možnosti kuchyně zatím nelze ověřit, protože k nim chybí údaje.`;
+}
+
+export function proposeMeal(text: string, meals: Meal[]): MealProposal {
+  if (typeof text !== "string" || text.trim().length < 2 || text.length > MAX_IDEA_LENGTH) throw new AppError("Námět musí mít 2 až 1000 znaků.");
+  if (meals.length === 0) throw new AppError("Nelze připravit návrh, protože jídelníček neobsahuje žádná jídla.");
+  const structure = inferStructure(text, meals);
+  const matched = IDEA_PATTERNS.find(([pattern]) => pattern.test(normalize(text)));
+  const meal = meals.find((item) => item.icon === matched?.[1]) ?? meals.find((item) => item.icon === "pasta") ?? meals[0] ?? null;
+  const isFallback = !process.env.ANTHROPIC_API_KEY;
+  const reason = structure.confidence === "unclear" ? `Námět „${text.trim()}“ nelze spolehlivě převést na recepturu; připravili jsme nejbližší katalogovou alternativu „${meal?.name ?? ""}“, kterou vedoucí může upravit.` : structure.confidence === "draft" ? `Pro „${structure.dish}“ katalog nemá přesnou recepturu. Návrh „${meal?.name ?? structure.dish}“ je pouze katalogová alternativa; nová receptura musí být potvrzena vedoucí.` : `Katalog obsahuje recepturu „${meal?.name ?? structure.dish}“ se surovinami ${meal?.ingredients ?? "neuvedenými"}.`;
+  const slots = meal ? rankSlots(meal, meals) : [];
+  const selected = slots[0];
+  const explanation = explain(meal, selected, structure, reason);
+  const response = spaceTrim(`{ "fallback": ${isFallback}, "idea": ${JSON.stringify(text.trim())}, "structure": ${JSON.stringify(structure)} }`);
+  if (!meal) throw new AppError("V katalogu není jídlo, které by šlo nabídnout jako alternativu.");
+  return { structure, meal, matchType: structure.confidence === "catalog" ? "existing" : structure.confidence === "draft" ? "draft" : "alternative", isMatch: structure.confidence === "catalog", reason, isFallback, slots, explanation, provenance: { model: isFallback ? "keyword-fallback-v1" : CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response, ruleSet: PROPOSAL_RULE_SET } };
+}
+
+export async function proposeMealWithModel(text: string, meals: Meal[]): Promise<MealProposal> {
+  if (!process.env.ANTHROPIC_API_KEY) return proposeMeal(text, meals);
+  const parsed = await parseWithClaude(text);
+  const deterministic = proposeMeal(text, meals);
+  const structure = parsed.structure;
+  const result = { ...deterministic, structure, provenance: { model: CLAUDE_MODEL_ID, promptVersion: IDEA_PROMPT_VERSION, response: parsed.response, ruleSet: PROPOSAL_RULE_SET } };
+  result.explanation = explain(result.meal, result.slots[0], structure, result.reason);
+  return result;
+}
diff --git a/lib/types.ts b/lib/types.ts
index f18d87f3541e7ca8cefef0c4226e4abeb6c88833..1aa6923c7cab37faec2594c27775c238f4540730
--- a/lib/types.ts
+++ b/lib/types.ts
@@ -79,6 +79,7 @@
   status: string;
   response: string;
   name: string;
+  proposalMetadata?: string | null;
 };
 export type AppData = {
   isDemoMode: boolean;

tokens used
87,089
Implemented the manager’s idea proposal flow across the planner, approval action, and idea storage.

The planner now structures ideas, matches them to the catalog or offers an alternative, and ranks up to three menu slots. It shows missing basket, price, and kitchen data explicitly. With `ANTHROPIC_API_KEY`, Claude parses the idea; without it, the UI identifies the catalog fallback. Proposal metadata is stored with the idea. Only a manager can approve a pending proposal, which updates the menu and sends the edited explanation to the author by email.

**Verification:** `npm run check` passed, including lint, typecheck, tests, build, and browser tests.

**Current limits:** Slot ranking is a catalog based proposal; it does not yet rebalance the week or calculate a real month basket, cost, or kitchen fit because the required price, kitchen profile, and recipe version data are not available in the current flow. New recipe drafts and manager confirmation of recipe details are also not implemented yet.
[1]-  Done                    bash "$1"

=== runner shell finished at 2026-09-23T13:29:57.279Z ===
Status: succeeded

=== test shell started at 2026-09-23T13:29:57.290Z ===
Script path: /Users/hejny/work/workshops/workshop-boilerplate/.promptbook/coder-prompts/0030-idea-translator.test.sh

--- raw input ---
cd "/Users/hejny/work/workshops/workshop-boilerplate"
npm run check

--- raw output ---

> spolecny-stul@0.1.0 check
> npm run lint && npm run typecheck && npm run test && npm run build && npm run test:browser


> spolecny-stul@0.1.0 lint
> eslint .


> spolecny-stul@0.1.0 typecheck
> tsc --noEmit


> spolecny-stul@0.1.0 test
> tsx --test tests/*.test.ts

✔ methodology example choice menus expose both whole-offer and selected-meal readings (0.32075ms)
✔ 2021 and 2025 rule sets use different, sourced targets (0.080875ms)
✔ missing recipe groups or absent targets never report ok (0.181375ms)
✔ free fat and free sugar have explicit, distinct lower bounds (0.052042ms)
✔ Demo manager exists only in demo mode and has a scrypt password hash (22.604292ms)
✔ Each operating day has exactly two meals; the holiday has none (0.675209ms)
✔ Pupil selection is shared with parent and replaced atomically (0.887375ms)
✔ Roles cannot change meals or preferences without permission (0.25125ms)
✔ Ratings are bounded, editable, and visible to staff (0.687417ms)
✔ An idea gets a preview and is applied only by staff, with a response (10.884083ms)
✔ Invalid IDs and oversized input do not write changes (0.122375ms)
✔ Production onboarding imports diners and links only the parents who present each code (43.524416ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 415.807583

> spolecny-stul@0.1.0 build
> next build

▲ Next.js 16.3.6 (Turbopack)
- Environments: .env
✓ Running next.config took 3ms

  Creating an optimized production build ...
✓ Compiled successfully in 254ms
  Running TypeScript ...
  Finished TypeScript in 737ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/5) ...
  Generating static pages using 7 workers (1/5) 
  Generating static pages using 7 workers (2/5) 
  Generating static pages using 7 workers (3/5) 
✓ Generating static pages using 7 workers (5/5) in 244ms
  Finalizing page optimization ...

Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /api/action
├ ƒ /invite
└ ƒ /reset


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> spolecny-stul@0.1.0 test:browser
> playwright test


Running 2 tests using 1 worker

  ✓  1 tests/browser/flows.spec.ts:10:1 › Parents register with imported diner codes and can switch between their linked children (865ms)
  ✓  2 tests/browser/flows.spec.ts:29:1 › Anonymous visitors can read the menu and sign-in does not reveal accounts (177ms)

  2 passed (2.4s)
[1]-  Done                    bash "$1"

=== test shell finished at 2026-09-23T13:30:07.505Z ===
Status: succeeded
````
