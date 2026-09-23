# Agent guidelines

Next.js app "Společný stůl", see `README.md` and the business idea in `docs/00-surovy-napad.txt`.

## Layout

- `src/app` routes: `/` login, `/zak` pupil, `/rodic` parent, `/jidelna` staff.
- `src/model` domain types, `src/data` seed catalog and regulation norms, `src/planning` pure computations.
- `src/storage` local storage access, `src/hooks/stores` persisted stores composed by `AppDataProvider`.
- `src/errors` branded errors, messages are written with `spaceTrim` as markdown.

## Working rules

- Keep TypeScript strict and fix type errors instead of suppressing them.
- Add `"use client"` only where browser state or APIs are needed.
- Reuse `src/components/ui` and the CSS tokens in `src/app/globals.css` before adding a UI dependency.
- Constants are `UPPER_SNAKE_CASE`, booleans are prefixed with `is`, no abbreviations.
- Keep functions and components small with one responsibility.
- Do not write taglines or filler texts in the UI.

## Before finishing

```bash
npm run check
```
