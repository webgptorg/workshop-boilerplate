# 0120 — Verify real GitHub sign-in and private-email handling

[ ] Status: BLOCKED_DEPLOYMENT_AND_OWNER_LOGIN. Requires implemented PRDs 0090/0110, GitHub configuration and deployment. Owner authentication/consent/MFA is not automated by this handoff.

## Test procedure

1. On the approved local/deployed origin, use Continue with GitHub from a fresh browser session. Verify the OAuth App owner/name and that consent requests no repository, organization-administration or workflow rights. Repeat with Google disabled to prove independence.
2. Use an owner-controlled account with a private primary email. Confirm the supported Supabase flow obtains an appropriate verified identity without asking for a fabricated email/username-based owner. Test the missing-usable-email case with a controlled fixture/account and verify the documented error/recovery path.
3. Complete consent. Verify the Supabase-to-Minute return and a single initialized account. A new user reaches the recording home without a profile/workspace form. With the recording PRDs implemented, Record a harmless conversation and Stop once; inspect automatically saved results.
4. Reload, sign out and sign in again. Verify existing workspace/todos/private audio remain under the same authorized UUID. Test the legitimate legacy-account transition and a second account's isolation. A matching GitHub display name must never merge owners.
5. Cancel consent, revoke this test app's authorization and reconnect, test an expired callback and refresh/logout behavior. The app must return a safe usable error rather than loop or leak tokens. Perform action 0020's attacker-pre-registration tests only with isolated owner-controlled test accounts.

## Evidence and rollback

Keep private results in ignored `.local/github-oauth-verification.md` and only sanitized environment/date/pass-fail here. Do not commit user email lists, codes, tokens or credential screenshots. Repeat on local, controlled preview and the intended production target as applicable. On a failing release-gating case disable GitHub exposure for that environment and leave PRD 0110 pending/blocked; do not break working Google or email login.
