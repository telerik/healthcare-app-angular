import { Injectable } from '@angular/core';
import {
  PATIENTS_DATA,
  Patient,
  PatientProfile,
  PatientRecommendation,
} from '../data/patients.data';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private patientsData: PatientProfile[] = PATIENTS_DATA;

  /**
   * Get all patients (list view data)
   */
  public getAllPatients(): Patient[] {
    return this.patientsData.map((patient) => ({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      status: patient.status,
      gender: patient.gender,
      bloodType: patient.bloodType,
      ward: patient.ward,
      diagnosis: patient.diagnosis,
      avatar: patient.avatar,
    }));
  }

  /**
   * Get full patient profile by ID
   */
  public getPatientById(id: number): PatientProfile | null {
    return this.patientsData.find((patient) => patient.id === id) || null;
  }

  /**
   * Update patient notes
   */
  public updatePatientNotes(id: number, notes: string): boolean {
    const patient = this.patientsData.find((p) => p.id === id);
    if (patient) {
      patient.notes = notes;
      return true;
    }
    return false;
  }

  /**
   * Derive demo "next best action" recommendations for a patient.
   * Rule-based over in-memory data — not clinical decision support.
   */
  public getRecommendations(id: number): PatientRecommendation[] {
    const patient = this.getPatientById(id);
    if (!patient) {
      return [];
    }

    const o2 = this.parseVital(patient.vitals.o2Saturation);
    const heartRate = this.parseVital(patient.vitals.heartRate);
    const vitalsNeedReview =
      patient.status === 'Critical' ||
      (o2 !== null && o2 < 92) ||
      (heartRate !== null && heartRate > 100);

    const abnormalLabs = patient.labResults.filter((result) => result.status !== 'Stable').length;

    return [
      {
        id: 'review-vitals',
        label: 'Review vitals',
        reason: vitalsNeedReview
          ? 'One or more recent vitals are outside the expected range.'
          : 'Recent vitals are within the expected range.',
        urgency: vitalsNeedReview ? 'high' : 'normal',
      },
      {
        id: 'request-lab',
        label: 'Request lab',
        reason:
          abnormalLabs > 0
            ? `${abnormalLabs} lab result(s) flagged for follow-up.`
            : 'No flagged lab results; consider routine testing.',
        urgency: abnormalLabs > 0 ? 'high' : 'normal',
      },
      {
        id: 'schedule-follow-up',
        label: 'Schedule follow-up',
        reason:
          patient.status === 'Stable'
            ? 'Consider a routine follow-up appointment.'
            : 'Suggested follow-up while the patient is under observation.',
        urgency: patient.status === 'Stable' ? 'normal' : 'high',
      },
    ];
  }

  private parseVital(value: string): number | null {
    const match = /-?\d+(\.\d+)?/.exec(value);
    return match ? Number(match[0]) : null;
  }
}
