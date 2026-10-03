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

  describe('getRecommendations', () => {
    it('returns an empty recommendation list for an unknown patient', () => {
      expect(service.getRecommendations(-1)).toEqual([]);
    });

    it('returns the three core actions for a valid patient', () => {
      const existingPatient = service.getAllPatients()[0];
      const recommendations = service.getRecommendations(existingPatient.id);

      expect(recommendations.map((r) => r.id)).toEqual([
        'review-vitals',
        'request-lab',
        'schedule-follow-up',
      ]);
    });

    it('flags vitals review as high urgency for a critical patient', () => {
      const criticalPatient = service.getAllPatients().find((p) => p.status === 'Critical');
      if (!criticalPatient) {
        return;
      }

      const recommendations = service.getRecommendations(criticalPatient.id);
      const reviewVitals = recommendations.find((r) => r.id === 'review-vitals');

      expect(reviewVitals?.urgency).toBe('high');
    });

    it('marks follow-up as normal urgency for a stable patient', () => {
      const stablePatient = service.getAllPatients().find((p) => p.status === 'Stable');
      if (!stablePatient) {
        return;
      }

      const recommendations = service.getRecommendations(stablePatient.id);
      const followUp = recommendations.find((r) => r.id === 'schedule-follow-up');

      expect(followUp?.urgency).toBe('normal');
    });

    it('includes a non-empty reason for every recommendation', () => {
      const existingPatient = service.getAllPatients()[0];
      const recommendations = service.getRecommendations(existingPatient.id);

      recommendations.forEach((recommendation) => {
        expect(recommendation.reason.length).toBeGreaterThan(0);
      });
    });
  });
});
