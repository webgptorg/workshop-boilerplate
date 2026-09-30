# 0090 — Configure Vercel variables for the intended Minute environment

[ ] Status: BLOCKED_ACCESS_AND_IMPLEMENTATION. Requires action 0010 and the implemented runtime contract. The Vercel connector/browser was not connected in the authoring session.

## Steps

1. Open the verified Minute Vercel project → Settings → Environment Variables. Confirm project/team and intended Production, Preview or Development scope before editing. For branch-specific Preview settings select `app/minute`, not every application branch.
2. Preserve current working values. Set the project's public Supabase URL/publishable key from the matching Supabase environment and server-only database/TLS/AI variables as described in `.env.example` and the root README. Production `ENABLE_TEST_ACCOUNT` must be false. Do not mix development database credentials with production public settings.
3. After PRD 0090 exists, add public `NEXT_PUBLIC_APP_URL` for this environment's approved origin and `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` / `NEXT_PUBLIC_AUTH_GITHUB_ENABLED`. Enable only providers configured under the approved safety policy. Test in a controlled preview first; an untested production provider stays disabled.
4. Mark database/AI credentials using Vercel's appropriate secret/sensitive setting where supported. OAuth client secrets remain in Supabase provider configuration; do not import the entire operator credential file into Vercel. No secret belongs in `NEXT_PUBLIC_*`.
5. Save the scoped variables. Do not delete unrelated application settings or change the project's Git production branch. Proceed to deployment action 0100 because new values are not retroactively applied to an existing deployment.

## Verification and rollback

Privately verify names and environment scope, not a screenshot of secret values. Local `.env.local` and Vercel are configured separately. Roll back an incorrect variable to the previous scoped value and redeploy; keep other environments unchanged. Treat a leaked secret as a rotation incident.

Reference: [Vercel environment variables](https://vercel.com/docs/environment-variables).
