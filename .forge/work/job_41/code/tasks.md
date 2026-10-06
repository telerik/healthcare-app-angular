# Issue #41 — Implementation Checklist

Single phase. Execute top to bottom; tasks within a group are ordered by dependency.
Full task detail in [`phase_1.md`](./phase_1.md).

## Group A — Data integrity & model (no dependencies)

- [x] **T1** — Add `AlertPriority` type, `suggestedAction` field, narrowed `priority` to `DailyAlert` in `src/app/data/home.data.ts`
- [x] **T2** — Remap all 8 `DAILY_ALERTS` entries to real patients from `PATIENTS_DATA` (title, `patient`, `patientId`)
- [x] **T3** — Add `suggestedAction` text to each of the 8 `DAILY_ALERTS` entries
- [x] **T4** — Derive `HOME_PATIENTS` from `PATIENTS_DATA` in `src/app/data/home.data.ts`
- [x] **T5** — Create `src/app/data/alert-suggestions.ts` with condition map, priority defaults and `resolveSuggestedAction()`

## Group B — Service layer (depends on A)

- [x] **T6** — Add `getPatientByCode(code: string): PatientProfile | null` to `src/app/services/patients.service.ts`

## Group C — Component logic (depends on A, B)

- [x] **T7** — Inject `PatientsService` into `HomeComponent`; add `alertPatientLookupError` signal
- [x] **T8** — Add `resolveAlertPatient()` and `suggestedActionFor()` helpers to `home.ts`
- [x] **T9** — Add `reviewAlertPatient()` CTA handler (navigate + close, with fallback)
- [x] **T10** — Add `addNoteForAlert()` CTA handler (pre-populate `selectedPatient`, close alert, open note dialog)
- [x] **T11** — Add `requestTestForAlert()` CTA handler (pre-populate `labTestPatient`, reset test selections, close alert, open lab dialog)
- [x] **T12** — Clear `alertPatientLookupError` in `openAlertDialog()` and `closeAlertDialog()`

## Group D — Template & styling (depends on C)

- [x] **T13** — Add Suggested Next Action block to the alert dialog in `src/app/home/home.html`
- [x] **T14** — Add inline `role="alert"` fallback message region to the alert dialog
- [x] **T15** — Add the three CTA buttons with `aria-label`s to `kendo-dialog-actions`, preserving Close/Acknowledge
- [x] **T16** — Add `.suggested-action`, priority variants and `.alert-cta-row` responsive styles to `src/app/home/home.css`

## Group E — Tests (depends on A–D)

- [x] **T17** — Create `src/app/data/home.data.spec.ts` — referential integrity + non-empty `suggestedAction`
- [x] **T18** — Create `src/app/data/alert-suggestions.spec.ts` — condition match, priority default, unknown-priority default
- [x] **T19** — Extend `src/app/services/patients.service.spec.ts` — `getPatientByCode` hit / miss / case handling
- [x] **T20** — Create `src/app/home/home.spec.ts` — CTA dispatch, dialog transitions, lookup failure, Acknowledge regression

## Group F — Validation (depends on E)

- [x] **T21** — `npm run test` passes (new + existing specs)
- [x] **T22** — `npm run lint` passes
- [x] **T23** — `npm run build` succeeds
- [ ] **T24** — Manual responsive check at 1280 / 900 / 375 px widths
- [ ] **T25** — Manual accessibility check: dialog title, patient context and all CTAs have accessible names; no `undefined` announced

## Group G — Auto-Fix (review.md, severity scope: critical/major/minor)

- [x] **T26** — Reviewed `review.md` against the requested critical/major/minor scope in `fix.md`: **no bugs, security issues, or breaking changes were reported** (review concluded "no issues found"; only non-blocking informational notes were listed). No code changes were required or applied.
- [x] **T27** — Re-ran `npm run test` (41/41 passing), `npm run lint` (clean), confirming the implementation remains valid with no regressions to fix.
