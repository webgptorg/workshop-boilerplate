[-]

Connect approved menu selections with the canteen ordering system

- This builds on the [user system](0010-user-system.md), [recipe catalog](0060-recipe-catalog.md), [portions and prices](0050-portions-and-prices.md) and [menu publishing](0040-menu-publishing.md). Their coding standards still apply.
- The current menu export is a manual handoff, and selections are explicitly not orders. Before implementation, inspect the real iCanteen menu examples in `docs/stavajici_jidelnicky.txt`, the current selection lifecycle, menu revisions and the target system's supported import/export formats. Do not assume an API exists.

## Discovery and boundaries

- Confirm with the canteen which ordering product and version it uses, the supported exchange format, identifiers, deadlines, correction process and responsibility for final submission.
- If the target product offers no supported machine interface, implement a validated file exchange and manual operator handoff. Do not automate browser clicks or scrape a private interface.
- Keep the existing print and menu export useful when integration is unavailable. Show the format/version and the date it was generated.
- This feature is an exchange with the ordering system, not payment processing or supplier purchasing. Do not send orders to suppliers.

## Menu and selection exchange

- Export only an approved, published menu revision in the format accepted by the confirmed target system. Include the canteen's required meal, date, choice and diner identifiers without leaking unrelated personal data.
- Provide a preview, validation errors and an explicit staff action before downloading or transmitting an export. Record actor, revision, time, result and target format.
- Import order or selection confirmations only when the target system provides them. Validate canteen, diner, service date, meal identity and source revision before applying any result.
- Repeated imports of the same source file or event must not duplicate selections or orders. Report unmatched, stale and conflicting records for staff review; never guess a match.
- Make clear whether the displayed selection is a preference, an exported selection, or an order accepted by the external system. Do not label a preference as an order.

## Changes and reconciliation

- When a published menu changes after export, show which exported dates and meals are affected and require a new explicit export or supported update.
- Do not silently rewrite accepted external orders when a menu revision changes. Show the difference and require staff to use the target system's correction process.
- Reconcile returned status against the exact published revision and preserve import/export history for audit.
- When an exchange fails or the target system is unavailable, retain the local published menu and selections, show the failure, and let staff retry safely.

## Security and permissions

- Only authorized staff can create or submit exports and import external results. Parents, pupils and anonymous visitors cannot access integration files or operational identifiers.
- Keep credentials and tokens out of SQLite plaintext, logs, exports and error messages. If the target requires credentials, use a dedicated secret configuration and document rotation.
- Validate uploaded files for size, encoding, schema and row limits before processing. Treat imported text as untrusted input.
- Apply canteen scoping and server-side authorization to every integration endpoint and record each staff action in the audit log.

## Done when

- The canteen's actual target format is documented and covered by representative fixtures before an exchange is enabled.
- A staff member can preview and validate an export for a specific published revision and can distinguish it from an accepted external order.
- Re-importing the same external data is safe and does not duplicate records.
- Stale, unmatched and conflicting rows are reported for review instead of being silently applied.
- A post-publication change identifies affected exchanges without altering an external order automatically.
- Parents, pupils and anonymous visitors cannot read or submit integration data, including through the API.
- `npm run check` and `npm run build` pass.
