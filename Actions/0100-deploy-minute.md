# 0100 — Deploy the intended implementation commit

[ ] Status: BLOCKED_ACCESS_AND_IMPLEMENTATION. Do not mistake this PRD-only commit for the OAuth/recording implementation. Requires the implemented feature commits, relevant provider actions and action 0090.

## Steps

1. In the verified Vercel project, inspect the source branch and commit of the candidate deployment. It must contain the intended `app/minute` implementation, not merely these specifications and not another application branch.
2. Run the repository's required checks in a configured checkout: `npm run check` and `npm run build`. Resolve failures. For changes to persistence, run the migration/RLS tests and verify the actual hosted migration path; do not mark unrun tests passed.
3. Create/redeploy the controlled Preview deployment through the project's Deployments controls or its existing Git deployment workflow. Confirm it picks up the updated environment. Verify the stable preview origin matches the configured callback allowlist.
4. Inspect the finished build/runtime and privately verify the app, callback reachability, startup migrations and existing email login. Do not paste environment dumps or token-bearing callback URLs into logs/evidence. Run actions 0110/0120 for the enabled provider before production activation.
5. Once preview tests and the identity-safety gate pass, deploy/promote the intended build to the owner-approved production target using production configuration. Do not change `main` or the project's production-branch setting as an accidental shortcut. If the desired target cannot be selected with current permissions, record the exact blocker.
6. Repeat the production smoke tests for each enabled provider. Keep a sanitized note of deployment identifier, implementation commit, environment and pass/fail; do not claim success merely because the build turned green.

## Verification and rollback

The live target serves the correct commit, the callback is reachable, email login remains usable and the relevant real provider tests pass. On failure disable the affected provider exposure and use the project's prior known-good deployment without reversing applied database migrations blindly. Verify old and new deployment compatibility with any append-only migration.
