import { TestBed } from '@angular/core/testing';
import { PatientsService } from './patients.service';

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return patients list', () => {
    const patients = service.getAllPatients();

    expect(Array.isArray(patients)).toBe(true);
    expect(patients.length).toBeGreaterThan(0);
    expect(patients[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
      }),
    );
  });

  it('should return null for unknown patient id', () => {
    const patient = service.getPatientById(-1);

    expect(patient).toBeNull();
  });

  it('should update notes for existing patient', () => {
    const existingPatient = service.getAllPatients()[0];
    const updated = service.updatePatientNotes(existingPatient.id, 'Dummy test notes');
    const profile = service.getPatientById(existingPatient.id);

    expect(updated).toBe(true);
    expect(profile?.notes).toBe('Dummy test notes');
  });
});
