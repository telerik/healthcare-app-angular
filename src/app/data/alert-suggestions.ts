import { AlertPriority, DailyAlert } from './home.data';

/**
 * Condition-keyed fallback copy used when an alert's own `suggestedAction` is missing.
 * Mirrors the per-alert text in `home.data.ts` so future alerts for the same condition
 * get sensible defaults even before clinical copy is authored for them.
 */
export const SUGGESTED_ACTIONS_BY_CONDITION: Record<string, string> = {
  'CRP Elevated': 'Order an inflammatory markers panel and review for infection within 24 hours.',
  'Blood Pressure High':
    'Review antihypertensive dosage and recheck blood pressure before the patient leaves.',
  'Glucose Levels Elevated':
    'Order an HbA1c test and schedule a diabetes-prevention follow-up in 2 weeks.',
  'High Cholesterol': 'Initiate statin therapy and schedule a cardiovascular risk assessment.',
  'Low Hemoglobin': 'Order iron studies and a full blood count, and assess for active bleeding.',
  'Elevated Creatinine': 'Discontinue NSAIDs now and order a renal ultrasound with GFR estimation.',
  'Abnormal ECG':
    'Repeat the ECG immediately, order troponin, and request an urgent cardiology consult.',
  Hypokalemia: 'Start oral potassium supplementation and repeat the electrolyte panel in 24 hours.',
};

/** Last-resort fallback when the condition itself is unrecognized. */
export const DEFAULT_SUGGESTED_ACTION_BY_PRIORITY: Record<AlertPriority, string> = {
  High: 'Review this patient urgently and confirm the next clinical step.',
  Medium: 'Review this result and schedule an appropriate follow-up.',
  Low: 'Monitor this result at the next routine review.',
};

/** Final fallback for an unknown/unrecognized priority or a missing alert. */
export const GENERIC_SUGGESTED_ACTION =
  'Review this alert and determine the appropriate clinical follow-up.';

/**
 * Resolves the text to show in the "Suggested Next Action" block for a given alert.
 * Resolution order: explicit `suggestedAction` field -> condition map -> priority default
 * -> generic fallback. Never throws and never returns an empty string.
 */
export function resolveSuggestedAction(
  alert: Pick<DailyAlert, 'condition' | 'priority' | 'suggestedAction'> | null | undefined,
): string {
  if (!alert) {
    return GENERIC_SUGGESTED_ACTION;
  }
  if (alert.suggestedAction && alert.suggestedAction.trim().length > 0) {
    return alert.suggestedAction;
  }
  const byCondition = SUGGESTED_ACTIONS_BY_CONDITION[alert.condition];
  if (byCondition) {
    return byCondition;
  }
  return DEFAULT_SUGGESTED_ACTION_BY_PRIORITY[alert.priority] ?? GENERIC_SUGGESTED_ACTION;
}
