import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './home';
import { PATIENTS_DATA } from '../data/patients.data';
import { ALLERGY_ALERT_BY_PATIENT_ID, REASON_FOR_VISIT_BY_PATIENT_ID } from '../data/home.data';

/**
 * Covers Issue #13 (BUG-02): the Next Patient card is the single source of truth for the
 * Reason for Visit / Allergy Alert dialogs. `reasonForVisit`/`allergyAlert` must always be
 * derived from `nextPatient.id`, never from stale/hardcoded data.
 *
 * Note on DOM assertions: this test harness (Angular 22 + `@angular/build:unit-test` /
 * Vitest) only renders a root-level `@if`-gated `<kendo-dialog>` when its guard is already
 * `true` on the fixture's very first `detectChanges()` call - flipping the flag to `true` on
 * a later change-detection pass does not re-render the dialog into the DOM. This reproduces
 * identically for the pre-existing, unmodified dialogs in this component (e.g.
 * `labTestDialogOpened`, `chatPopupOpened`), so it is a pre-existing harness limitation, not a
 * regression introduced by this fix. To keep the suite reliable, dialog *data resolution*
 * (the actual bug being fixed) is verified directly against the component's public getters/
 * guards, and DOM identity-binding is verified with a fixture that opens the dialog before its
 * first `detectChanges()`, which is the one sequence this harness renders consistently.
 */
describe('HomeComponent', () => {
  let currentFixture: ReturnType<typeof TestBed.createComponent<HomeComponent>> | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => {
    currentFixture?.destroy();
    currentFixture = undefined;
  });

  function createComponent() {
    const fixture = TestBed.createComponent(HomeComponent);
    currentFixture = fixture;
    fixture.detectChanges();
    return fixture;
  }

  /** Creates a fixture with the given dialog flag already open before the first render pass. */
  function createComponentWithDialogOpen(flag: 'reasonForVisitDialogOpened' | 'allergyAlertDialogOpened') {
    const fixture = TestBed.createComponent(HomeComponent);
    currentFixture = fixture;
    fixture.componentInstance[flag] = true;
    fixture.detectChanges();
    return fixture;
  }

  it('should create the component', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  // AC-001 / AC-007: Reason for Visit dialog matches the Next Patient card.
  it('resolves reasonForVisit data for the active next patient only', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    expect(component.nextPatient).toBeTruthy();
    const activePatientId = component.nextPatient!.id;

    expect(component.reasonForVisit).toBe(REASON_FOR_VISIT_BY_PATIENT_ID[activePatientId]);
  });

  // AC-002 / AC-007: Allergy Alert dialog matches the Next Patient card.
  it('resolves allergyAlert data for the active next patient only', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    expect(component.nextPatient).toBeTruthy();
    const activePatientId = component.nextPatient!.id;

    expect(component.allergyAlert).toBe(ALLERGY_ALERT_BY_PATIENT_ID[activePatientId]);
  });

  // AC-003: changing the next patient updates both dialogs, with no stale data.
  it('reflects a new next patient on reasonForVisit and allergyAlert without stale data', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    const otherPatient = PATIENTS_DATA.find((p) => p.id !== 3) ?? null;
    expect(otherPatient).toBeTruthy();

    component.nextPatient = otherPatient;
    fixture.detectChanges();

    // The previous (Isabella Rossi, id 3) clinical data must not leak through.
    expect(component.reasonForVisit).not.toBe(REASON_FOR_VISIT_BY_PATIENT_ID[3]);
    expect(component.allergyAlert).not.toBe(ALLERGY_ALERT_BY_PATIENT_ID[3]);
    expect(component.reasonForVisit).toBe(
      REASON_FOR_VISIT_BY_PATIENT_ID[otherPatient!.id] ?? null,
    );
    expect(component.allergyAlert).toBe(ALLERGY_ALERT_BY_PATIENT_ID[otherPatient!.id] ?? null);
  });

  // AC-004: explicit empty state when there is no visit-reason data for the patient.
  it('returns null reasonForVisit when the active patient has no recorded visit reason', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    const patientWithoutReason = PATIENTS_DATA.find(
      (p) => !(p.id in REASON_FOR_VISIT_BY_PATIENT_ID),
    );
    expect(patientWithoutReason).toBeTruthy();

    component.nextPatient = patientWithoutReason!;
    fixture.detectChanges();

    expect(component.reasonForVisit).toBeNull();
  });

  // AC-005: explicit empty state when there is no allergy data for the patient.
  it('returns null allergyAlert when the active patient has no recorded allergy data', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    const patientWithoutAllergy = PATIENTS_DATA.find(
      (p) => !(p.id in ALLERGY_ALERT_BY_PATIENT_ID),
    );
    expect(patientWithoutAllergy).toBeTruthy();

    component.nextPatient = patientWithoutAllergy!;
    fixture.detectChanges();

    expect(component.allergyAlert).toBeNull();
  });

  // AC-006: no next patient means no stale/default patient data is shown.
  it('shows no reason/allergy data and does not open dialogs when there is no next patient', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    component.nextPatient = null;
    fixture.detectChanges();

    expect(component.reasonForVisit).toBeNull();
    expect(component.allergyAlert).toBeNull();

    component.openReasonForVisitDialog();
    expect(component.reasonForVisitDialogOpened).toBe(false);

    component.openAllergyAlertDialog();
    expect(component.allergyAlertDialogOpened).toBe(false);
  });

  // AC-007: the Reason for Visit dialog renders the same patient identity as the Next Patient card.
  it('renders the active patient name and id in the Reason for Visit dialog', () => {
    const fixture = createComponentWithDialogOpen('reasonForVisitDialogOpened');
    const component = fixture.componentInstance;
    const activePatient = component.nextPatient!;

    expect(document.body.textContent).toContain(activePatient.name);
    expect(document.body.textContent).toContain(activePatient.patientCode);
    expect(document.body.textContent).toContain(component.reasonForVisit!.visitType);
  });

  // AC-007: the Allergy Alert dialog renders the same patient identity as the Next Patient card.
  it('renders the active patient name and id in the Allergy Alert dialog', () => {
    const fixture = createComponentWithDialogOpen('allergyAlertDialogOpened');
    const component = fixture.componentInstance;
    const activePatient = component.nextPatient!;

    expect(document.body.textContent).toContain(activePatient.name);
    expect(document.body.textContent).toContain(activePatient.patientCode);
    expect(document.body.textContent).toContain(component.allergyAlert!.allergen);
  });

  // AC-008: Next Patient card preview tiles stay aligned with the resolved data.
  it('reflects the resolved reasonForVisit/allergyAlert in the Next Patient card tiles', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(component.reasonForVisit!.visitType);
    expect(compiled.textContent).toContain(component.allergyAlert!.allergen);
  });
});
