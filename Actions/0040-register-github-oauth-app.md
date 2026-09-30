# 0040 — Register or reuse the GitHub OAuth App

[ ] Status: BLOCKED_ACCESS. The connected repository API can commit files but does not expose OAuth-app administration. Requires action 0010 and the owner's authorized GitHub browser.

## Steps

1. Open GitHub → profile menu → Your organizations → `webgptorg` → Settings → Developer settings → OAuth Apps. Inspect existing registrations. Use an organization-owned registration when administrator access permits it; otherwise record the ownership/access blocker rather than silently placing it under another owner.
2. Select the verified compatible Minute OAuth App, or choose New OAuth App/Register a new application. This task uses the OAuth App supported by the Supabase GitHub provider, not an installation granting repository permissions.
3. Set Application name to the owner-approved Minute name. Set Homepage URL to `MINUTE_APP_ORIGIN` from the ignored operator file. Set Authorization callback URL to the exact `MINUTE_SUPABASE_AUTH_CALLBACK_URL`. Keep environment registrations separated where needed.
4. Register/save the app. Leave device flow unused. Do not add repository, organization-management or workflow privileges for a login-only integration. Check current provider compatibility for any token-expiry option; do not disable a security default based on an old guide.
5. Generate a client secret if a new one is required. Store the values only in the owner's credential manager or ignored `.env.oauth.local` as `GITHUB_OAUTH_CLIENT_ID` and `GITHUB_OAUTH_CLIENT_SECRET`. Never paste them into Git, screenshots, logs or chat.

## Verification and rollback

Verify owner, app type, homepage and exact Supabase callback. This step does not itself configure Supabase or implement login. Remove only a newly created unused incorrect registration; do not revoke a shared client's credentials without checking its consumers. Rotate any exposed secret.

References: [GitHub OAuth app creation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), [Supabase GitHub provider](https://supabase.com/docs/guides/auth/social-login/auth-github).
