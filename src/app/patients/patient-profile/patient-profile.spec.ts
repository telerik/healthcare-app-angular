import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, ParamMap, Router, convertToParamMap } from '@angular/router';
import { KENDO_EDITOR } from '@progress/kendo-angular-editor';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { PatientsService } from '../../services/patients.service';
import { PatientProfileComponent } from './patient-profile';

const PATIENT_A_ID = 1;
const PATIENT_B_ID = 2;

describe('PatientProfileComponent — clinical notes', () => {
  let fixture: ComponentFixture<PatientProfileComponent>;
  let component: PatientProfileComponent;
  let patientsService: PatientsService;
  let paramMap$: BehaviorSubject<ParamMap>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let originalNotesA: string;
  let originalNotesB: string;

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({ id: String(PATIENT_A_ID) }));
    navigateSpy = vi.fn().mockResolvedValue(true);

    TestBed.overrideComponent(PatientProfileComponent, {
      remove: { imports: [...KENDO_EDITOR] },
      add: { schemas: [NO_ERRORS_SCHEMA] },
    });

    await TestBed.configureTestingModule({
      imports: [PatientProfileComponent],
      providers: [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    }).compileComponents();

    patientsService = TestBed.inject(PatientsService);
    originalNotesA = patientsService.getPatientById(PATIENT_A_ID)!.notes;
    originalNotesB = patientsService.getPatientById(PATIENT_B_ID)!.notes;

    fixture = TestBed.createComponent(PatientProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    patientsService.updatePatientNotes(PATIENT_A_ID, originalNotesA);
    patientsService.updatePatientNotes(PATIENT_B_ID, originalNotesB);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('pre-populates the draft with the patient existing notes (AC-005)', () => {
    expect(component.noteDraft()).toBe(originalNotesA);
  });

  it('renders an empty draft without errors when the patient has no notes (AC-006)', () => {
    patientsService.updatePatientNotes(PATIENT_A_ID, '');
    paramMap$.next(convertToParamMap({ id: String(PATIENT_A_ID) }));
    fixture.detectChanges();

    expect(component.noteDraft()).toBe('');
  });

  it('passes the edited content and active patient id to the service (AC-001)', () => {
    const updateSpy = vi.spyOn(patientsService, 'updatePatientNotes');

    component.onNoteValueChange('<p>Updated clinical observation</p>');
    component.saveNotes();

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(PATIENT_A_ID, '<p>Updated clinical observation</p>');
  });

  it('retains the saved content when the profile is re-entered (AC-002)', () => {
    component.onNoteValueChange('<p>Persisted note</p>');
    component.saveNotes();

    paramMap$.next(convertToParamMap({ id: String(PATIENT_B_ID) }));
    fixture.detectChanges();
    paramMap$.next(convertToParamMap({ id: String(PATIENT_A_ID) }));
    fixture.detectChanges();

    expect(component.noteDraft()).toBe('<p>Persisted note</p>');
    expect(patientsService.getPatientById(PATIENT_A_ID)!.notes).toBe('<p>Persisted note</p>');
  });

  it('preserves the existing note on a no-op save (AC-003)', () => {
    component.saveNotes();

    expect(patientsService.getPatientById(PATIENT_A_ID)!.notes).toBe(originalNotesA);
  });

  it('persists an intentionally cleared note as an empty string (AC-004)', () => {
    component.onNoteValueChange('');
    component.saveNotes();

    expect(patientsService.getPatientById(PATIENT_A_ID)!.notes).toBe('');
    expect(component.noteStatus()).toBe('success');
  });

  it('never carries note content across patients (AC-007)', () => {
    component.onNoteValueChange('<p>Draft for patient A, never saved</p>');

    paramMap$.next(convertToParamMap({ id: String(PATIENT_B_ID) }));
    fixture.detectChanges();

    expect(component.noteDraft()).toBe(originalNotesB);
    expect(component.noteDraft()).not.toContain('Draft for patient A');
  });

  it('shows an accessible success indicator after a successful save (AC-008)', () => {
    component.onNoteValueChange('<p>Saved note</p>');
    component.saveNotes();
    fixture.detectChanges();

    const region: HTMLElement = fixture.nativeElement.querySelector('.note-save-status');
    expect(region).toBeTruthy();
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.getAttribute('role')).toBe('status');
    expect(component.noteStatus()).toBe('success');
    expect(region.textContent).toContain('Patient note saved.');
  });

  it('shows an error and keeps the draft when the save fails (AC-009)', () => {
    vi.spyOn(patientsService, 'updatePatientNotes').mockReturnValue(false);

    component.onNoteValueChange('<p>Unsaved work</p>');
    component.saveNotes();
    fixture.detectChanges();

    const region: HTMLElement = fixture.nativeElement.querySelector('.note-save-status');
    expect(component.noteStatus()).toBe('error');
    expect(region.textContent).toContain('Could not save the patient note.');
    expect(component.noteDraft()).toBe('<p>Unsaved work</p>');
  });

  it('ignores overlapping save calls while a save is in flight (AC-010)', () => {
    const updateSpy = vi.spyOn(patientsService, 'updatePatientNotes');

    component.isSavingNote.set(true);
    component.saveNotes();

    expect(updateSpy).not.toHaveBeenCalled();
    expect(component.isSavingNote()).toBe(true);
  });

  it('resets the in-flight flag after a save completes (AC-010)', () => {
    component.saveNotes();

    expect(component.isSavingNote()).toBe(false);
  });

  it('auto-clears the status indicator after the timeout (AC-011)', () => {
    vi.useFakeTimers();

    component.onNoteValueChange('<p>Temporary status</p>');
    component.saveNotes();
    expect(component.noteStatus()).toBe('success');

    vi.advanceTimersByTime(4000);

    expect(component.noteStatus()).toBe('idle');
    expect(component.noteStatusMessage()).toBe('');
  });

  it('clears the status indicator when switching patients (AC-011)', () => {
    component.saveNotes();
    expect(component.noteStatus()).toBe('success');

    paramMap$.next(convertToParamMap({ id: String(PATIENT_B_ID) }));
    fixture.detectChanges();

    expect(component.noteStatus()).toBe('idle');
  });
});
