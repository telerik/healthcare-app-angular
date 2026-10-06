# Tasks — Issue #13 (BUG-02: Wrong Patient Data Shown in Next Patient Dialogs)

> **Note:** No forge plan (`README.md`/`research.md`/`tasks.md`/`phase_*.md`) existed for this
> job. This run was performed in **fallback mode**: requirements were derived directly from
> GitHub Issue #13, and this file was created fresh to track implementation progress.

## Issue summary

The Home dashboard's "Reason for Visit" and "Allergy Alert" dialogs always showed hardcoded
clinical data for "Isabella Rossi," regardless of which patient the "Next Patient" card
actually displayed, and used a `patientId` that did not even match that patient's real
`patientCode`. Both dialog templates were also duplicated in the markup (rendered twice).

## Acceptance criteria (from Issue #13)

- [x] **AC-001**: Reason for Visit dialog shows data for the patient on the Next Patient card.
- [x] **AC-002**: Allergy Alert dialog shows data for the patient on the Next Patient card.
- [x] **AC-003**: Changing the next patient updates both dialogs with no stale data.
- [x] **AC-004**: Explicit empty state when there is no recorded visit-reason for the patient.
- [x] **AC-005**: Explicit empty state when there is no recorded allergy data for the patient.
- [x] **AC-006**: No next patient ⇒ no stale/default patient data shown, dialogs do not open.
- [x] **AC-007**: Dialog patient identity fields (name, id) always match the Next Patient card.
- [x] **AC-008**: Next Patient card preview tiles stay aligned with the resolved dialog data.

## Implementation tasks

- [x] Root-cause the bug: hardcoded `reasonForVisit`/`allergyAlert` objects were disconnected
      from `nextPatient`, and both dialog templates were literally duplicated in `home.html`.
- [x] `src/app/data/home.data.ts`: add `PreviousVisit`, `ReasonForVisitDetails`,
      `AllergyAlertDetails` interfaces (excluding patient name/id — identity always comes from
      `nextPatient`) and `REASON_FOR_VISIT_BY_PATIENT_ID` / `ALLERGY_ALERT_BY_PATIENT_ID` maps
      keyed by `PatientProfile.id` (populated only for patient id 3, matching current data).
- [x] `src/app/home/home.ts`: replace hardcoded `reasonForVisit`/`allergyAlert` fields with
      `get reasonForVisit()` / `get allergyAlert()` getters derived from `nextPatient.id`
      (return `null` when there is no next patient or no recorded data); guard
      `openReasonForVisitDialog()` / `openAllergyAlertDialog()` to no-op when there is no
      `nextPatient`.
- [x] `src/app/home/home.html`: remove the duplicated second copy of each dialog; bind dialog
      patient-identity fields to `nextPatient?.name` / `nextPatient?.patientCode`; wrap
      clinical sections in `@if (reasonForVisit) {...} @else {<empty state>}` /
      `@if (allergyAlert) {...} @else {<empty state>}`; update Next Patient card preview tiles
      with fallback text and `info-card-disabled` / `aria-disabled` bindings for when there is
      no next patient.
- [x] `src/app/home/home.css`: add `.info-card-disabled` and `.details-text.empty-state`
      styles.
- [x] `src/app/home/home.spec.ts` (new): 10 tests covering AC-001–AC-008 plus component
      creation. See *Testing notes* below for the test design rationale.
- [x] Run lint (`ng lint`) — all files pass.
- [x] Run full unit test suite (`ng test`) — 25/25 tests pass (6 spec files), re-verified
      stable across multiple runs.
- [x] Run production build (`ng build`) — succeeds with no errors.
- [ ] Commit implementation and tests as separate commits (next step).

## Testing notes

This test harness (Angular 22 + the `@angular/build:unit-test` / Vitest builder) has a
**pre-existing limitation**, confirmed unrelated to this fix: a root-level, `@if`-gated
`<kendo-dialog>` only renders into the DOM when its guard flag is already `true` on the
fixture's very first `detectChanges()` call. Flipping the flag to `true` on a *later*
change-detection pass (e.g. via a click or a method call after the component has already
rendered once) does not add the dialog to the DOM in this harness. This was verified to
reproduce identically for *pre-existing, unmodified* dialogs in the same component (e.g. the
Clinical Note and Lab Test dialogs, and the non-Kendo chat popup), so it is a harness/
environment quirk and not a regression introduced by this change, and not something in scope
to fix here.

To keep the suite fast and reliable despite this, the tests verify:
- Dialog **data resolution** (the actual bug) directly against the component's public
  `reasonForVisit` / `allergyAlert` getters and the `nextPatient`-based guards — this is where
  the real logic of the fix lives.
- Dialog **DOM identity binding** (`nextPatient?.name` / `nextPatient?.patientCode` rendering
  inside the dialog) using a fixture where the relevant dialog flag is set to `true` **before**
  the first `detectChanges()` call — the one sequence this harness renders reliably.

## Out of scope (confirmed, not pursued)

- Reworking how the "next patient" is resolved (`AppointmentsService` has no patient-id
  linkage) — the issue scopes the fix to keeping the dialogs in sync with whatever
  `nextPatient` already is, not changing how `nextPatient` is chosen.
