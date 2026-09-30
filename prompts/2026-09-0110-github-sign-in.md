[ ]

[✨🐙] Deliver GitHub sign-in end to end, including the external application and deployed verification.

Depends on [0090](2026-09-0090-shared-oauth-foundation.md); use [0040](2026-09-0040-zero-setup-recording-context.md) for the final recording flow. Google is not a prerequisite. Follow [shared rules](README.md).

## Application changes

- Add an accessible, localized Continue with GitHub action to sign-in and registration. Reuse the shared Supabase launcher/callback with provider `github`; do not duplicate session initialization or implement a second auth stack.
- Request only the profile and verified-email access needed by the Supabase provider. Support a GitHub account whose primary email is private. Do not request repository, organization-administration, workflow or write permissions merely to sign in.
- Do not treat GitHub login/username, a public profile email or a generated noreply address as the immutable application owner. Supabase Auth UUID remains authoritative. Missing usable email/profile data gets an honest supported recovery path, not a fabricated identity or a mandatory workspace form.
- Preserve current account data on valid repeat sign-in and linking under 0090's safety policy. Do not merge two different users by a matching display name or by client-submitted email. Provider tokens must not enter application JSON, backups, logs or committed files.
- Handle revoked authorization, cancellation, unavailable email, expired code and return failure. Keep email authentication, logout, refresh and the disabled-provider state working.

## External work is part of this PRD

Inspect existing owned applications through the owner's connected browser/admin tools. For the built-in Supabase GitHub sign-in integration, register/reuse the compatible GitHub **OAuth App**; a repository-installed GitHub App is not required by this sign-in-only specification. Prefer ownership by `webgptorg` when its administrator access permits it, otherwise record the ownership blocker rather than silently choosing another owner.

Set the approved Minute homepage and the actual Supabase Auth callback. Use separate environment credentials where appropriate; do not assume a provider's callback-count limitation from old documentation. Leave device flow and extra permissions unused unless the selected supported integration actually requires them.

Place client ID/secret into the matching Supabase GitHub provider and enable it only after the shared identity-safety gate. Administrative local references belong in ignored `.env.oauth.local`. Configure application flags/URLs locally and in the correct Vercel environment, then deploy and verify. Do not copy the OAuth secret into `NEXT_PUBLIC_*`, a committed example or an unnecessary Vercel variable.

If any step is blocked, update one precise action file for it: [target mapping](../Actions/0010-identify-target-projects.md), [registration](../Actions/0040-register-github-oauth-app.md), [redirects](../Actions/0050-configure-supabase-redirects.md), [provider enablement](../Actions/0070-enable-supabase-github.md), [local environment](../Actions/0080-configure-local-environment.md), [Vercel variables](../Actions/0090-configure-vercel-environment.md), [deployment](../Actions/0100-deploy-minute.md) and [GitHub verification](../Actions/0120-verify-github-sign-in.md). All external setup is part of completion, not an optional follow-up left implicit.

## Acceptance

With Google disabled, verify new-user and returning-user login, a private-primary-email account, denied consent, revoked authorization, missing usable email, reload and logout/relogin. Verify only the intended identity scopes, correct app/Supabase callbacks and no surprise repository access. Run same-owner continuity and attacker-pre-registration tests from 0090; verify another account cannot read the original workspace or audio.

Complete Record → Stop after provider authentication without application text entry. Pass automated checks and real local/deployed smoke tests, documenting sanitized evidence. Keep the task pending/blocked until required external configuration and tests are complete. Sources: [Supabase GitHub provider](https://supabase.com/docs/guides/auth/social-login/auth-github), [GitHub OAuth app registration](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).
