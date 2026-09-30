# Minute: external and owner-only actions

## Actual status of this handoff

Prepared 2026-09-30 for `webgptorg/workshop-boilerplate`, branch `app/minute`, alongside the [implementation PRDs](../prompts/README.md). The author inspected the repository through the GitHub connection. The owner's browser, Google Cloud administration, Supabase administration and Vercel administration were not connected for this work; the repository connection does not provide OAuth-app registration access.

**No provider application was registered, no hosted authentication setting or Vercel environment was changed, no real credential file was populated, and no live OAuth smoke test was performed.** The commit adds specifications and these handoffs, not the application implementation. An unchecked action is not proof that the external resource is missing: inspect the actual account before creating anything.

An implementing agent should perform these operations directly when the owner's authorized tools become available. Otherwise the owner can follow the individual instructions. Do not ask the owner to paste passwords, tokens or credential files into chat. Do not mark a provider PRD complete while its required configuration/testing remains blocked.

## Order and independent operations

| Action | Operation | Prerequisites |
| --- | --- | --- |
| [0010](0010-identify-target-projects.md) | Identify the existing Minute deployment and matching auth projects | Owner dashboard access |
| [0020](0020-legacy-identity-safety.md) | Validate and approve the safe legacy-email rollout | 0010; PRD 0090 implemented |
| [0030](0030-register-google-oauth-client.md) | Register/reuse the Google OAuth client | 0010 |
| [0040](0040-register-github-oauth-app.md) | Register/reuse the GitHub OAuth App | 0010 |
| [0050](0050-configure-supabase-redirects.md) | Configure Supabase site/return URLs | 0010; callback contract from PRD 0090 |
| [0060](0060-enable-supabase-google.md) | Configure and enable Supabase Google provider | 0020, 0030, 0050 |
| [0070](0070-enable-supabase-github.md) | Configure and enable Supabase GitHub provider | 0020, 0040, 0050 |
| [0080](0080-configure-local-environment.md) | Populate ignored local application configuration | Implemented variable contract; target mapping |
| [0090](0090-configure-vercel-environment.md) | Configure Vercel application variables | 0010; implemented variable contract |
| [0100](0100-deploy-minute.md) | Deploy the intended implementation commit | Relevant provider/configuration actions |
| [0110](0110-verify-google-sign-in.md) | Verify real Google login and data continuity | Google implementation and deployment |
| [0120](0120-verify-github-sign-in.md) | Verify real GitHub login and data continuity | GitHub implementation and deployment |

Google and GitHub tracks may complete independently. Repeat environment-specific operations for a dedicated test/preview environment and then production; never mix their client secrets or Supabase projects. Do not change unrelated deployments of this multi-branch repository.

## Private local records and variable contract

`.env.local` is the application runtime configuration. `.env.oauth.local` is an operator-only provisioning reference, **not** a file the application automatically loads. For separate environments, use ignored names such as `.env.oauth.preview.local` and `.env.oauth.production.local`. Keep these files on the owner's machine, not in this folder. Use `.local/` for private audit notes/evidence; retain only what is necessary and do not put credentials in screenshots.

Record the selected target using these operator-only names, with real values obtained from dashboards rather than guessed:

- `MINUTE_ENVIRONMENT`, `MINUTE_APP_ORIGIN`, `MINUTE_LOCAL_ORIGIN`, `MINUTE_VERCEL_PROJECT_ID`, `MINUTE_VERCEL_TEAM_ID`, `MINUTE_GOOGLE_CLOUD_PROJECT_ID`.
- `MINUTE_SUPABASE_PROJECT_REF`, `MINUTE_SUPABASE_AUTH_CALLBACK_URL` copied from that project's provider page.
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET` only if a local administrative reference is needed.

Runtime variable names already present in `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_DATABASE_URL`, optional `SUPABASE_DATABASE_CA`, `ENABLE_TEST_ACCOUNT`, `OPENAI_API_KEY`, optional model overrides. PRD 0090 additionally specifies `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` and `NEXT_PUBLIC_AUTH_GITHUB_ENABLED`; these additions are **not implemented by this documentation commit**.

Only public project configuration and public readiness flags use `NEXT_PUBLIC_*`. Database credentials and AI credentials are server-only. Google/GitHub OAuth client secrets belong in the corresponding **Supabase provider settings**, not in the browser bundle or an unnecessary Vercel variable. Do not upload the entire administrative `.env.oauth.local` to Vercel.

Before writing local private files, verify ignore rules without printing their contents:

```bash
git check-ignore -v .env.local .env.oauth.local .vercel/project.json .local/oauth-verification.md
git ls-files -- .env.local .env.oauth.local .vercel .local
```

The first command must report ignore matches; the second must print no tracked private paths. An ignore rule does not remove an already tracked secret. If a real secret was tracked/exposed, stop publication, rotate it and handle history separately; do not assume deleting the current line fixes the exposure. Never use `git add -f` for these paths. Commit only sanitized documentation, placeholders and code.

## Recording outcomes

Each action starts blocked/pending because its required access or implementation is unavailable in the authoring run. After executing it, record the actual environment, date, outcome and sanitized verification in that file. Store account identifiers, screenshots and detailed audit findings only in ignored local evidence. Do not record a secret, OAuth code, cookie, token-bearing URL or real user transcript.

If another owner-only operation becomes necessary, create one additional numbered action with exact navigation/commands, prerequisites, input-file variable names, expected result, verification and rollback. This includes worker provisioning from PRD 0050, legacy identity remediation/email delivery from 0090, and provider branding/domain review when actually required. Do not invent the selected service or claim these conditional actions have already been performed.
