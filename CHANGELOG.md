# Changelog

## 2026-10-05

- Added Supabase email/password login, registration without email confirmation (guarded against projects that would send an email), persistent sessions, logout, and account-specific offline caches.
- Added an initial SQL migration with `User` profiles, account-owned `AppData`, RLS, bounded text, timestamps, Auth profile triggers, and the opt-in development account `test@ptbk.io` / `password123`.
- Added automatic startup migrations and `db:migrate` with advisory locking, checksummed history, one transaction for every pending batch, verified hosted TLS, and production protection against the known test password.
- Synced workspace metadata, transcripts, todos, and preferences to Supabase with revision checks, reconnect retries, conflict recovery, and backup identity preservation. Scoped local audio storage to each account.
- Required verified Supabase sessions for AI endpoints and keyed their existing throttle by account.
- Added database-backed browser auth/persistence stories and PostgreSQL tests for RLS, password hashing, limits, migration integrity, and transaction rollback. Excluded generated Playwright artifacts from lint.
- Documented hosted/local Supabase setup, email-provider configuration, migration and production workflows, storage behavior, and future identity support.

- Added `test:e2e` with a shared Playwright browser suite and a `tsx`/`ts-node` launcher; `check` now includes the suite and its production build.
- Covered workspaces, meeting and todo lifecycles, search and filters, preferences, recording consent and pause/resume, audio upload/download, transcripts, mocked AI processing, and retry/deduplication behavior.
- Recreated the existing backup validation, one-time recording intent, and offline service-worker regressions as browser tests while retaining the fast unit suite.
- Documented browser installation, test isolation, debugging, and failure reports; added testing guidance for future agents.

## 2026-09-28

- Added a red one-click recording action on the dashboard. It creates a meeting in the current workspace, opens the studio, and starts microphone recording automatically.
- Reused meeting defaults for both instant and form-created meetings.
