# Phase 2: Alerts Service

## Objective

Create a dedicated service to manage alert case state, handle localStorage persistence, and provide filtering utilities.

---

## Dependencies

- **Phase 1**: CaseState type and DailyAlertWithState interface must be defined

---

## Tasks

### TASK-2.1: Create AlertsService File

**File to Create**: `src/app/services/alerts.service.ts`

**Full Implementation**:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { DAILY_ALERTS, DailyAlertWithState, CaseState } from '../data/home.data';

const STORAGE_KEY = 'healthcare-alerts-case-state';

interface StoredCaseStates {
  [alertId: number]: CaseState;
}

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
    localStorage.removeItem(STORAGE_KEY);
  }
}
```

**Verification**:

- File created at correct path
- No TypeScript compilation errors
- Service can be injected (test by importing in HomeComponent temporarily)

---

### TASK-2.2: Implement localStorage Persistence Methods

**Status**: Included in TASK-2.1 implementation

The following methods handle persistence:

- `loadFromStorage()`: Loads and validates stored states on service initialization
- `saveToStorage()`: Persists states to localStorage after each change

**Key Behaviors**:

- Invalid states are filtered out during load
- JSON parse errors are caught and logged
- Missing localStorage gracefully defaults to empty object

---

### TASK-2.3: Implement getCaseState Method

**Status**: Included in TASK-2.1 implementation

**Method Signature**:

```typescript
public getCaseState(alertId: number): CaseState
```

**Behavior**:

1. Check stored states signal for alertId
2. If found, return stored state
3. If not found, check original DAILY_ALERTS for default
4. Fallback to 'Open' if no state exists

---

### TASK-2.4: Implement setCaseState Method

**Status**: Included in TASK-2.1 implementation

**Method Signature**:

```typescript
public setCaseState(alertId: number, state: CaseState): void
```

**Behavior**:

1. Create new state object with updated value (immutable update)
2. Update storedStates signal
3. Persist to localStorage synchronously

---

### TASK-2.5: Implement getFilteredAlerts Method

**Status**: Included in TASK-2.1 implementation

**Method Signature**:

```typescript
public getFilteredAlerts(filter: CaseState | 'All'): DailyAlertWithState[]
```

**Behavior**:

1. Get current alerts from computed signal
2. If filter is 'All', return all alerts
3. Otherwise, filter by matching caseState

---

## Phase Completion Criteria

| Criterion               | Verification Method                                 |
| ----------------------- | --------------------------------------------------- |
| Service file created    | File exists at `src/app/services/alerts.service.ts` |
| Service injectable      | Can inject in component without error               |
| getCaseState works      | Returns 'Open' for new alert                        |
| setCaseState persists   | Set state, refresh page, state preserved            |
| getFilteredAlerts works | Returns subset when filter applied                  |
| Application builds      | `npm run build` succeeds                            |

---

## Testing Commands

```bash
# Verify TypeScript compilation
npm run build

# Start app and test manually
npm run start
# Then in browser console:
# localStorage.getItem('healthcare-alerts-case-state')
```

---

## Rollback Procedure

If issues arise:

1. Delete `src/app/services/alerts.service.ts`
2. Remove any AlertsService imports from other files
