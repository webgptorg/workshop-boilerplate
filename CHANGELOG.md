# Changelog

## 2026-09-29

- Added Supabase email/password registration and sign-in without email confirmation, with persistent Auth identities and sign-out.
- Replaced browser-only workspace persistence with private per-account database storage, validated backup imports, serialized saves, visible failure recovery, and revision conflict detection. Moved recordings to a private Supabase Storage bucket.
- Added automatic startup SQL migrations with ordered checksums, an advisory lock, and one transaction for the complete pending batch. Failed migrations roll back and prevent startup.
- Seeded `test@ptbk.io` / `password123` as an ordinary development account; known credentials are blocked outside explicitly enabled development.
- Added account and recording RLS policies, authenticated AI routes, and durable per-account rate limits. Removed visited-page service-worker caching.
- Documented Supabase configuration, TLS, migration authoring/deployment, backup transfer, current data-model limits, and future Auth extensions. Added PostgreSQL migration/RLS and persistence regression tests.

## 2026-09-28

- Added a red one-click recording action on the dashboard. It creates a meeting in the current workspace, opens the studio, and starts microphone recording automatically.
- Reused meeting defaults for both instant and form-created meetings.
