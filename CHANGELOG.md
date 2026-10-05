# Changelog

## 2026-10-05

- Added `test:e2e` with a shared Playwright browser suite and a `tsx`/`ts-node` launcher; `check` now includes the suite and its production build.
- Covered workspaces, meeting and todo lifecycles, search and filters, preferences, recording consent and pause/resume, audio upload/download, transcripts, mocked AI processing, and retry/deduplication behavior.
- Recreated the existing backup validation, one-time recording intent, and offline service-worker regressions as browser tests while retaining the fast unit suite.
- Documented browser installation, test isolation, debugging, and failure reports; added testing guidance for future agents.

## 2026-09-28

- Added a red one-click recording action on the dashboard. It creates a meeting in the current workspace, opens the studio, and starts microphone recording automatically.
- Reused meeting defaults for both instant and form-created meetings.
