# 0060 — Configure and enable the Supabase Google provider

[ ] Status: BLOCKED_ACCESS_AND_DEPENDENCIES. Requires actions 0020, 0030, 0050 and the Google implementation. Perform in the test environment before production.

## Steps

1. Open the Supabase project identified by the environment-specific operator file. Go to Authentication → Sign In / Providers → Google.
2. Compare the callback displayed there with `MINUTE_SUPABASE_AUTH_CALLBACK_URL` and the Google client's configured redirect. A mismatch means stop and correct the target mapping, not create another random client.
3. Copy `GOOGLE_OAUTH_CLIENT_ID` into the provider's client-ID field and `GOOGLE_OAUTH_CLIENT_SECRET` into its client-secret field, reading privately from the owner-controlled credential store/ignored file. Do not put either value in this document.
4. Enable the provider and save only after the identity-safety gate is approved for this environment. Keep any nonce/security bypass disabled; do not relax checks to make a failing callback appear to work.
5. Record only environment, date and configured status here. Application readiness flags and deployment are separate actions, and live login is action 0110.

## Verification and rollback

Re-open the provider settings and verify it is enabled and uses the intended client ID, without exposing the secret. A saved dashboard is not an end-to-end test. If it is misconfigured, disable this provider and keep the Google application flag false; preserve email login and the independently configured GitHub provider. Rotate credentials if they were exposed, not merely because a test failed.

Reference: [Supabase Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google).
