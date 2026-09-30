# Changelog

## 2026-09-30

- Added Supabase email/password registration, sign-in, and sign-out without email confirmation or social providers.
- Persisted account data in PostgreSQL and audio in private Supabase Storage, protected by owner-only RLS and active-account checks.
- Added automatic startup migrations, an advisory lock, immutable migration checksums, and one transaction for the full pending batch.
- Added the initial `test@ptbk.io` account with password `password123`; production startup disables this account while it retains the default password.
- Added save status, retry, and revision-based conflict detection; backup imports preserve authenticated identity.
- Restricted PWA caching to static assets and required authentication for AI endpoints.
- Documented Supabase setup, deployment, migrations, legacy data transfer, and integration testing.

## 2026-09-28

- Added a red one-click recording action on the dashboard. It creates a meeting in the current workspace, opens the studio, and starts microphone recording automatically.
- Reused meeting defaults for both instant and form-created meetings.
