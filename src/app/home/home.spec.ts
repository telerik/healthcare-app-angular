import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomeComponent } from './home';
import { PatientProfile } from '../data/patients.data';
import { AppointmentsService, NextAppointment } from '../services/appointments.service';
import { PageHeaderService } from '../services/page-header.service';

function buildPatient(overrides: Partial<PatientProfile>): PatientProfile {
  return {
    id: 100,
    name: 'Fixture Patient',
    age: 40,
    status: 'Stable',
    gender: 'Female',
    bloodType: 'O+',
    ward: 'General',
    diagnosis: 'N/A',
    avatar: 'assets/profiles/women/fixture.jpg',
    patientCode: 'P-000000',
    vitals: {
      heartRate: '70 bpm',
      bloodPressure: '120/80',
      temperature: '36.6°C',
      o2Saturation: '98%',
      respiratoryRate: '16 breaths/min',
    },
    admission: {
      department: 'General',
      ward: 'General Unit',
      room: '100',
      admissionDate: 'Jan 1, 2026',
      assignedNurse: 'Nurse Fixture',
    },
    notes: 'Fixture patient notes.',
    labResults: [],
    ...overrides,
  };
}

const PATIENT_A: PatientProfile = buildPatient({
  id: 201,
  name: 'Patient Alpha',
  patientCode: 'P-A00001',
  visitReason: {
    visitType: 'Alpha Visit Type',
    primaryConcern: 'Alpha primary concern',
    background: 'Alpha background text.',
    previousVisits: [{ date: 'Alpha date', description: 'Alpha previous visit' }],
    objectives: ['Alpha objective'],
    preparationNotes: ['Alpha preparation note'],
  },
  allergies: [
    {
      allergen: 'Alpha Allergen Mild',
      allergyType: 'Alpha Type',
      severity: 'Mild',
      reaction: 'Alpha mild reaction',
      firstReported: 'Alpha date',
      symptoms: ['Alpha symptom'],
      crossReactivities: ['Alpha cross'],
      safeAlternatives: ['Alpha alt'],
      emergencyProtocol: ['Alpha protocol'],
      notes: 'Alpha notes',
    },
    {
      allergen: 'Alpha Allergen Severe',
      allergyType: 'Alpha Type',
      severity: 'Severe',
      reaction: 'Alpha severe reaction',
      firstReported: 'Alpha date',
      symptoms: ['Alpha severe symptom'],
      crossReactivities: ['Alpha severe cross'],
      safeAlternatives: ['Alpha severe alt'],
      emergencyProtocol: ['Alpha severe protocol'],
      notes: 'Alpha severe notes',
    },
  ],
});

const PATIENT_B: PatientProfile = buildPatient({
  id: 202,
  name: 'Patient Beta',
  patientCode: 'P-B00002',
  visitReason: {
    visitType: 'Beta Visit Type',
    primaryConcern: 'Beta primary concern',
    background: 'Beta background text.',
    previousVisits: [{ date: 'Beta date', description: 'Beta previous visit' }],
    objectives: ['Beta objective'],
    preparationNotes: ['Beta preparation note'],
  },
  allergies: [
    {
      allergen: 'Beta Allergen',
      allergyType: 'Beta Type',
      severity: 'Moderate',
      reaction: 'Beta reaction',
      firstReported: 'Beta date',
      symptoms: ['Beta symptom'],
      crossReactivities: ['Beta cross'],
      safeAlternatives: ['Beta alt'],
      emergencyProtocol: ['Beta protocol'],
      notes: 'Beta notes',
    },
  ],
});

function buildAppointment(patient: PatientProfile, timeOverride = '09:00 AM'): NextAppointment {
  return {
    patientId: patient.id,
    time: timeOverride,
    reason: 'Fixture reason',
    room: 'Fixture room',
    start: new Date(),
  };
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockAppointmentsService: {
    getTodaysAppointments: ReturnType<typeof vi.fn>;
    getNextAppointment: ReturnType<typeof vi.fn>;
  };
  let mockPageHeaderService: {
    title: { set: ReturnType<typeof vi.fn> };
    subtitle: { set: ReturnType<typeof vi.fn> };
  };

  function setNextPatient(patient: PatientProfile | null, time = '09:00 AM'): void {
    component.nextPatient.set(patient);
    component.nextAppointment.set(patient ? buildAppointment(patient, time) : null);
  }

  beforeEach(() => {
    mockRouter = { navigate: vi.fn() };
    mockAppointmentsService = {
      getTodaysAppointments: vi.fn(() => []),
      getNextAppointment: vi.fn(() => null),
    };
    mockPageHeaderService = {
      title: { set: vi.fn() },
      subtitle: { set: vi.fn() },
    };

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideNoopAnimations(),
        { provide: Router, useValue: mockRouter as unknown as Router },
        {
          provide: AppointmentsService,
          useValue: mockAppointmentsService as unknown as AppointmentsService,
        },
        { provide: PageHeaderService, useValue: mockPageHeaderService as unknown as PageHeaderService },
      ],
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe.each([
    ['Patient A', PATIENT_A],
    ['Patient B', PATIENT_B],
  ])('Reason for Visit dialog identity (AC-005.1 / AC-001.1) — %s', (_label, patient) => {
    it("dialog's displayed patient name/ID equal nextPatient's name/ID", () => {
      setNextPatient(patient);

      const visit = component.reasonForVisit();

      expect(visit).not.toBeNull();
      expect(visit!.patient).toBe(patient.name);
      expect(visit!.patientId).toBe(patient.patientCode);
    });
  });

  describe.each([
    ['Patient A', PATIENT_A],
    ['Patient B', PATIENT_B],
  ])('Allergy Alert dialog identity (AC-005.2 / AC-002.1) — %s', (_label, patient) => {
    it("rendered allergy dialog header name/ID equal nextPatient's name/ID", () => {
      setNextPatient(patient);
      component.allergyAlertDialogOpened = true;
      fixture.detectChanges();

      expect(component.allergyPatientName()).toBe(patient.name);
      expect(component.allergyPatientCode()).toBe(patient.patientCode);

      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain(patient.name);
      expect(text).toContain(patient.patientCode);
    });
  });

  it('switching next patient updates both dialogs and leaves no stale data (AC-005.3 / AC-001.2 / AC-002.2)', () => {
    setNextPatient(PATIENT_A);
    component.reasonForVisitDialogOpened = true;
    component.allergyAlertDialogOpened = true;
    fixture.detectChanges();

    let text = fixture.nativeElement.textContent as string;
    expect(text).toContain(PATIENT_A.name);
    expect(text).toContain(PATIENT_A.visitReason!.visitType);
    expect(text).toContain(PATIENT_A.allergies![1].allergen); // severe allergen
    expect(text).toContain(PATIENT_A.allergies![1].reaction);

    setNextPatient(PATIENT_B);
    fixture.detectChanges();

    text = fixture.nativeElement.textContent as string;

    // New patient's data is present
    expect(text).toContain(PATIENT_B.name);
    expect(text).toContain(PATIENT_B.patientCode);
    expect(text).toContain(PATIENT_B.visitReason!.visitType);
    expect(text).toContain(PATIENT_B.visitReason!.primaryConcern);
    expect(text).toContain(PATIENT_B.allergies![0].allergen);
    expect(text).toContain(PATIENT_B.allergies![0].severity);
    expect(text).toContain(PATIENT_B.allergies![0].reaction);
    expect(text).toContain(PATIENT_B.allergies![0].crossReactivities[0]);

    // No trace of the previous patient's identity or clinical data remains (NFR Data Integrity)
    expect(text).not.toContain(PATIENT_A.name);
    expect(text).not.toContain(PATIENT_A.patientCode);
    expect(text).not.toContain(PATIENT_A.visitReason!.visitType);
    expect(text).not.toContain(PATIENT_A.allergies![0].allergen);
    expect(text).not.toContain(PATIENT_A.allergies![1].allergen);
  });

  it('a patient with multiple allergies exposes all of them, severe first (AC-002.3)', () => {
    setNextPatient(PATIENT_A);

    const allergies = component.allergyAlerts();

    expect(allergies.length).toBe(2);
    expect(allergies[0].severity).toBe('Severe');
    expect(allergies[0].allergen).toBe('Alpha Allergen Severe');
  });

  it('a patient with no recorded allergies shows the explicit empty state (AC-003.1)', () => {
    const noAllergyPatient = buildPatient({
      id: 300,
      name: 'No Allergy Patient',
      patientCode: 'P-N00003',
      visitReason: PATIENT_A.visitReason,
      allergies: undefined,
    });
    setNextPatient(noAllergyPatient);
    component.allergyAlertDialogOpened = true;
    fixture.detectChanges();

    expect(component.hasAllergyData()).toBe(false);
    expect(component.allergyAlerts()).toEqual([]);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('No known allergy data recorded for this patient.');
    expect(text).not.toContain('Penicillin');
  });

  it('a patient with no recorded visit reason yields null and blocks opening the dialog (AC-003.2 / AC-003.3)', () => {
    const noVisitPatient = buildPatient({
      id: 301,
      name: 'No Visit Patient',
      patientCode: 'P-N00004',
      visitReason: undefined,
      allergies: PATIENT_A.allergies,
    });
    setNextPatient(noVisitPatient);

    expect(component.reasonForVisit()).toBeNull();
    expect(component.hasVisitReason()).toBe(false);

    component.openReasonForVisitDialog();

    expect(component.reasonForVisitDialogOpened).toBe(false);
  });

  it('no next patient shows the empty state and both dialog openers are no-ops (AC-004.1 / AC-004.2)', () => {
    setNextPatient(null);
    fixture.detectChanges();

    expect(component.nextPatient()).toBeNull();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('No upcoming patients scheduled for today.');

    component.openReasonForVisitDialog();
    component.openAllergyAlertDialog();

    expect(component.reasonForVisitDialogOpened).toBe(false);
    expect(component.allergyAlertDialogOpened).toBe(false);
  });
});
