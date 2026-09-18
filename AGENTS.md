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


