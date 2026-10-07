# Tasks — Issue 75: Pin the upcoming appointment to the top of the grid

> No implementation plan (`README.md`/`research.md`/`phase_*.md`) was found under
> `.forge/work/job_75/code/` prior to this run. Requirements were derived directly
> from Issue #75 ("Add the up coming appointment as pinned") and the existing
> `visual-evidence/baseline.md` capture. This file was created as part of this run
> to track progress per the output requirements.

## Requirements

- Make the "Isabella Rossi" upcoming appointment row pinnable/pinned to the top of
  the "Today's Appointments" Kendo Grid on the Home dashboard so it is immediately
  visible without scrolling.
- Allow the user to pin/unpin additional rows interactively via the grid's pin column.
- Preserve existing grid behavior (columns, statuses, adaptive mode) for all other rows.

## Checklist

- [x] Add a stable `id` field to `GridAppointment` (data model + service mapping) to
      support reliable row identity for pinning.
- [x] Enable Kendo Grid row pinning (`pinnable="top"`, `<kendo-grid-rowpin-column>`)
      on the "Today's Appointments" grid in `home.html`.
- [x] Pre-pin the Isabella Rossi upcoming appointment on component init
      (`HomeComponent.pinnedTopRows`) in `home.ts`.
- [x] Wire up `(rowPinChange)` to keep `pinnedTopRows` in sync with user pin/unpin
      interactions (`onRowPinChange`).
- [x] Add/extend unit tests:
  - `appointments.service.spec.ts` — asserts `id` is present and that Isabella
    Rossi's "Upcoming" appointment is included in today's appointments.
  - `home.spec.ts` (new) — asserts the row is pinned on init, and that
    `onRowPinChange` correctly syncs pin/unpin state.
- [x] Run lint, type-check, unit tests, and production build — all passing.
- [x] Manual visual verification via Playwright (`visual-evidence/after.png`):
      Isabella Rossi's row renders in a separate "Pinned top rows" section at the
      top of the grid, with an "Unpin row" affordance.

## Status: Complete

All tasks for this single-phase fix are done. Ready for review.
