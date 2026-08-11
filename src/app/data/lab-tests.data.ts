export interface LabRequestPatient {
  id: number;
  name: string;
  identifier: string;
}

export interface LabTestOption {
  id: number;
  name: string;
  defaultSelected: boolean;
}

export interface LabTestRequest {
  patientId: number;
  testIds: number[];
}

export const LAB_TEST_OPTIONS: readonly LabTestOption[] = Object.freeze(
  [
    { id: 1, name: 'Complete blood count (CBC)', defaultSelected: false },
    { id: 2, name: 'Comprehensive metabolic panel (CMP)', defaultSelected: true },
    { id: 3, name: 'Basic metabolic panel (BMP)', defaultSelected: false },
    { id: 4, name: 'Lipid panel', defaultSelected: false },
    { id: 5, name: 'Thyroid function tests (TSH, T3, T4)', defaultSelected: false },
    { id: 6, name: 'Hemoglobin A1C (HbA1c)', defaultSelected: false },
    { id: 7, name: 'Liver function tests (LFTs)', defaultSelected: false },
    { id: 8, name: 'Urinalysis', defaultSelected: false },
    { id: 9, name: 'Vitamin D levels', defaultSelected: false },
    { id: 10, name: 'Prostate-specific antigen (PSA)', defaultSelected: false },
  ].map((test) => Object.freeze(test)),
);
