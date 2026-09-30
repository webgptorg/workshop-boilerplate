# 0070 — Configure and enable the Supabase GitHub provider

[ ] Status: BLOCKED_ACCESS_AND_DEPENDENCIES. Requires actions 0020, 0040, 0050 and the GitHub implementation. Perform in the test environment before production.

## Steps

1. Open the correct environment's Supabase project. Go to Authentication → Sign In / Providers → GitHub.
2. Verify its displayed callback matches `MINUTE_SUPABASE_AUTH_CALLBACK_URL` and the registered GitHub OAuth App. Resolve a mismatch before enabling anything.
3. Copy `GITHUB_OAUTH_CLIENT_ID` to the Client ID field and `GITHUB_OAUTH_CLIENT_SECRET` to the Client Secret field using the owner-controlled credential manager or ignored `.env.oauth.local`. These secrets are not application runtime variables.
4. Enable the provider and save after the identity-safety gate is approved. Do not request repository access or weaken identity/email checks to bypass a private-email failure.
5. Record only the environment/date/configured outcome. Continue with the environment/deployment actions and the actual GitHub verification in 0120.

## Verification and rollback

Re-open the settings and verify the intended provider/client and enabled state, without copying secrets into evidence. Dashboard configuration alone is not completion of the PRD. Disable only GitHub and keep its application readiness flag false when rollback is needed; do not disrupt working email or Google authentication. Rotate a leaked secret.

Reference: [Supabase GitHub provider](https://supabase.com/docs/guides/auth/social-login/auth-github).
