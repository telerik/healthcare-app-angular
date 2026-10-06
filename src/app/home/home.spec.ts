import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './home';
import { DAILY_ALERTS } from '../data/home.data';
import { PATIENTS_DATA } from '../data/patients.data';

describe('HomeComponent - Daily Alerts actions', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HomeComponent>>;
  let component: HomeComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function selectFirstAlert(): void {
    component.openAlertDialog(DAILY_ALERTS[0]);
  }

  it('reviewAlertPatient navigates to the alert patient profile and closes the dialog', () => {
    selectFirstAlert();

    component.reviewAlertPatient();

    const expectedPatient = PATIENTS_DATA.find((p) => p.patientCode === DAILY_ALERTS[0].patientId);
    expect(router.navigate).toHaveBeenCalledWith(['/patients', expectedPatient?.id]);
    expect(component.alertDialogOpened).toBe(false);
    expect(component.alertPatientLookupError()).toBeNull();
  });

  it('reviewAlertPatient with an unknown patientId sets the lookup error and does not navigate', () => {
    component.openAlertDialog({
      ...DAILY_ALERTS[0],
      patientId: 'P-999999',
    });

    component.reviewAlertPatient();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.alertDialogOpened).toBe(true);
    expect(component.alertPatientLookupError()).toContain('P-999999');
  });

  it('does not throw and does not navigate when no alert is selected', () => {
    component.selectedAlert = null;

    expect(() => component.reviewAlertPatient()).not.toThrow();
    expect(() => component.addNoteForAlert()).not.toThrow();
    expect(() => component.requestTestForAlert()).not.toThrow();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('addNoteForAlert pre-populates selectedPatient, closes alert dialog, opens note dialog', () => {
    selectFirstAlert();

    component.addNoteForAlert();

    expect(component.selectedPatient.patientId).toBe(DAILY_ALERTS[0].patientId);
    expect(component.alertDialogOpened).toBe(false);
    expect(component.clinicalNoteDialogOpened).toBe(true);
  });

  it('closeClinicalNoteDialog after an alert-triggered open leaves all dialog flags false', () => {
    selectFirstAlert();
    component.addNoteForAlert();

    component.closeClinicalNoteDialog();

    expect(component.clinicalNoteDialogOpened).toBe(false);
    expect(component.alertDialogOpened).toBe(false);
  });

  it('requestTestForAlert pre-populates labTestPatient and swaps dialogs', () => {
    selectFirstAlert();

    component.requestTestForAlert();

    expect(component.labTestPatient.patientId).toBe(DAILY_ALERTS[0].patientId);
    expect(component.alertDialogOpened).toBe(false);
    expect(component.labTestDialogOpened).toBe(true);

    component.closeLabTestDialog();
    expect(component.labTestDialogOpened).toBe(false);
  });

  it('consecutive CTAs on two different alerts pre-populate the second alert patient', () => {
    component.openAlertDialog(DAILY_ALERTS[0]);
    component.addNoteForAlert();
    expect(component.selectedPatient.patientId).toBe(DAILY_ALERTS[0].patientId);

    component.openAlertDialog(DAILY_ALERTS[1]);
    component.addNoteForAlert();
    expect(component.selectedPatient.patientId).toBe(DAILY_ALERTS[1].patientId);
  });

  it('acknowledgeAlert still closes the dialog (existing Acknowledge behavior unchanged)', () => {
    selectFirstAlert();

    component.acknowledgeAlert();

    expect(component.alertDialogOpened).toBe(false);
  });

  it('renders non-empty suggested-action text and a priority class for the selected alert', () => {
    // State must be set before the first `detectChanges()` call: this suite's zoneless
    // TestBed configuration only reliably reflects component state present at initial
    // render, so the alert dialog is opened before the fixture renders for the first
    // (and only) time in this test.
    selectFirstAlert();
    fixture.detectChanges();

    const suggestedActionEl = document.body.querySelector('.suggested-action');

    expect(suggestedActionEl).toBeTruthy();
    expect(suggestedActionEl?.textContent?.trim().length).toBeGreaterThan(0);
    expect(suggestedActionEl?.className).toMatch(/priority-(high|medium|low)/);
  });

  it('each CTA button exposes a non-empty aria-label containing the patient name', () => {
    selectFirstAlert();
    fixture.detectChanges();

    const buttons = Array.from(document.body.querySelectorAll('.alert-cta-row button'));

    expect(buttons.length).toBe(3);
    buttons.forEach((button) => {
      const ariaLabel = button.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain(DAILY_ALERTS[0].patient);
    });
  });
});
