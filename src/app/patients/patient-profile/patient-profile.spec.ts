import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PatientsService } from '../../services/patients.service';
import { PatientProfileComponent } from './patient-profile';

describe('PatientProfileComponent', () => {
  let patientsService: PatientsService;
  let router: Router;

  function configureTestBed(patientId: string) {
    TestBed.configureTestingModule({
      imports: [PatientProfileComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([{ path: 'patients', children: [] }]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: new BehaviorSubjectLike(convertToParamMap({ id: patientId })),
          },
        },
      ],
    });

    patientsService = TestBed.inject(PatientsService);
    router = TestBed.inject(Router);
  }

  function createComponent(patientId: string) {
    configureTestBed(patientId);
    const fixture = TestBed.createComponent(PatientProfileComponent);
    fixture.detectChanges();
    return fixture;
  }

  // Minimal observable-like wrapper so `paramMap.subscribe(...)` resolves synchronously in tests.
  class BehaviorSubjectLike<T> {
    constructor(private value: T) {}
    subscribe(callback: (value: T) => void): { unsubscribe: () => void } {
      callback(this.value);
      return { unsubscribe: () => undefined };
    }
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should pre-populate the editor with the patient existing notes on load', () => {
    const fixture = createComponent('1');
    const component = fixture.componentInstance;
    const expectedNotes = patientsService.getPatientById(1)?.notes ?? '';

    expect(component.patientNoteContent).toBe(expectedNotes);
    expect(component.patientNoteContent.length).toBeGreaterThan(0);
  });

  it('should navigate back to patients list when the patient id is unknown', () => {
    configureTestBed('-1');
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(PatientProfileComponent);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/patients']);
  });

  it('should persist edited notes via the patients service and show a success message', () => {
    const fixture = createComponent('1');
    const component = fixture.componentInstance;

    component.patientNoteContent = 'Updated clinical notes from physician';
    component.saveNotes();
    fixture.detectChanges();

    expect(patientsService.getPatientById(1)?.notes).toBe('Updated clinical notes from physician');
    expect(component.saveNotesStatus).toBe('success');
  });

  it('should show an error message when saving notes fails', () => {
    const fixture = createComponent('1');
    const component = fixture.componentInstance;

    vi.spyOn(patientsService, 'updatePatientNotes').mockReturnValue(false);

    component.saveNotes();
    fixture.detectChanges();

    expect(component.saveNotesStatus).toBe('error');
  });

  it('should clear the save status message after a delay', () => {
    vi.useFakeTimers();
    const fixture = createComponent('1');
    const component = fixture.componentInstance;

    component.saveNotes();
    expect(component.saveNotesStatus).not.toBeNull();

    vi.advanceTimersByTime(4000);

    expect(component.saveNotesStatus).toBeNull();
  });

  it('should clear any pending status timeout on destroy', () => {
    vi.useFakeTimers();
    const fixture = createComponent('1');
    const component = fixture.componentInstance;

    component.saveNotes();
    fixture.destroy();

    expect(() => vi.advanceTimersByTime(4000)).not.toThrow();
  });
});
