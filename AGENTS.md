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
- Start microphone recording only after an explicit user action. Opening or reloading a studio URL alone must not request access.
- Cover user-facing changes in `tests/e2e/`, reusing its shared fixtures and browser helpers. Keep AI requests mocked and browser storage isolated; tests must not require credentials or a real microphone.
- Preserve the browser regressions for recording consent, backup validation, and offline navigation. End-to-end tests use production mode because the service worker is disabled in development.

## Before finishing

Run:

```bash
npm run check
npm run build
```

Install Chromium with `npx playwright install chromium` before the first browser test run (`--with-deps` on Linux CI if needed). `npm run check` includes unit tests and `test:e2e`, which builds and starts a temporary production server on port 3100. Keep that port free. Use `npm run test:e2e -- --grep "story name"` for a focused run; failure traces/screenshots and HTML reports are ignored by Git.

If you introduce a direct import from another Promptbook package, declare that package explicitly in `dependencies` instead of relying on a transitive dependency.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
