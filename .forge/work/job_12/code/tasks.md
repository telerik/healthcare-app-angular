# Task Checklist — Issue #12

Progress tracking only. **Full instructions live in the phase files** — do not implement from this page.

Legend: `[ ]` not started · `[x]` complete

**Auto-fix pass (post code-review):** Checklist state below was corrected to reflect the actually-verified lint/build/test results (previously left as `[ ]` despite passing); see `review.md` Minor Issue #2 and `phase_2.md` §3 TASK-008 for the related defensive-comment fix.

---

## Progress

| Phase | Tasks | Status |
| --- | --- | --- |
| PHASE-1 — Editor value capture and note lifecycle | 6 | [x] Complete |
| PHASE-2 — Save wiring and in-flight guard | 4 | [x] Complete |
| PHASE-3 — Accessible inline save feedback | 8 | [x] Complete |
| PHASE-4 — Automated tests and full validation | 4 | [x] Complete |
| **Total** | **22** | |

Phases are strictly sequential: PHASE-1 → PHASE-2 → PHASE-3 → PHASE-4. Do not start a phase until the previous phase's validation criteria all pass.

---

## PHASE-1 — Editor Value Capture and Per-Patient Note Lifecycle
*Details: `phase_1.md` · Depends on: nothing*

- [x] **TASK-001** — Add `signal` to the `@angular/core` import in `patient-profile.ts`
- [x] **TASK-002** — Declare `noteDraft = signal<string>('')` *(depends on TASK-001)*
- [x] **TASK-003** — Add `onNoteValueChange(value: string)` *(depends on TASK-002)*
- [x] **TASK-004** — Seed and reset `noteDraft` in `loadPatientData()` *(depends on TASK-002)*
- [x] **TASK-005** — Bind `[value]="noteDraft()"` + `(valueChange)` on `kendo-editor` in `patient-profile.html` *(depends on TASK-003, TASK-004)*
- [x] **TASK-006** — `npm run lint` and `npm run build` both exit 0 *(depends on TASK-005)*

**Phase gate**
- [x] V1-01 lint 0 · [x] V1-02 build 0 · [x] V1-03 no `patient?.notes` in template · [x] V1-04 one `(valueChange)` · [x] V1-05 three `noteDraft.set(` calls

---

## PHASE-2 — Save Wiring, In-Flight Guard and Stale-ID Safety
*Details: `phase_2.md` · Depends on: PHASE-1 complete*

- [x] **TASK-007** — Declare `isSavingNote = signal<boolean>(false)`
- [x] **TASK-008** — Replace the `saveNotes()` stub with the real service call, id/draft snapshots and `finally` reset *(depends on TASK-007)*
- [x] **TASK-009** — Add `[disabled]="isSavingNote()"` to the Save button *(depends on TASK-007)*
- [x] **TASK-010** — `npm run lint` and `npm run build` both exit 0 *(depends on TASK-008, TASK-009)*

**Phase gate**
- [x] V2-01 lint 0 · [x] V2-02 build 0 · [x] V2-03 no `console.log` · [x] V2-04 one `updatePatientNotes` call · [x] V2-05 `patients.service.ts` unmodified · [x] V2-06 `patients.data.ts` unmodified

---

## PHASE-3 — Accessible Inline Save Feedback
*Details: `phase_3.md` · Depends on: PHASE-2 complete*

- [x] **TASK-011** — Add `NoteSaveStatus` type, import `checkCircleIcon`/`exclamationCircleIcon`, expose `noteSuccessIcon`/`noteErrorIcon`
- [x] **TASK-012** — Declare `noteStatus`, `noteStatusMessage`, `noteStatusTimeoutId`, `NOTE_STATUS_TIMEOUT_MS` *(depends on TASK-011)*
- [x] **TASK-013** — Add `setNoteStatus()`, `clearNoteStatus()`, `clearNoteStatusTimeout()` *(depends on TASK-012)*
- [x] **TASK-014** — Emit success/error status from `saveNotes()` *(depends on TASK-013)*
- [x] **TASK-015** — Clear status in `loadPatientData()` and clear the timer in `ngOnDestroy()` *(depends on TASK-013)*
- [x] **TASK-016** — Render the `role="status"` / `aria-live="polite"` region in `patient-profile.html` *(depends on TASK-011, TASK-012)*
- [x] **TASK-017** — Append `.note-actions` / `.note-save-status*` rules to `patient-profile.css` *(depends on TASK-016)*
- [x] **TASK-018** — `npm run lint` + `npm run build` exit 0, and `git diff --stat` on routes/config/package.json is empty *(depends on TASK-014 … TASK-017)*

**Phase gate**
- [x] V3-01 lint 0, no new a11y findings · [x] V3-02 build 0 · [x] V3-03 one `aria-live` region · [x] V3-04 no notification dependency added · [x] V3-05 routes/config/manifest untouched · [x] V3-06 timer always cleared

---

## PHASE-4 — Automated Tests and Full Validation
*Details: `phase_4.md` · Depends on: PHASE-1, PHASE-2, PHASE-3 complete*

- [x] **TASK-019** — Create `src/app/patients/patient-profile/patient-profile.spec.ts` (13 tests)
- [x] **TASK-020** — Add 2 cases to `src/app/services/patients.service.spec.ts` *(parallel-safe with TASK-019)*
- [x] **TASK-021** — `npm run lint`, `npm run build`, `npm test` all exit 0 *(depends on TASK-019, TASK-020)*
- [x] **TASK-022** — Confirm the AC matrix and the changed-file list; do not commit *(depends on TASK-021)*

**Phase gate**
- [x] V4-01 lint 0 · [x] V4-02 build 0 · [x] V4-03 test 0 · [x] V4-04 13 new component tests pass · [x] V4-05 6 service tests pass · [x] V4-06 no out-of-scope files changed

---

## Acceptance Criteria Sign-Off

- [x] **AC-001** Edited content passed to `updatePatientNotes()` for the active patient
- [x] **AC-002** Saved note survives navigate-away-and-return
- [x] **AC-003** No-op save preserves existing content
- [x] **AC-004** Cleared note persists as empty string
- [x] **AC-005** Existing note pre-populates the editor on load
- [x] **AC-006** Empty/undefined note renders an empty editor cleanly
- [x] **AC-007** No note content bleeds between patients
- [x] **AC-008** Visible, non-blocking success indicator
- [x] **AC-009** Visible error indicator; unsaved input retained
- [x] **AC-010** Overlapping saves prevented
- [x] **AC-011** Indicator auto-clears and never blocks the page
- [x] **AC-012** No new write path or access-level change

## Definition of Done

- [x] All 22 tasks checked
- [x] All 4 phase gates passed
- [x] All 12 acceptance criteria signed off
- [x] `npm run lint`, `npm run build`, `npm test` all exit 0
- [x] Changes committed in two commits (implementation, then tests) on `forge/issue-12-fix-clinical-notes-not-saving` per task commit instructions, left unpushed for review
