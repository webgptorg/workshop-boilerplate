# Changelog

## Unreleased

- Add pending specifications for verified allergy and special-diet workflows, month-level planning, and exchanging approved menus and selections with the canteen ordering system.
- Default the menu calendar to the current week and allow date selection and week navigation beyond weeks already stored in the menu.
- Show a generic unavailable-menu state on empty dates instead of labeling them as holidays.
- Restrict anonymous menu responses to per-date meal availability; authenticated users retain meal details.
- Add domain and browser coverage for anonymous privacy, availability, date navigation, authenticated meal details, and empty dates.
- Seed published test menus in the browser harness for predictable end-to-end coverage.
- Expand initial-version coverage for meal details, pupil selections and ratings, parent preferences, staff meal editing, and menu approval and publication; use primary and alternative meals in browser fixtures.
- Fix the browser pupil fixture to store hashed session tokens, and normalize linked diner and feedback rows before passing them to client components; add assertions that the pupil session is active and that its weekly offer contains primary and alternative meals.
