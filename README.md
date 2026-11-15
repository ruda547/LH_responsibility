# LH Responsibility

Visual prototype of a supervisor daily checklist based on the supplied check sheet.

## Workspaces

- Daily checklist: automatic Pitman crew and shift, tasks grouped with a separate box for each scheduled time, independent OK/NG results, notes, progress, search, filters, and CSV export.
- Summary: selected-date day/night totals, NG items and notes, and a 14-day crew overview.

## Pitman rotation and recording

Sunday 15 November 2026 is anchored as the final A day. The next days are B/B, A/A, B/B/B, A/A, B/B, A/A/A, repeating every 14 days. Day crews are 1A/1B and night crews are 2A/2B.

The device's local timezone controls recording. Day is 06:00 inclusive to 18:00 exclusive; night is 18:00 to 06:00. Before 06:00, the shift date is the previous calendar date. Crew, shift, shift start date, and recording timestamp are saved automatically. The page checks for handover every 30 seconds, on focus, and before recording. Notes opened before handover cannot be saved into the next shift.

There are no supervisor or shift selectors and no task priority labels. Each scheduled occurrence requires its own result. NG counts as recorded but does not count toward a task's OK total.

## Preview and verification

Open `dist/index.html` in a modern browser, or serve `dist` with any static HTTP server. No build dependencies.

Run `node tests/schedule.cjs`. These functional checks use a lightweight DOM stub and cover the full rotation, shift boundaries, overnight dates, automatic metadata, recurring results, summary data, handover isolation, and CSV. Rendered browser layout is not verified in the current environment.

## Prototype limits

Entries are saved only in the current browser, without authentication or synchronization. Earlier manually selected supervisor demo entries remain in browser storage but are not assigned to Pitman crews, because their true crew is unknown.

82 scheduled checks across 27 tasks use repeat counts drafted from the photo. Check times are illustrative and evenly distributed across each 12-hour shift starting at 06:00 or 18:00. Confirm frequencies, exact timing, task names, and area abbreviations against the original sheet. The Summary shows local prototype records, not shared plant results.

A production version will require durable shared storage, a confirmed plant timezone, and confirmed task schedules.
