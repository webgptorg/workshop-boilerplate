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

## Database and accounts

- Keep SQL migrations in `migrations/` with `YYYY-MM-XXXX-description.sql` filenames. Applied files are immutable; add a later migration for changes.
- Let the startup runner own the transaction. All pending migrations must commit together; never add transaction control or nontransactional SQL operations.
- Use the authenticated Supabase client for runtime data access so RLS applies. Keep migration credentials server-only and never use an elevated client for normal account operations.
- Preserve account identity when importing backups. Memberships currently describe private account data, not sharing permissions.
- Keep the default test account disabled in production until an administrator changes its password and removes the ban.
- Next account work: implement email ownership verification and account recovery before enabling provider linking or OAuth. Shared workspaces will need a relational membership authorization model and new RLS policies.
- Run database integration tests against a fresh disposable `minute_test` database using `MINUTE_TEST_DATABASE_URL`; never point them at application data.

## Before finishing

Run:

```bash
npm run check
npm run build
```

If you introduce a direct import from another Promptbook package, declare that package explicitly in `dependencies` instead of relying on a transitive dependency.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
