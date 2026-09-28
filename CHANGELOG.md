# Changelog

## 2026-09-28 - Supabase persistence

- Added Supabase email and password accounts, account profiles, and database-backed workspace state.
- Moved recordings to a private Supabase Storage bucket and protected data with per-user RLS policies.
- Added ordered, checked migrations on app startup and a GitHub Actions migration workflow for `main`.
- Required verified sessions and a durable per-user quota for AI endpoints.
- Kept JSON backup and restore, binding restored data to the signed-in account.

## 2026-09-28

- Added a red one-click recording action on the dashboard. It creates a meeting in the current workspace, opens the studio, and starts microphone recording automatically.
- Reused meeting defaults for both instant and form-created meetings.
