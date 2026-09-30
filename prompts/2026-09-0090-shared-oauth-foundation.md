[ ]

[✨🔐] Add one secure OAuth/session foundation for Google and GitHub without replacing Supabase Auth.

Follow [shared rules](README.md). Provider-specific delivery remains in separate PRDs [0100](2026-09-0100-google-sign-in.md) and [0110](2026-09-0110-github-sign-in.md).

## Repository-specific constraints

Read `components/auth-gate.tsx`, `app/layout.tsx`, `app/[[...path]]/page.tsx`, `lib/supabase/browser.ts`, `lib/supabase/server.ts`, `lib/account.ts`, `lib/store.ts`, `.env.example` and `public/sw.js`. The current browser client has `detectSessionInUrl: false`; all pages are wrapped by AuthGate. Merely adding OAuth buttons will not implement a working return flow.

## Requirements

- Retain Supabase as the identity authority and immutable Auth UUID as the data/storage owner. Reuse the existing browser session and verified bearer-token API model; do not install another authentication stack or maintain a parallel users/password table.
- Implement a shared provider launcher and a real `/auth/callback` flow using the installed Supabase SDK's supported PKCE path. Configure `flowType: "pkce"` and deliberately choose exactly one code-exchange owner. An explicit client callback may keep automatic URL detection disabled and call `exchangeCodeForSession` once; do not also let another listener exchange the same code.
- The callback must execute before the authenticated workspace UI is required. Adjust the root protection/routing boundaries so unauthenticated callbacks are not trapped behind AuthGate, while account pages remain protected. Keep the verifier and exchange in the same browser storage context; do not copy an SSR-cookie example into this localStorage-session architecture without migrating and testing the complete session model.
- After a verified session exists, initialize/load account state once and return to a valid internal destination or the recording home. Keep the current stale-auth-generation protection and clear account state on logout/switch. A provider profile can supply a new account's display name, not overwrite existing preferences or IDs.
- Validate return targets as same-origin internal paths; reject protocol-relative, external, encoded-backslash and unexpected scheme/host variants. Provider callback URLs and the app return URL are different hops. Never trust an arbitrary Host/forwarded-host header to build an authorized production redirect.
- Handle consent denial, expired/replayed code, missing verifier, overlapping login attempts, unavailable provider, load failure and refresh/logout visibly without leaking codes/tokens. Remove OAuth parameters after handling. Keep callbacks, sessions and authenticated responses out of service-worker caches and logs.
- Add public readiness flags `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` and `NEXT_PUBLIC_AUTH_GITHUB_ENABLED`, default false, and `NEXT_PUBLIC_APP_URL` for the configured deployment origin. These are proposed additions, not variables already read by the baseline. Document validated local/preview/production values and build-time behavior in `.env.example` using placeholders only. A flag is UI availability, never authorization.

## Existing-email safety is a release gate

The baseline deliberately accepts email/password signups without proving email ownership. Audit the actual hosted settings and legacy identities before enabling social providers. An auto-confirmed email timestamp is not evidence that its owner controlled the mailbox. Do not implement application-side merging by email, relabel all old users as verified, re-key storage, or bulk-delete identities.

Implement and test a safe transition using supported Supabase identity operations: new password signups require actual email-ownership proof; existing legitimate users retain access to their original UUID/data; linking an existing account requires appropriate authenticated ownership proof. Determine and document treatment of legacy unverified/auto-confirmed identities, stale sessions and credentials before automatic provider linking is exposed. A malicious pre-registration must not grant continuing access to the real owner's later OAuth account. If provider policy cannot satisfy that test with current configuration, keep provider flags disabled and record the precise rollout blocker instead of weakening the test.

Do not silently enable confirmation without implementing its registration response and usable confirmation/error path. Required email-delivery or legacy-account remediation provisioning belongs to this task and must receive separate Actions instructions if access is unavailable. This security work must not introduce an extra profile/workspace form for successful OAuth users.

## Acceptance and delivery

Unit/integration tests cover callback-once, valid/invalid return paths, cancellation, expired code, duplicate callbacks, account initialization, logout, refresh and switching users with pending writes. Hosted tests cover real password/OAuth identity collision, verified same-owner continuity, a different user, and attacker pre-registration with an old password/session. Verify RLS and private audio isolation. Both provider flags off leaves a working email path; either provider may subsequently ship alone.

Update README/AGENTS statements that OAuth is absent only when implemented. Run shared checks. Complete or explicitly block [Actions 0020](../Actions/0020-legacy-identity-safety.md) and related configuration actions. References: [Supabase PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking), [redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls).
