# 0010 — Identify the correct Minute deployment and auth projects

[ ] Status: BLOCKED_ACCESS. Owner dashboard access is unavailable in the authoring session. No deployment domain/project identifiers were inferred from the repository name.

## Steps

1. Open the owner's Vercel dashboard. Find the existing project serving Minute. In its Git/settings and deployment details, verify the repository is `webgptorg/workshop-boilerplate` and identify the deployment made from `app/minute`. Do not select a deployment of `main`, the other apps or workshop branches just because the repository matches.
2. Record the project/team identifiers and the actual intended environment/domain in the ignored operator file described in [README](README.md). `MINUTE_APP_ORIGIN` is an origin such as scheme plus hostname, without a path, query or trailing slash. Obtain it from the dashboard, not a fabricated example hostname. Identify a stable controlled preview origin for testing. Do not change the production branch in this action.
3. Inspect that deployment's Supabase URL configuration privately, then open the matching project in the Supabase dashboard. Confirm the project reference/environment and record `MINUTE_SUPABASE_PROJECT_REF`. From Authentication → Sign In / Providers, copy the actual provider callback into `MINUTE_SUPABASE_AUTH_CALLBACK_URL`. This is normally the project's `/auth/v1/callback`, not Minute's `/auth/callback`.
4. Identify an appropriate owned Google Cloud project and its existing OAuth clients. Record its project ID. Inspect existing GitHub OAuth Apps under `webgptorg` as well. Reuse a suitable client only after verifying its owner, audience, environment and callback; do not modify another application's registration.
5. Store the local development origin as `MINUTE_LOCAL_ORIGIN` (the baseline dev server is `http://localhost:3000`). Record unknown or inaccessible items as blockers; do not fill them with plausible guesses.

## Verification and rollback

The chosen deployment opens Minute, its Git source is the intended branch, and its configured Supabase project matches the dashboard reference. Keep the mapping in ignored `.env.oauth.local` or environment-specific equivalents, not this document. This is a read-only inventory: no rollback or configuration mutation is needed. If no matching deployment/project is found, create a distinct provisioning action with the verified requirements rather than silently creating a replacement here.
