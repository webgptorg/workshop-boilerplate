Replace the mocked users of "Společný stůl" with a real user system

- This builds on the [first version](initial-version.md). Its coding standards still apply.
- Do a proper analysis of the current auth, sessions and hardcoded `child_id = 1` before you start.

## Diners and users

- A diner (strávník) is not a user account.
    - **Diner** is who eats: name, class, diner number, type (pupil / adult). Selections and preferences belong to the diner.
    - **User** is who logs in. Feedback and ideas are authored by the user.
- A parent can have more children, a child can have more parents.
- A pupil account is optional, a young child has no account and parents choose for them.
- Teachers and other adults who eat in the canteen are diners linked to their own account.
- Add `canteen_id` to all canteen data now, even though the UI works with one canteen.

## Roles

- **Manager** (vedoucí jídelny): everything staff can do, plus approving idea proposals and managing people.
- **Staff**: manages meals, reads feedback and ideas.
- **Parent**: acts only for their linked children.
- **Pupil**: acts only for themself, including submitting ideas.
- **Anonymous visitor**: sees the weekly menu.
- One user can have more roles, for example a cook who is also a parent. Replace the role button with a switcher of canteen, role and child.
- Check all permissions on the server. When a user touches a diner that is not theirs, respond `404`.

## Onboarding

The manager must not do work per parent. She does not collect parent emails.

1. Canteen and its first manager are created by a CLI script.
2. The manager imports diners from the iCanteen CSV export once per school year, sees a preview and confirms. Re-import matches by diner number and archives missing diners. Parents can still read an archived diner for 30 days.
3. The manager prints pairing letters, one per diner, with a code and a QR code.
4. The parent registers with the code and the child is linked. One code works for max 2 parents. The manager can regenerate the code and remove a link with a recorded reason.
5. The parent can create a username and password for their child.
6. The manager invites staff by a one-time link.

There is no registration without a code or invitation.

## Accounts

- Login by email or pupil username and password.
- Staff share one kitchen device, so switching between staff accounts on it must be fast.
- Password reset by email. A pupil is reset by the parent, a parent without email by the manager.
- My account: name, email, password, sign out other devices, linked children, add child by code, export my data, delete my account.
- Deleted users are anonymized as "Smazaný uživatel", their ideas and feedback stay for the canteen.
- Pupil ratings are anonymous for the canteen.
- Preferences are free text and parents will write allergies there. Show that it does not replace the official diet and allergy process of the canteen.

## Security

- Hash passwords with `scrypt` from `node:crypto`, no new auth library.
- Store session, reset, invitation and pairing tokens only as hashes.
- Rate limit login, reset, registration and code entry.
- Do not reveal whether an account exists.
- Log logins, resets, role and link changes, imports and deletions. The manager can see the log for her canteen.
- Send emails through a small interface; in development and tests it only prints to the console.

## Demo and migration

- The current three accounts exist only when `IS_DEMO_MODE` is set, as real users with hashed passwords. Petra is linked to Adam.
- Without it, there are no demo users, no password hints and no `DEMO_PASSWORDS`.
- Migrate the existing SQLite data with a versioned migration, do not recreate the database.
- Tests create users through the same flow as production: canteen, import, registration with code.

## Done when

- A parent with a code sees exactly their child and cannot read or change data of another child.
- A parent with two children switches between them.
- A revoked staff member or pupil login loses access on the next request.
- No password or token is stored in plain text.
- `npm run check` and `npm run build` pass.
