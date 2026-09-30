[ ]

[✨🌐] Deliver Google sign-in end to end, including the external application and deployed verification.

Depends on [0090](2026-09-0090-shared-oauth-foundation.md); use [0040](2026-09-0040-zero-setup-recording-context.md) for the final no-setup recording flow. GitHub is not a prerequisite. Follow [shared rules](README.md).

## Application changes

- Add an accessible, localized Continue with Google action to sign-in and registration. Use the shared Supabase provider launcher with provider `google`, PKCE and the real `/auth/callback` path. Avoid duplicated callback/session code.
- Request only identity/profile/email scopes required for sign-in. Do not request Calendar, Gmail, Drive access or offline Google access tokens for this task. Do not persist provider tokens in the account document or export them.
- Successful first sign-in initializes the existing account model and opens the recording home without profile/workspace forms. Repeat sign-in preserves the same authorized account and its data under the safety policy from 0090. Existing email login, logout and session refresh continue to work.
- The Google button is enabled only for a deliberately configured environment. Cancellation and provider errors return to a usable login screen; errors are localized and do not expose provider responses containing credentials.

## External work is part of this PRD

Use the owner's connected browser/admin tools to inspect the correct Google Cloud project, Supabase project and Minute Vercel deployment. Reuse a suitable owned OAuth client if it already exists. Otherwise register a Google OAuth **Web application**, configure the consent/audience/branding required for the intended users and set the actual Supabase Auth callback. Do not register an unrelated project or make up a production domain.

Configure the Google client ID/secret in the matching Supabase Google provider, configure approved app return URLs and enable the provider only after the identity-safety gate is resolved. Store any necessary local administrative credential reference only in ignored `.env.oauth.local`. Set the application variables in ignored `.env.local` and the correct Vercel environments; provider secrets stay in Supabase, not public application variables. Redeploy to pick up build-time changes.

Distinguish provider-registration completion, Google audience/testing restrictions, any external review, application deployment and verified production sign-in. Do not call a test-user-only application production-ready. Use actual owner-approved branding/support/contact details; do not invent them or accept new paid services without authorization.

When access or an owner-only action blocks a step, update the individual handoffs rather than stopping at a generic setup paragraph: [target mapping](../Actions/0010-identify-target-projects.md), [registration](../Actions/0030-register-google-oauth-client.md), [redirects](../Actions/0050-configure-supabase-redirects.md), [provider enablement](../Actions/0060-enable-supabase-google.md), [local environment](../Actions/0080-configure-local-environment.md), [Vercel variables](../Actions/0090-configure-vercel-environment.md), [deployment](../Actions/0100-deploy-minute.md) and [Google verification](../Actions/0110-verify-google-sign-in.md). Add a separate action for a newly discovered verification/domain/email requirement.

## Acceptance

With GitHub disabled, verify Google login for a new user, an existing authorized user and a user outside the test-user list when releasing publicly. Test denial, expired return, refresh, logout/relogin, same-owner password-account continuity and the negative identity-collision cases from 0090. Verify an existing recording/todo survives login and is visible only to its owner. Complete a Record → Stop flow without application typing after provider authentication.

Pass code checks and real local plus deployed smoke tests. Record a sanitized result per environment. Required external steps that remain blocked keep this PRD pending/blocked; a rendered button is not completion. Sources: [Supabase Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google), [Google OAuth configuration](https://developers.google.com/identity/protocols/oauth2/web-server).
