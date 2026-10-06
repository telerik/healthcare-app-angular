import { Injectable } from '@angular/core';
import { PATIENTS_DATA, Patient, PatientProfile } from '../data/patients.data';

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
   * Get full patient profile by patient code (case-insensitive), e.g. 'P-104505'
   */
  public getPatientByCode(code: string): PatientProfile | null {
    if (!code) {
      return null;
    }
    const normalized = code.trim().toUpperCase();
    return this.patientsData.find((p) => p.patientCode.toUpperCase() === normalized) || null;
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
}
