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

## Database and authentication

- Supabase Auth owns identities and passwords. Use immutable Auth UUIDs for ownership; email is the login identifier. Email confirmation and OAuth are intentionally not implemented yet.
- Add append-only `migrations/YYYY-MM-XXXX-description.sql` files. Never change an applied migration or add transaction control/nontransactional SQL. Startup commits the complete pending batch atomically.
- Use the verified user-scoped Supabase client for application queries. Never use database-owner or service-role credentials in request handlers/browser code.
- Enable RLS and explicit grants for every exposed table and private Storage bucket. Embedded workspace memberships currently grant no cross-account access; add relational authorization before implementing sharing.
- Preserve optimistic revision checks, unsaved-change recovery, and account identity rebinding during imports. Do not restore localStorage as the source of workspace data.
- Never enable the known-password test account in production. Keep database credentials server-only and TLS verification enabled.
- Keep API responses and authenticated page data out of service-worker caches.
- Run the PostgreSQL migration/RLS tests when changing persistence. Hosted Auth/Storage integration still needs a configured Supabase project for end-to-end verification.

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
