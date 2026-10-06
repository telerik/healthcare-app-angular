export interface DailyAlert {
  id: number;
  title: string;
  patient: string;
  patientId: string;
  time: string;
  condition: string;
  value: string;
  normalRange: string;
  priority: string;
  details: string;
  recommendations: string[];
}

export interface HomePatient {
  id: number;
  name: string;
  patientId: string;
}

export interface LabTest {
  id: number;
  name: string;
  selected: boolean;
}

export interface PreviousVisit {
  date: string;
  description: string;
}

/**
 * Clinical detail shown in the "Reason for Visit" dialog.
 * Deliberately excludes patient name/id: those must always come from the
 * active patient (e.g. the Next Patient card) so the dialog can never drift
 * out of sync with the patient it is describing.
 */
export interface ReasonForVisitDetails {
  appointmentDate: string;
  visitType: string;
  primaryConcern: string;
  background: string;
  previousVisits: PreviousVisit[];
  objectives: string[];
  preparationNotes: string[];
}

/**
 * Clinical detail shown in the "Allergy Alert" dialog.
 * Deliberately excludes patient name/id for the same reason as
 * {@link ReasonForVisitDetails}.
 */
export interface AllergyAlertDetails {
  allergen: string;
  allergyType: string;
  severity: string;
  reaction: string;
  firstReported: string;
  symptoms: string[];
  crossReactivities: string[];
  safeAlternatives: string[];
  emergencyProtocol: string[];
  notes: string;
}

export const DAILY_ALERTS: DailyAlert[] = [
  {
    id: 1,
    title: 'CRP elevated - Sophia Martinez',
    patient: 'Sophia Martinez',
    patientId: 'P-105328',
    time: 'Now',
    condition: 'CRP Elevated',
    value: '12.5 mg/L',
    normalRange: '0-10 mg/L',
    priority: 'High',
    details:
      'C-reactive protein (CRP) levels are significantly elevated, indicating possible inflammation or infection. Recent lab results show a marked increase from the last test.',
    recommendations: [
      'Order additional inflammatory markers panel',
      'Review recent medical history for infection symptoms',
      'Schedule follow-up appointment within 48 hours',
      'Consider antibiotic treatment if infection is suspected',
    ],
  },
  {
    id: 2,
    title: 'Blood pressure high - James Carter',
    patient: 'James Carter',
    patientId: 'P-104582',
    time: '2 min ago',
    condition: 'Blood Pressure High',
    value: '165/98 mmHg',
    normalRange: '120/80 mmHg',
    priority: 'High',
    details:
      'Blood pressure readings are consistently elevated above normal range. Patient has history of hypertension but readings have increased despite current medication.',
    recommendations: [
      'Review current antihypertensive medication dosage',
      'Check for medication compliance',
      'Order ECG and kidney function tests',
      'Consider adjusting or adding medication',
      'Advise lifestyle modifications (diet, exercise, stress management)',
    ],
  },
  {
    id: 3,
    title: 'Glucose levels elevated - Daniel Rivera',
    patient: 'Daniel Rivera',
    patientId: 'P-103847',
    time: '8 min ago',
    condition: 'Glucose Levels Elevated',
    value: '185 mg/dL',
    normalRange: '70-100 mg/dL',
    priority: 'Medium',
    details:
      'Fasting glucose levels are elevated above normal range. Patient has pre-diabetes diagnosis and recent readings show progression.',
    recommendations: [
      'Order HbA1c test to assess long-term glucose control',
      'Review dietary habits and suggest nutritionist consultation',
      'Discuss diabetes prevention program enrollment',
      'Consider starting metformin if HbA1c confirms progression',
      'Schedule follow-up in 2 weeks to monitor glucose levels',
    ],
  },
  {
    id: 4,
    title: 'High cholesterol detected - Ava Thompson',
    patient: 'Ava Thompson',
    patientId: 'P-106749',
    time: '15 min ago',
    condition: 'High Cholesterol',
    value: 'Total: 265 mg/dL, LDL: 175 mg/dL',
    normalRange: 'Total: <200 mg/dL, LDL: <100 mg/dL',
    priority: 'Medium',
    details:
      'Lipid panel shows significantly elevated total cholesterol and LDL levels, increasing cardiovascular risk. Patient has family history of heart disease.',
    recommendations: [
      'Prescribe statin therapy (e.g., atorvastatin 20mg)',
      'Order comprehensive cardiovascular risk assessment',
      'Refer to dietitian for heart-healthy diet plan',
      'Recommend regular aerobic exercise program',
      'Recheck lipid panel in 6-8 weeks after treatment initiation',
    ],
  },
  {
    id: 5,
    title: 'Low hemoglobin - Marcus Johnson',
    patient: 'Marcus Johnson',
    patientId: 'P-107312',
    time: '22 min ago',
    condition: 'Low Hemoglobin',
    value: '9.2 g/dL',
    normalRange: '13.5-17.5 g/dL',
    priority: 'High',
    details:
      'Hemoglobin levels are critically below the normal range suggesting moderate anemia. Patient reports fatigue and shortness of breath on exertion.',
    recommendations: [
      'Order full blood count and iron studies',
      'Assess for underlying cause (nutritional deficiency, chronic disease, bleeding)',
      'Consider iron supplementation if iron-deficiency confirmed',
      'Schedule transfusion evaluation if levels drop below 8 g/dL',
    ],
  },
  {
    id: 6,
    title: 'Elevated creatinine - Olivia Chen',
    patient: 'Olivia Chen',
    patientId: 'P-108456',
    time: '35 min ago',
    condition: 'Elevated Creatinine',
    value: '2.1 mg/dL',
    normalRange: '0.5-1.1 mg/dL',
    priority: 'High',
    details:
      'Serum creatinine is markedly elevated indicating reduced kidney function. Patient is on NSAIDs which may be contributing to renal impairment.',
    recommendations: [
      'Discontinue NSAIDs immediately',
      'Order renal ultrasound and GFR estimation',
      'Ensure adequate hydration',
      'Consult nephrology if levels do not improve within 48 hours',
    ],
  },
  {
    id: 7,
    title: 'Abnormal ECG - Robert Patel',
    patient: 'Robert Patel',
    patientId: 'P-109023',
    time: '52 min ago',
    condition: 'Abnormal ECG',
    value: 'ST-segment depression',
    normalRange: 'Normal sinus rhythm',
    priority: 'High',
    details:
      'ECG shows ST-segment depression in leads V4-V6, potentially indicating myocardial ischemia. Patient reports intermittent chest tightness.',
    recommendations: [
      'Perform repeat ECG immediately',
      'Order troponin and BNP blood tests',
      'Place patient on cardiac monitoring',
      'Cardiology consult urgently',
      'Prepare for possible stress test or angiography',
    ],
  },
  {
    id: 8,
    title: 'Potassium level low - Elena Vasquez',
    patient: 'Elena Vasquez',
    patientId: 'P-110198',
    time: '1 hr ago',
    condition: 'Hypokalemia',
    value: '2.9 mEq/L',
    normalRange: '3.5-5.0 mEq/L',
    priority: 'Medium',
    details:
      'Potassium levels are below normal range. Patient is on loop diuretics for heart failure management which can cause potassium depletion.',
    recommendations: [
      'Initiate oral potassium supplementation',
      'Review diuretic dosage and consider potassium-sparing diuretic',
      'Order repeat electrolyte panel in 24 hours',
      'Advise high-potassium diet (bananas, leafy greens)',
    ],
  },
];

export const HOME_PATIENTS: HomePatient[] = [
  { id: 1, name: 'James Wilson', patientId: 'P-104582' },
  { id: 2, name: 'Sarah Johnson', patientId: 'P-102439' },
  { id: 3, name: 'Michael Chen', patientId: 'P-105821' },
  { id: 4, name: 'Emily Davis', patientId: 'P-103764' },
  { id: 5, name: 'Robert Martinez', patientId: 'P-106235' },
];

/**
 * Reason-for-visit details keyed by `PatientProfile.id` (not name, since
 * names are not guaranteed unique). Only patients with a populated record
 * here have visit-reason data; any other patient id intentionally has no
 * entry so the UI can render an explicit empty state instead of falling
 * back to another patient's data.
 */
export const REASON_FOR_VISIT_BY_PATIENT_ID: Record<number, ReasonForVisitDetails> = {
  3: {
    appointmentDate: 'Today, 9:30 AM',
    visitType: 'Cardiology Follow-up',
    primaryConcern: 'Post-procedure cardiac monitoring',
    background:
      'Patient is scheduled for a routine cardiology follow-up appointment following a successful cardiac catheterization procedure performed 6 weeks ago. The procedure was done to evaluate coronary artery disease.',
    previousVisits: [
      { date: '6 weeks ago', description: 'Cardiac catheterization procedure - successful' },
      {
        date: '3 months ago',
        description: 'Initial cardiology consultation - chest pain evaluation',
      },
      { date: '4 months ago', description: 'Stress test - abnormal results' },
    ],
    objectives: [
      'Review catheterization results and discuss findings',
      'Assess current cardiac symptoms and medication response',
      'Evaluate ECG and recent lab work',
      'Review lifestyle modifications and cardiac rehabilitation progress',
      'Adjust medication dosage if necessary',
      'Schedule next follow-up appointment',
    ],
    preparationNotes: [
      'Review patient chart and catheterization report',
      'Have recent ECG and lab results available',
      'Prepare medication adjustment options if needed',
    ],
  },
};

/**
 * Allergy-alert details keyed by `PatientProfile.id`. See
 * {@link REASON_FOR_VISIT_BY_PATIENT_ID} for why patient ids with no entry
 * are intentional (explicit empty state, no fallback to another patient).
 */
export const ALLERGY_ALERT_BY_PATIENT_ID: Record<number, AllergyAlertDetails> = {
  3: {
    allergen: 'Penicillin',
    allergyType: 'Drug Allergy',
    severity: 'Severe',
    reaction: 'Anaphylaxis',
    firstReported: 'March 2018',
    symptoms: [
      'Difficulty breathing and wheezing',
      'Severe skin rash and hives',
      'Swelling of face, lips, and throat',
      'Rapid pulse and dizziness',
      'Loss of consciousness (reported in initial episode)',
    ],
    crossReactivities: [
      'Amoxicillin',
      'Ampicillin',
      'Other beta-lactam antibiotics',
      'Possibly cephalosporins (use with caution)',
    ],
    safeAlternatives: [
      'Fluoroquinolones (e.g., Levofloxacin, Ciprofloxacin)',
      'Macrolides (e.g., Azithromycin, Clarithromycin)',
      'Tetracyclines (e.g., Doxycycline)',
      'Vancomycin for severe infections',
    ],
    emergencyProtocol: [
      'Immediately discontinue any suspected beta-lactam antibiotic',
      'Administer epinephrine 0.3-0.5mg IM if anaphylaxis symptoms appear',
      'Administer antihistamines (Diphenhydramine 50mg)',
      'Provide oxygen support and monitor vital signs',
      'Call emergency response team',
      'Be prepared for potential intubation if airway compromised',
    ],
    notes:
      'Patient carries EpiPen at all times. Family members are trained in emergency response. Allergy documented in all medical records and patient wears medical alert bracelet.',
  },
};

export const LAB_TESTS: LabTest[] = [
  { id: 1, name: 'Complete blood count (CBC)', selected: false },
  { id: 2, name: 'Comprehensive metabolic panel (CMP)', selected: true },
  { id: 3, name: 'Basic metabolic panel (BMP)', selected: false },
  { id: 4, name: 'Lipid panel', selected: false },
  { id: 5, name: 'Thyroid function tests (TSH, T3, T4)', selected: false },
  { id: 6, name: 'Hemoglobin A1C (HbA1c)', selected: false },
  { id: 7, name: 'Liver function tests (LFTs)', selected: false },
  { id: 8, name: 'Urinalysis', selected: false },
  { id: 9, name: 'Vitamin D levels', selected: false },
  { id: 10, name: 'Prostate-specific antigen (PSA)', selected: false },
];
