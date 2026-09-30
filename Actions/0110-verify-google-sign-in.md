# 0110 — Verify real Google sign-in and existing data

[ ] Status: BLOCKED_DEPLOYMENT_AND_OWNER_LOGIN. Requires implemented PRDs 0090/0100, Google configuration and deployment. Provider consent/MFA must be completed by the authorized owner, not bypassed.

## Test procedure

1. Use a fresh browser session on the verified local or deployed origin. Confirm the Google action is available only in the configured environment and that email login still works. A Google login must also work with GitHub disabled.
2. Choose Continue with Google using an owner-controlled test account. Inspect the requested scope: identity/profile/email only. Complete provider login/consent. Confirm the return passes through the configured Supabase callback and ends on the valid Minute callback/home, not a 404 or endless AuthGate login screen.
3. Verify a new account receives a default workspace without filling a profile/workspace form. Record a harmless test conversation, press Stop once and verify saved metadata, transcript, summary and linked todos without application typing. This final interaction test requires the recording PRDs as well.
4. Reload, sign out and sign in again. Confirm the same authorized account retains its workspace/todos/audio. Test the approved legitimate legacy-password-account transition from action 0020 without duplicating or losing its data. Use a second controlled account to verify isolation.
5. Cancel consent, retry an expired callback and test logout/session refresh. Errors must remain usable and must not disclose tokens. Run the negative pre-registration/session cases in an isolated test environment; do not probe real third-party accounts.
6. For a public release, test an eligible account outside any configured Google test-user list. Record any audience/publication/review restriction rather than describing the integration as publicly ready.

## Evidence and rollback

Write detailed owner-only results to ignored `.local/google-oauth-verification.md`; record only environment/date/pass-fail and sanitized blockers here. Never save credential screenshots, callback codes, cookies or session tokens. Repeat for local, controlled preview and intended production as applicable. If any release-gating test fails, keep Google disabled in that target and leave PRD 0100 pending/blocked; another provider may remain enabled independently.
