# PRD: Real user system for "Společný stůl"

Status: **Draft for review**. This document defines requirements only; it is not an implementation plan.
Date: 2026-09-23. Replaces the mocked users from [initial-version.md](initial-version.md).

## 1. Context

### 1.1 What exists today

The first version uses three hardcoded demo accounts. There are real sessions, but everything around identity is mocked.

| Area | Current state | Where |
| --- | --- | --- |
| Accounts | 3 seeded users (`adam`, `jidelna`, `petra`), no way to create more | `lib/seed.ts` |
| Passwords | Plaintext map `DEMO_PASSWORDS` in the API route, prefilled in the login form | `app/api/action/route.ts`, `components/forms.tsx` |
| Sessions | Random 32-byte token, HttpOnly cookie `stul-session`, 24 h expiry, **stored in plaintext** in `sessions` | `app/api/action/route.ts`, `lib/database.ts` |
| CSRF | `Origin` header check on the action endpoint | `app/api/action/route.ts` |
| Parent–child link | Does not exist. Selections and preferences use hardcoded `child_id = 1` | `lib/database.ts`, `lib/mutations.ts` |
| Child identity | "Adam Novák · 6. B" is hardcoded in the UI | `components/community.tsx`, `components/dashboard.tsx` |
| Roles | Single global `role` column: `pupil`, `staff`, `parent` | `lib/types.ts` |
| Canteen / school | Not modeled; the app assumes one canteen | — |
| Account management | None: no invitation, password reset, deactivation, or deletion | — |

### 1.2 Why it matters

The [raw idea](../docs/00-surovy-napad.txt) states the goal as "not a demo … a usable tool for routine planning." The idea only works if real parents can submit ideas and receive answers tied to their own children. That requires real identities and a real parent–child relationship.

### 1.3 Product principles inherited from the raw idea

These principles shape every decision below:

1. **This is the canteen manager's tool.** Account administration must *save* the manager work. Any flow that adds per-parent manual work for the manager is a defect.
2. **The manager has the final word.** The canteen controls who belongs to it.
3. **The system sends nothing out on its own.** This covers menus and replies. Whether it also covers transactional account emails is decision **D2**.
4. **Allergens and safety are not the model's business.** Health data needs deliberate handling (see §8).

## 2. Goals and non-goals

### Goals

- G1: Real people can get an account, sign in, recover access, and leave, with no developer involved.
- G2: Every parent sees and acts only for **their own** children. Every pupil acts only for themself.
- G3: Onboarding a whole school takes the manager hours, not days, and does not require her to collect parent emails.
- G4: Security and privacy are good enough to hold personal data of minors in the Czech Republic (GDPR).
- G5: Local development, the automated tests, and the public demo keep working without real credentials.

### Non-goals (this iteration)

- Login via school systems (Bakaláři, Edookit, Google Workspace, Microsoft 365). The data model must not block it later.
- Synchronization with iCanteen accounts, orders, or payments.
- A self-service UI for creating a new canteen. The platform operator does this with a script.
- Structured allergen or diet profiles. These belong to a separate PRD (see §8.3).
- Native mobile apps.

## 3. Actors

| Actor | Who | Typical device | Notes |
| --- | --- | --- | --- |
| **Canteen manager** (`manager`, *vedoucí jídelny*) | 1–2 per canteen | Office PC | Owns the canteen. Plans and approves menus, manages people. |
| **Canteen staff** (`staff`) | 0–10 per canteen | Shared kitchen PC or tablet | Edits menus and reads feedback. Cannot manage people or approve (see **D4**). |
| **Parent / guardian** (`guardian`) | Hundreds | Personal phone | May have several children, possibly at several canteens. A child may have 2+ guardians. |
| **Pupil** (`pupil`) | Hundreds; age 6–19 | Own phone, family device, or class tablet | Many young pupils have no email. An account is optional. |
| **Adult diner** (teacher, employee) | Tens | Own device | Eats in the canteen. Behaves like a pupil acting for themself (see **D6**). |
| **Platform operator** | Us | CLI | Creates canteens and their first manager. Has no access to canteen data through the UI. |

## 4. Core concept: separate *people who log in* from *people who eat*

The most important modeling decision: **a diner (*strávník*) is not a user account.**

- A **Diner** is a person who eats in a canteen: a child in 2.A, or a teacher. Menu selections and preferences belong to the diner.
- A **User** is a person who signs in. Feedback and ideas are authored by a user.
- A **Guardianship** links a guardian user to a diner. A child can have many guardians, and a guardian can have many children.
- A pupil account is an optional **self-link** from a user to their own diner record.

This removes the hardcoded `child_id = 1` and correctly supports these cases:

- A 7-year-old with no account whose parents choose for them.
- Two separated parents who each see the same child.
- A parent with children in two classes or two schools.
- A teenager who selects their own meals while the parent keeps visibility.

### 4.1 Conceptual data model

```
Canteen ─┬─< Membership >── User ──< Credential
         │     (role: manager | staff)      (password hash, later: passkey, SSO)
         │
         └─< Diner ──< Guardianship >── User          (guardian ↔ child)
               │  └──< DinerAccount   >── User          (pupil/adult ↔ own diner record, 0..1)
               │
               ├─< Selection  (diner, date, meal)
               ├─< Preference (diner)
               └─< PairingCode (single-use, expiring)

User ──< Session (token hash, expiry, device label)
User ──< Feedback / Idea  (authored by a user, optionally "on behalf of" a diner)
AuditEvent (actor, action, target, time)
Invitation (canteen, role, email?, token hash, expiry, used_at)
```

Rules:

- R1: Every canteen-scoped row (`meals`, `ideas`, `feedback`, `diners`, …) carries a `canteen_id`, even while only one canteen exists (see **D5**).
- R2: A user's email is globally unique. Usernames are only for pupil logins without email and are unique per canteen.
- R3: A Diner holds only: display name, class/group, diner type (`pupil`/`adult`), external number (e.g., the iCanteen *číslo strávníka*), and active/archived status. It holds nothing else.
- R4: Nothing is ever hard-deleted by default; deactivation comes first. Erasure is a separate, explicit flow (§7.6).

## 5. Onboarding: how a real school gets in

This is the flow that decides adoption. The manager must not type in hundreds of parent emails.

### 5.1 Canteen setup (platform operator, once)

`npm run canteen:create -- --name "…" --manager-email "…"` creates the canteen and a one-time manager invitation link. No UI is needed.

### 5.2 Diner import (manager, once per school year)

1. The manager uploads a CSV or XLSX export (for example from iCanteen or the school register) with columns: name, class, diner number, type.
2. The system shows a preview: new diners, changed classes, missing diners (candidates for archiving), and invalid rows with reasons.
3. The manager confirms. Nothing is written before confirmation.
4. Re-importing is idempotent, matched by diner number. The import is the school-year rollover.

Manual add, edit, and archive of individual diners must also exist.

### 5.3 Pairing parents to children: *pairing codes* (recommended, see D1)

1. After import, the manager downloads a **printable PDF of pairing letters**, one per diner. Each letter contains the child's name, class, a short code (e.g. `KX7-M4P-Q2`), and a QR code linking to the registration page with the code prefilled.
2. The school distributes the letters through its usual channels (class teacher, school system message). The canteen does not need parent emails.
3. The parent opens the link, creates an account (email + password), and the child is linked.
4. A parent with more children enters more codes from their account.
5. A code is **reusable by up to N guardians** (default 2) and expires at the end of the school year. The manager can regenerate a code, which invalidates the old one, and can remove a guardianship.

Why this approach: it moves the per-parent work from the manager to the parent. It needs no email collection. It also mirrors how Czech schools already distribute access to their school information systems.

### 5.4 Pupil accounts

- A guardian can **create a login for their child** from their own account: a username plus a password, or a printable **QR login card** for young children (see D3).
- An older pupil with their own email can register with a pairing code, like a parent. The link type is then "self", not "guardian".
- A guardian can revoke the pupil login at any time.

### 5.5 Staff accounts

The manager invites staff by email or by a copyable one-time link, chooses the role, and can revoke it.

## 6. Authorization

All checks run on the server, on every request, using the session user. The client never sends a user id or role. The UI hides unavailable actions, but that is not a security control.

### 6.1 Permission matrix

| Capability | Manager | Staff | Guardian | Pupil / adult diner | Anonymous |
| --- | --- | --- | --- | --- | --- |
| View published weekly menu of a canteen | ✓ | ✓ | ✓ (their children's canteens) | ✓ (own canteen) | see **D7** |
| Edit meals | ✓ | ✓ | — | — | — |
| Approve / apply an idea proposal, reply to ideas | ✓ | see D4 | — | — | — |
| Read all feedback and ideas of the canteen | ✓ | ✓ | — | — | — |
| Select a meal for a diner | — | — | linked children only | own diner only | — |
| Edit diner preferences | — | read | linked children only | read own | — |
| Rate a meal | — | — | ✓ | ✓ | — |
| Submit an idea | — | — | ✓ | see **D8** | — |
| Import, edit, or archive diners | ✓ | — | — | — | — |
| Generate or print pairing codes, remove guardianships | ✓ | — | — | — | — |
| Invite or revoke staff | ✓ | — | — | — | — |
| Create or revoke a pupil login | — | — | for linked children | — | — |
| View the canteen audit log | ✓ | — | — | — | — |

### 6.2 Rules

- A1: Every data access is scoped by `canteen_id` from the user's memberships or diner links, never from request input alone.
- A2: An action on a diner requires an active guardianship or self-link. If the check fails, the server responds `404`, not `403`, so the response does not reveal that the diner exists.
- A3: A user may hold different roles in different canteens. A cook at school A may also be a parent at school B. The UI has a **context switcher** (canteen × role, and child for guardians) that replaces today's role button. The existing per-role color tints apply to the active context.
- A4: Revoking a role, guardianship, or pupil login takes effect on the next request, not at session expiry.
- A5: Feedback and ideas show the author's display name to the canteen. Guardians see only their own. Whether pupil ratings are anonymous to staff is **D9**.

## 7. Account lifecycle

### 7.1 Registration

- By invitation link or pairing code only. There is **no open sign-up** without a code, because the canteen controls membership (principle 2).
- Required fields: email, password, display name. Registration also requires consent to the terms and an acknowledgement of the privacy notice.
- Email verification is required before the account can act (see D2 for delivery).

### 7.2 Sign-in

- Email (or pupil username) + password. QR card for pupils if D3 is accepted.
- Error message: "Nesprávný e-mail nebo heslo." The message is identical for unknown accounts, wrong passwords, and deactivated accounts.
- "Zůstat přihlášen" (stay signed in) extends the session (§9).

### 7.3 Password recovery

- The user requests a reset and receives a one-time link valid for 30 minutes. The response is identical whether or not the email exists.
- A pupil without email is reset by their guardian. A guardian without working email is reset by the manager, who generates a one-time link and hands it over in person. Every manager-initiated reset is logged in the audit log.
- A reset revokes all of the user's sessions.

### 7.4 Account settings

Change display name, email (with re-verification), and password. View active sessions and sign out of others ("Odhlásit ostatní zařízení"). See linked children and add a child by code. Manage pupil logins.

### 7.5 Deactivation

- A manager archives a diner, for example after graduation. Guardians keep read access to history for 30 days (see D10), then the link ends.
- A manager revokes a staff member. The user keeps their account and any guardian roles.
- A user whose last link or membership ends keeps a working account with an empty state and an "add child by code" prompt.

### 7.6 Deletion and data export (GDPR)

- A user can export their data (JSON) and delete their account from settings.
- On deletion, feedback and ideas are **anonymized**, not deleted. The author becomes "Smazaný uživatel" (deleted user). The canteen keeps its planning history and its replies stay meaningful.
- On manager request, a diner's erasure removes selections and preferences and anonymizes the diner record.
- Retention: diners that stay archived and inactive sessions are purged automatically after a configurable period (default: archived diners after 1 school year, expired sessions after 30 days).

## 8. Privacy and compliance

This section needs review by someone qualified in Czech data-protection law before launch. It is not legal advice.

### 8.1 Roles

- The school or canteen operator is the **controller**. We (the platform operator) are a **processor**, which requires a data processing agreement (*zpracovatelská smlouva*).
- Data is hosted in the EU.

### 8.2 Minors

- Most diners are children. The Czech age of digital consent is 15. For younger pupils, the default is that accounts are created by a guardian (§5.4), never through open self-registration.
- Pupil accounts collect no email or other contact data unless the pupil registers on their own with a pairing code.

### 8.3 Health data risk in free-text preferences

The current "preferences" field is free text written by parents. Parents *will* write allergies and diagnoses into it, and that is special-category health data under Article 9 GDPR.

Requirements for this iteration:

- The field carries a visible note that it is not a replacement for the canteen's official diet or allergy process.
- Access is limited to the linked guardians, the pupil, the manager, and staff.
- The field is included in export and erasure.

A structured allergy or diet profile is **out of scope** and needs its own PRD and legal basis.

### 8.4 Privacy documents

A privacy notice (*informace o zpracování osobních údajů*) and terms of use must be linked from registration and from the footer. The template is owned by the controller.

## 9. Security requirements

| # | Requirement |
| --- | --- |
| S1 | Passwords are hashed with a memory-hard KDF (`scrypt` from `node:crypto`, or Argon2id) with per-user salt and parameters stored for future upgrades. No plaintext anywhere, including seeds and logs. |
| S2 | Password policy follows NIST SP 800-63B: minimum 10 characters for adults and 8 for pupil logins, no composition rules, a check against a short list of common or breached passwords, and paste allowed. |
| S3 | Session, invitation, reset, and pairing tokens are stored **only as SHA-256 hashes**. This fixes the current plaintext `sessions.token`. |
| S4 | Sessions: sliding idle timeout of 30 days with "stay signed in" and 12 hours without it, plus an absolute limit of 90 days. The session id is rotated on login and privilege change. Cookie flags: `HttpOnly`, `Secure` in production, `SameSite=Lax`, `__Host-` prefix. |
| S5 | Rate limiting per IP and per account on sign-in, reset, registration, and pairing-code entry. Progressive delay applies after 5 failures; there is no permanent lockout that an attacker could trigger. |
| S6 | Pairing codes have at least 40 bits of entropy, exclude ambiguous characters, and are rate-limited (S5) so they cannot be guessed at scale. |
| S7 | CSRF protection: keep the `Origin` check and extend it to all state-changing endpoints, including sign-in and sign-out. |
| S8 | Timing-safe comparisons. There is no account enumeration through messages, status codes, or timing. |
| S9 | An audit log records sign-ins (success and failure), resets, role changes, guardianship changes, imports, exports, and deletions, with actor, target, time, and IP. It is readable by the manager for their canteen and retained for 1 year. |
| S10 | Two-factor authentication (TOTP or passkey) is **optional** in this iteration and recommended for managers. See D11 on whether to require it. |
| S11 | Secrets (session pepper, email provider key) are read from environment variables. The app refuses to start in production if they are missing. |

## 10. Demo, development, and tests

The public demo and the test suites depend on the mocked accounts today. The mock must not leak into production.

- `IS_DEMO_MODE` (environment variable, default `false`) seeds the three current personas as ordinary users: real hashes, a real guardianship between Petra and Adam, and a staff membership for Jana. It also shows the demo-account shortcuts on the login screen.
- With `IS_DEMO_MODE=false`, no demo user exists, the login form shows no hints, and the server does not recognize the `DEMO_PASSWORDS` shortcut. Both the constant and the prefilled form values are removed.
- Tests create their fixtures through the same domain functions that production uses (create canteen → import diners → register with a code), not through direct SQL inserts.
- Migration: the existing SQLite data (1 child, 3 users) is migrated to the new schema by a versioned migration, not by recreating the database. From this point, schema changes need a migration mechanism (`schema_version` table).

## 11. UX requirements

Follow the existing copy rules in [initial-version.md](initial-version.md): no taglines, no filler subheadlines. All UI text is in Czech.

| Screen | Key content |
| --- | --- |
| Přihlášení (sign-in) | Email/username, password, "Zůstat přihlášen", "Zapomenuté heslo", "Mám kód od školy" (I have a code from the school) |
| Registrace s kódem (registration with code) | Code (prefilled from QR), child name + class shown for confirmation *before* the account is created, email, password, name, consents |
| Přijetí pozvánky (accept invitation) | Role and canteen shown, set password |
| Obnova hesla (password reset) | Request form, set new password |
| Můj účet (my account) | Profile, password, sessions, linked children, "Přidat dítě kódem" (add child by code), pupil logins, data export, account deletion |
| Kontext (switcher) | Canteen × role × child. Visible whenever the user has more than one context. Replaces the current role button. |
| Lidé (manager: people) | Diners by class with guardian count and pairing status. Import. Printing of pairing letters. Staff and invitations. Audit log. |

Accessibility: the forms work with a password manager (`autocomplete` attributes), with a keyboard, and at 320 px width. Error messages are specific, name the field, and stay polite.

## 12. Acceptance criteria

The feature is done when all of these pass as automated tests (domain tests plus Playwright):

1. With `IS_DEMO_MODE=false`, the database contains no user until `canteen:create` runs. The source code contains no plaintext passwords.
2. A manager accepts an invitation, imports a 30-row CSV, sees a correct preview, confirms, and downloads 30 pairing letters.
3. A parent registers with a code and sees exactly that child. A second parent registers with the same code and sees the same child. A third attempt with that code is refused.
4. Parent A cannot read or change the selection, preferences, or feedback of a child they are not linked to. The attempt returns `404`, and a test covers every diner-scoped action.
5. A parent with two children switches between them. Their selections are independent.
6. A parent creates a pupil login. The pupil signs in and selects only their own meals. After the parent revokes the login, the pupil's next request fails.
7. Staff cannot access people management. A manager who revokes a staff member removes that access immediately.
8. Password reset works end to end and revokes all old sessions. An unknown email gets the same response as a known one.
9. After 5 failed sign-ins, a further attempt is delayed. The audit log contains the failures.
10. Session tokens, reset tokens, and pairing codes are not stored in plaintext; a test inspects the database.
11. Account deletion anonymizes the user's ideas and feedback. The canteen's view still shows them as "Smazaný uživatel".
12. The existing demo database migrates without data loss.
13. `npm run check` and `npm run build` pass.

## 13. Success metrics

Measured after the first real school year starts:

- **≥ 60 %** of diners have at least one linked guardian within 4 weeks of distributing the letters.
- The manager spends **< 2 hours total** on account administration during the first month. This is measured by asking her, per the raw idea's "did it save her work" test.
- **< 5 %** of guardians need manager help to regain access.
- Zero cross-family data exposure incidents.

## 14. Implementation constraints (for the later implementation prompt)

- Follow `AGENTS.md` and the coding rules in `initial-version.md`: branded `AppError` with `spaceTrim`, `UPPER_SNAKE_CASE` constants, `is` prefix for booleans, no abbreviations, and files of at most 300 lines.
- Split today's single `app/api/action/route.ts` into separate auth, account, and people endpoints (or server actions). Keep authorization in one module in `lib/`, not scattered through mutation handlers.
- Prefer `node:crypto` and the existing `node:sqlite` over new dependencies. Any auth library must be justified against D12.
- Email delivery, if D2 is accepted, goes behind a small interface with a console implementation for development and tests.

## 15. Decisions needed

Each decision has a recommendation. **Bold** marks the recommended option.

| # | Question | Options | Recommendation and reasoning |
| --- | --- | --- | --- |
| D1 | How are parents linked to children? | **Printed pairing codes** · manager enters parent emails · import parent emails from school register | Pairing codes. No email collection, and the least manager work (principle 1). |
| D2 | Does the system send transactional email (verification, reset, invitations)? | **Yes, via EU transactional provider** · no email, manager hands out links | Yes. Without email, every forgotten password becomes manager work. The "sends nothing out" principle is about menus and replies, not account security. Keep the manual link as a fallback. |
| D3 | How do young pupils sign in? | **Guardian-created username + password, plus optional QR card** · no pupil accounts in v1 | Username + password first. The QR card follows if teachers ask for it for class tablets. |
| D4 | Do we split `manager` and `staff`? | **Yes, two roles** · single staff role | Yes. The raw idea says the manager approves. Staff editing without approving keeps that line explicit. |
| D5 | Multi-canteen now? | **`canteen_id` everywhere now, single-canteen UI** · full multi-tenant UI · defer | Add the column now. Retrofitting tenancy later is the most expensive migration there is. |
| D6 | Are adult diners (teachers) in scope? | **Yes, as self-linked diners** · later | Yes. It costs almost nothing given §4, and the raw idea explicitly counts adults. |
| D7 | Can anonymous visitors see the menu? | Yes (like today and iCanteen) · **Per-canteen setting, default on** · no | A per-canteen setting. Many canteens publish menus publicly anyway. |
| D8 | Can pupils submit ideas? | Yes · **Only 12+ or with guardian approval** · no | Needs product input: it affects the idea quota problem from the raw idea. |
| D9 | Are pupil ratings anonymous to staff? | **Anonymous by default** · named | Anonymous. Children rate more honestly and it reduces personal-data exposure. |
| D10 | Grace period after a diner is archived | **30 days read-only** · immediate | 30 days. |
| D11 | Is 2FA mandatory for managers? | Mandatory · **Optional, strongly prompted** | Optional in v1 to avoid blocking adoption. Revisit after launch. |
| D12 | Custom auth vs. a library (e.g. Better Auth, Auth.js) | **Custom on `node:crypto`** · library | Custom. Sessions already exist and there is no OAuth in scope. A library mainly pays off once SSO arrives. Revisit when school SSO is prioritized. |

## 16. Open questions (need an answer from a real canteen)

1. Can iCanteen or the school register export diners with a stable diner number? In what format?
2. Who realistically distributes the pairing letters: the class teacher, the canteen, or the school office? This decides whether the PDF is per class or per diner.
3. Does the school already have a data processing agreement template, and who signs it?
4. Do kitchen staff share one device and one account today? If yes, individual staff accounts need a fast user switch.
5. How are separated parents with a court restriction handled today? The manager must be able to remove a guardianship. Should a note field or a reason be recorded?
