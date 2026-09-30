# 0020 — Validate the legacy-email identity rollout before enabling OAuth

[ ] Status: BLOCKED_IMPLEMENTATION_AND_ACCESS. Requires [PRD 0090](../prompts/2026-09-0090-shared-oauth-foundation.md), action 0010 and access to the matching Supabase project. Do not enable either provider in production until this gate passes.

## Why this action exists

The inspected README deliberately disables email confirmation. A legacy account may therefore claim a mailbox without proving ownership. Enabling social login without checking this transition can break account continuity or leave a pre-registered password/session attached to the real owner's identity. Do not manually merge accounts merely because the displayed emails match.

## Steps

1. In the selected Supabase project's Authentication → Sign In / Providers → Email, inspect the actual confirmation setting. In Authentication → Users, privately inspect the relevant legacy identity methods. Store only necessary findings under ignored `.local/`; do not export the user list into Git. A timestamp produced by automatic confirmation is not mailbox proof.
2. Have the implementing agent complete 0090's verification-capable email flow and explicit legacy-account policy. Test it on an isolated test project with accounts controlled by the owner. Do not toggle Confirm email first and leave the existing registration UI unable to continue.
3. In that test environment, create a password account claiming the controlled target mailbox through the legacy path, retain its password/session, and then authenticate as the actual mailbox owner through a social provider. Verify the implementation prevents the old unauthorized password/session from retaining access to the resulting owner's data. Also verify a legitimate legacy user retains their original UUID, todos and audio after the approved ownership-verification/linking procedure.
4. Once the implementation and usable confirmation delivery have passed those tests, enable the production email-ownership policy in the Email provider settings using 0090's tested rollout. Do not bulk-set verification flags, delete identities or re-key user data as a shortcut.
5. If historical accounts need an owner decision, mail delivery setup or individual remediation, the implementing agent must supply a separate exact action for each operation based on the inspected state, with private IDs referenced from ignored files. Keep this action blocked until that plan is resolved; a generic recommendation to verify users is not completion.

## Verification and rollback

Record only the environment/date and passed or failed cases here after execution. Detailed test evidence stays in `.local/identity-rollout.md`. Both a legitimate-owner continuity test and the attacker-pre-registration negative test must pass. On failure keep social readiness flags off and providers unexposed. Do not roll back by reinstating a known unsafe identity-linking policy.

Reference: [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking).
