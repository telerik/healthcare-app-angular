import { Injectable, signal, computed } from '@angular/core';
import { DAILY_ALERTS, DailyAlertWithState, CaseState } from '../data/home.data';

const STORAGE_KEY = 'healthcare-alerts-case-state';

type StoredCaseStates = Record<number, CaseState>;

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private storedStates = signal<StoredCaseStates>(this.loadFromStorage());

  /**
   * Computed signal providing alerts with current case states
   */
  public alerts = computed<DailyAlertWithState[]>(() => {
    const states = this.storedStates();
    return DAILY_ALERTS.map((alert) => ({
      ...alert,
      caseState: states[alert.id] ?? alert.caseState ?? 'Open',
    }));
  });

  /**
   * Get the case state for a specific alert
   */
  public getCaseState(alertId: number): CaseState {
    const states = this.storedStates();
    const alert = DAILY_ALERTS.find((a) => a.id === alertId);
    return states[alertId] ?? alert?.caseState ?? 'Open';
  }

  /**
   * Set the case state for a specific alert
   */
  public setCaseState(alertId: number, state: CaseState): void {
    const currentStates = this.storedStates();
    const newStates = { ...currentStates, [alertId]: state };
    this.storedStates.set(newStates);
    this.saveToStorage(newStates);
  }

  /**
   * Get alerts filtered by case state
   */
  public getFilteredAlerts(filter: CaseState | 'All'): DailyAlertWithState[] {
    const allAlerts = this.alerts();
    if (filter === 'All') {
      return allAlerts;
    }
    return allAlerts.filter((alert) => alert.caseState === filter);
  }

  /**
   * Load case states from localStorage
   */
  private loadFromStorage(): StoredCaseStates {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate stored states
        const validStates: StoredCaseStates = {};
        for (const [key, value] of Object.entries(parsed)) {
          const alertId = parseInt(key, 10);
          if (!isNaN(alertId) && ['Open', 'In Progress', 'Resolved'].includes(value as string)) {
            validStates[alertId] = value as CaseState;
          }
        }
        return validStates;
      }
    } catch (error) {
      console.warn('Failed to load alert states from localStorage:', error);
    }
    return {};
  }

  /**
   * Save case states to localStorage
   */
  private saveToStorage(states: StoredCaseStates): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    } catch (error) {
      console.warn('Failed to save alert states to localStorage:', error);
    }
  }

  /**
   * Reset all case states (for testing/debugging)
   */
  public resetAllStates(): void {
    this.storedStates.set({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to remove alert states from localStorage:', error);
    }
  }
}
