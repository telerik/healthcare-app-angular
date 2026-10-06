import { DAILY_ALERTS, HOME_PATIENTS } from './home.data';
import { PATIENTS_DATA } from './patients.data';

const PLACEHOLDER_PATTERN = /^(tbd|n\/a|lorem)$/i;

describe('DAILY_ALERTS / HOME_PATIENTS data integrity', () => {
  it('resolves every alert patientId to exactly one PATIENTS_DATA.patientCode', () => {
    DAILY_ALERTS.forEach((alert) => {
      const matches = PATIENTS_DATA.filter((p) => p.patientCode === alert.patientId);
      expect(matches.length).toBe(1);
    });
  });

  it('has unique patientIds across all alerts', () => {
    const ids = DAILY_ALERTS.map((alert) => alert.patientId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has a non-empty, non-placeholder suggestedAction for every alert', () => {
    DAILY_ALERTS.forEach((alert) => {
      expect(alert.suggestedAction).toBeTruthy();
      expect(alert.suggestedAction.trim().length).toBeGreaterThan(0);
      expect(PLACEHOLDER_PATTERN.test(alert.suggestedAction.trim())).toBe(false);
    });
  });

  it('has a priority of High, Medium, or Low for every alert', () => {
    DAILY_ALERTS.forEach((alert) => {
      expect(['High', 'Medium', 'Low']).toContain(alert.priority);
    });
  });

  it('includes every alert patientId in HOME_PATIENTS', () => {
    const homePatientIds = new Set(HOME_PATIENTS.map((p) => p.patientId));
    DAILY_ALERTS.forEach((alert) => {
      expect(homePatientIds.has(alert.patientId)).toBe(true);
    });
  });

  it('derives HOME_PATIENTS 1:1 from PATIENTS_DATA', () => {
    expect(HOME_PATIENTS.length).toBe(PATIENTS_DATA.length);
    HOME_PATIENTS.forEach((homePatient, index) => {
      expect(homePatient.id).toBe(PATIENTS_DATA[index].id);
      expect(homePatient.name).toBe(PATIENTS_DATA[index].name);
      expect(homePatient.patientId).toBe(PATIENTS_DATA[index].patientCode);
    });
  });
});
