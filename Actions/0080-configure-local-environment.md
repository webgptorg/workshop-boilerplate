# 0080 — Populate the ignored local application environment

[ ] Status: BLOCKED_VALUES_AND_IMPLEMENTATION. Hosted values are unavailable, and the new OAuth variables are specified by PRD 0090 but not implemented by this documentation commit.

## Steps

1. In the owner's checkout of `app/minute`, run the ignore/tracked-file checks in [README](README.md). Create `.env.local` from `.env.example` only if it does not already exist; do not overwrite existing credentials. Edit it locally without printing its contents.
2. From the intended development Supabase project's API settings, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never substitute a secret/service-role key. From Connect, set the server-only `SUPABASE_DATABASE_URL` using the direct/session-pooler URL required by the root README; preserve verified TLS and set `SUPABASE_DATABASE_CA` when necessary.
3. Retain/set server-only `OPENAI_API_KEY` for automatic processing. Keep `ENABLE_TEST_ACCOUNT=false` unless deliberately using an isolated development database under the root README's rules. Never enable it against production.
4. After PRD 0090 implements the contract, set `NEXT_PUBLIC_APP_URL` to `MINUTE_LOCAL_ORIGIN`. Set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` and `NEXT_PUBLIC_AUTH_GITHUB_ENABLED` to true only for the providers deliberately configured in this test environment; leave the other false. Do not enable flags merely because a client was registered.
5. Keep provider client secrets in Supabase provider settings. An optional operator reference stays in `.env.oauth.local`, which the app must not load wholesale. Do not copy that file into `.env.local`.
6. Restart the local server after changing configuration. Follow the implemented callback flow and run the local portion of the corresponding verification action.

## Verification and rollback

Private local files remain ignored and untracked; no secret-prefixed `NEXT_PUBLIC_*` variable exists. The app loads the intended environment and the enabled provider returns to the local callback. Record only pass/fail. To roll back, turn off the affected readiness flag and restore the prior local configuration without discarding unrelated variables. A leaked credential needs rotation.
