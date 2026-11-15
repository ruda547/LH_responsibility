# LH Responsibility

Visual prototype of a supervisor daily checklist, based on the provided check-sheet image.

## Features

- Separate demo checklists by supervisor, date, and day/night shift
- 27 control points across five categories
- OK / NG results, notes, progress counts, search and filters
- CSV export of the selected checklist
- Responsive layout

## Preview

Open `dist/index.html` in a modern browser, or serve `dist` with any static HTTP server. There are no build dependencies.

## Prototype limits

Entries are stored in the current browser only, without authentication or synchronization. Demo supervisor names are placeholders. Exact task names, area abbreviations, priorities, and hourly schedules require verification against the original spreadsheet; see `docs/checklist-draft.md`. Do not use this prototype as an official operational record.

A shared production version will require persistent storage, supervisor identities, and confirmed shift/check schedules.
