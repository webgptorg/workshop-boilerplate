# 0030 — Register or reuse the Google OAuth Web client

[ ] Status: BLOCKED_ACCESS. Requires action 0010 and the owner's Google Cloud browser/admin access.

## Steps

1. Open `https://console.cloud.google.com/` and select the verified `MINUTE_GOOGLE_CLOUD_PROJECT_ID` from the ignored operator file. In Google Auth Platform, inspect existing Clients before creating one.
2. Configure Branding with the real Minute application name and owner-approved support/developer contact. Configure Audience for the intended users. A public application needs the appropriate external audience; a test environment may use an explicit test-user list. Do not invent contact details, legal pages or verified domains.
3. In Data Access, request only sign-in identity scopes: `openid`, email and profile. Do not add Gmail, Calendar or Drive permissions.
4. In Clients, create a **Web application** client, or edit the verified compatible one. Set the authorized application origin to `MINUTE_APP_ORIGIN`. For a separate development client, use `MINUTE_LOCAL_ORIGIN` as appropriate. Set the authorized redirect URI to the exact `MINUTE_SUPABASE_AUTH_CALLBACK_URL` copied from Supabase. Do not substitute the frontend `/auth/callback` URL for this provider-to-Supabase hop.
5. Save. Keep the resulting client ID/secret in the owner's credential manager or, when needed for handoff, in ignored `.env.oauth.local` under `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`. Do not download the credentials JSON into a tracked directory or paste it into an action file.
6. Check the audience/publication status. If intended public access requires publication or review, complete the owner-authorized steps or create a separate precise review action. Do not report test-user-only access as public readiness.

## Verification and rollback

Verify the selected Cloud project, Web client type, exact callback and minimal scopes. This action registers the client; it does not enable Supabase or verify login. If a newly created unused client is wrong, remove that client only; do not delete shared projects/clients. A disclosed secret must be rotated rather than copied into documentation.

References: [Google OAuth setup](https://developers.google.com/identity/protocols/oauth2/web-server), [Supabase Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).
