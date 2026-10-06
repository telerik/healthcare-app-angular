import {
  DEFAULT_SUGGESTED_ACTION_BY_PRIORITY,
  GENERIC_SUGGESTED_ACTION,
  SUGGESTED_ACTIONS_BY_CONDITION,
  resolveSuggestedAction,
} from './alert-suggestions';
import { DailyAlert } from './home.data';

describe('resolveSuggestedAction', () => {
  it('returns the alert own suggestedAction when present', () => {
    const alert = {
      condition: 'CRP Elevated',
      priority: 'High' as const,
      suggestedAction: 'Custom follow-up text for this specific patient.',
    };

    expect(resolveSuggestedAction(alert)).toBe(alert.suggestedAction);
  });

  it('falls back to the condition map when suggestedAction is empty', () => {
    const alert = {
      condition: 'CRP Elevated',
      priority: 'High' as const,
      suggestedAction: '',
    };

    expect(resolveSuggestedAction(alert)).toBe(SUGGESTED_ACTIONS_BY_CONDITION['CRP Elevated']);
  });

  it('falls back to the condition map when suggestedAction is whitespace only', () => {
    const alert = {
      condition: 'Blood Pressure High',
      priority: 'High' as const,
      suggestedAction: '   ',
    };

    expect(resolveSuggestedAction(alert)).toBe(
      SUGGESTED_ACTIONS_BY_CONDITION['Blood Pressure High'],
    );
  });

  it('falls back to the priority default for an unknown condition', () => {
    const alert = {
      condition: 'Some Unmapped Condition',
      priority: 'Medium' as const,
      suggestedAction: '',
    };

    expect(resolveSuggestedAction(alert)).toBe(DEFAULT_SUGGESTED_ACTION_BY_PRIORITY['Medium']);
  });

  it('returns GENERIC_SUGGESTED_ACTION for null or undefined alerts', () => {
    expect(resolveSuggestedAction(null)).toBe(GENERIC_SUGGESTED_ACTION);
    expect(resolveSuggestedAction(undefined)).toBe(GENERIC_SUGGESTED_ACTION);
  });

  it('returns GENERIC_SUGGESTED_ACTION for an out-of-set priority value', () => {
    const alert = {
      condition: 'Some Unmapped Condition',
      priority: 'Critical',
      suggestedAction: '',
    } as unknown as DailyAlert;

    expect(resolveSuggestedAction(alert)).toBe(GENERIC_SUGGESTED_ACTION);
  });
});
