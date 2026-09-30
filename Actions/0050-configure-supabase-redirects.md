# 0050 — Configure Supabase application return URLs

[ ] Status: BLOCKED_ACCESS. Requires action 0010 and the callback implementation/contract from PRD 0090.

## Steps

1. Open the matching project at `https://supabase.com/dashboard`. Go to Authentication → URL Configuration. Privately record the previous settings for rollback without capturing secrets.
2. Set Site URL to the intended application's verified `MINUTE_APP_ORIGIN` for that Supabase environment. Preserve unrelated authorized applications if the project is shared; do not silently repoint their default return location.
3. Add the exact app callback return URL formed from `MINUTE_APP_ORIGIN` plus `/auth/callback`. Add `MINUTE_LOCAL_ORIGIN` plus `/auth/callback` only to the intended development/test configuration. Add the exact controlled preview callback where testing requires it.
4. Prefer explicit known URLs. Do not broadly allow every `vercel.app` domain or arbitrary wildcard hosts. A preview deployment that changes hostname needs an explicitly reviewed callback mapping, not a fabricated constant.
5. Save and re-open the settings to verify the values. Compare them privately with the callback passed by the implemented frontend.

## Verification and rollback

The two redirect hops must stay distinct: Google/GitHub returns to Supabase's `MINUTE_SUPABASE_AUTH_CALLBACK_URL`; Supabase returns to Minute's `/auth/callback`. The application callback must be reachable without an already initialized workspace and must validate any internal return destination. Login verification is performed in actions 0110/0120, not presumed here.

On an incorrect change, restore the previous Site URL and remove only the newly added bad entries. Do not remove working URLs used by other consumers.

Reference: [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
