# LH Responsibility

Visual prototype of a supervisor daily checklist, based on the provided check-sheet image.

## Features

- Separate demo checklists by supervisor, date, and day/night shift
- 27 control points across five categories
- Independent OK / NG results and notes for each scheduled occurrence
- Repeat frequencies and task totals (for example, six separate OK marks for a six-check task)
- Progress counts, search and filters
- CSV export with one row per scheduled occurrence
- Responsive layout

## Preview

Open `dist/index.html` in a modern browser, or serve `dist` with any static HTTP server. There are no build dependencies.

## Prototype limits

Entries are stored in the current browser only, without authentication or synchronization. Demo supervisor names are placeholders. Exact task names, area abbreviations, priorities, and hourly schedules require verification against the original spreadsheet; see `docs/checklist-draft.md`. Do not use this prototype as an official operational record.

A shared production version will require persistent storage, supervisor identities, and confirmed shift/check schedules.

## Schedule prototype

The prototype has 82 scheduled checks across 27 tasks. Repeat counts are drafted from the photo; times are illustrative and evenly distributed over a 12-hour shift starting at 05:30 (day) or 17:30 (night). Confirm times and counts against the original before operational use. NG counts as a recorded result but does not count toward a task’s OK total. Earlier single-result entries remain visible for reference and do not fill recurring time slots.

Run `node tests/schedule.cjs` to check repeat results, supervisor/date/shift isolation, notes, filtering, overnight timing, persistence, and CSV export. These checks use a lightweight DOM stub; rendered browser layout is not verified.
