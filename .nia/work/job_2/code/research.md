# Research: Patient Case State Feature (Issue #2)

## 1. Executive Summary

This document captures research findings, design decisions, and technical analysis for implementing the Patient Case State feature for Daily Alerts in the healthcare application.

---

## 2. Current Architecture Analysis

### 2.1 Existing Data Structures

**DailyAlert Interface** (`src/app/data/home.data.ts`):

```typescript
export interface DailyAlert {
  id: number;
  title: string;
  patient: string;
  patientId: string;
  time: string;
  condition: string;
  value: string;
  normalRange: string;
  priority: string; // "High" | "Medium" - clinical priority
  details: string;
  recommendations: string[];
}
```

**Key Observation**: The `priority` field tracks clinical urgency (High/Medium), not workflow state. The new `caseState` will be orthogonal to this.

### 2.2 Current UI Components

| Location            | Component                      | Purpose                                                   |
| ------------------- | ------------------------------ | --------------------------------------------------------- |
| `home.ts`           | HomeComponent                  | Main dashboard managing daily alerts                      |
| `home.html:226`     | `@for (alert of dailyAlerts)`  | Alert list rendering loop                                 |
| `home.html:420-497` | Alert Details Dialog           | Modal for viewing alert details with "Acknowledge" action |
| `home.css:367-428`  | `.daily-alerts`, `.alert-item` | Alert list styling                                        |

### 2.3 Visual Pattern Analysis

The application uses Kendo UI chips consistently for status display:

| Context            | States                                     | Color Mapping                 |
| ------------------ | ------------------------------------------ | ----------------------------- |
| Patient Status     | Critical, Monitoring, Stable               | error, warning, success       |
| Appointment Status | Complete, In Progress, Upcoming, Cancelled | success, warning, info, error |

**Design Decision**: Follow the established chip pattern for case state visualization.

---

## 3. Design Decisions

### 3.1 Case State Values

| State         | Description                 | Semantic           |
| ------------- | --------------------------- | ------------------ |
| `Open`        | New alert, not yet reviewed | Requires attention |
| `In Progress` | Actively being addressed    | Work in progress   |
| `Resolved`    | Issue has been addressed    | Completed          |

### 3.2 Color Scheme Selection

**Decision**: Use colors distinct from clinical status to prevent confusion (NFR-001).

| Case State  | Kendo ChipThemeColor | Rationale                                                               |
| ----------- | -------------------- | ----------------------------------------------------------------------- |
| Open        | `info` (blue)        | Distinct from clinical status colors; draws attention without alarm     |
| In Progress | `warning` (amber)    | Indicates active work; consistent with "In Progress" appointment status |
| Resolved    | `success` (green)    | Completion indicator; consistent with "Complete" appointment status     |

### 3.3 State Persistence Strategy

**Options Evaluated**:

| Option                 | Pros                                       | Cons             | Decision        |
| ---------------------- | ------------------------------------------ | ---------------- | --------------- |
| In-memory only         | Simple, no storage setup                   | Lost on refresh  | ❌ Rejected     |
| localStorage           | Persists across refresh, no backend needed | Demo-appropriate | ✅ **Selected** |
| Service state (memory) | Survives navigation                        | Lost on refresh  | ❌ Rejected     |

**Implementation**: Store case states in localStorage with key `healthcare-alerts-case-state`.

### 3.4 Service Architecture

**Decision**: Create a dedicated `AlertsService` to:

1. Manage alert state (case state CRUD)
2. Persist to localStorage
3. Provide filtering/sorting utilities
4. Keep HomeComponent focused on presentation

**Rationale**: Follows single-responsibility principle; enables future extensibility (e.g., backend integration).

---

## 4. UI/UX Design Decisions

### 4.1 Alert List Display

**Placement**: Case state chip displayed inline with alert title in the alert item list.

**Visual Hierarchy**:

```
┌──────────────────────────────────────────────────────┐
│  CRP elevated - Sophia Martinez  [In Progress]       │
│  Now                                           View > │
└──────────────────────────────────────────────────────┘
```

### 4.2 State Change Interaction

**Decision**: Use a button group (Kendo ButtonGroup) in the Alert Details Dialog to change state.

**Rationale**:

- Maximum 2 clicks required (open dialog, click state) - meets NFR-004
- Clear visual feedback of current state
- Familiar pattern from other Kendo UI components

**Alternative Considered**: Dropdown menu - rejected as less discoverable and requires more clicks.

### 4.3 Filtering Mechanism

**Decision**: Add a filter button group above the Daily Alerts list with options:

- All (default)
- Open
- In Progress
- Resolved

**Rationale**: Single-click filtering; consistent with established application patterns.

---

## 5. Technical Specifications

### 5.1 Type Definitions

```typescript
// New type for case state
export type CaseState = 'Open' | 'In Progress' | 'Resolved';

// Extended alert interface
export interface DailyAlertWithState extends DailyAlert {
  caseState: CaseState;
}

// Storage schema
interface AlertStateStorage {
  [alertId: number]: CaseState;
}
```

### 5.2 Service API Design

```typescript
class AlertsService {
  // Observable for reactive updates
  alerts$: Observable<DailyAlertWithState[]>;

  // State management
  getCaseState(alertId: number): CaseState;
  setCaseState(alertId: number, state: CaseState): void;

  // Filtering
  getFilteredAlerts(filter: CaseState | 'All'): DailyAlertWithState[];
}
```

### 5.3 Component Changes Summary

| File                                 | Changes                                                |
| ------------------------------------ | ------------------------------------------------------ |
| `src/app/data/home.data.ts`          | Add `CaseState` type, `DailyAlertWithState` interface  |
| `src/app/services/alerts.service.ts` | New service (state management, persistence)            |
| `src/app/home/home.ts`               | Inject AlertsService, add filter state, update methods |
| `src/app/home/home.html`             | Add case state chips, filter UI, state change buttons  |
| `src/app/home/home.css`              | Styles for case state chips, filter buttons            |

---

## 6. Edge Cases and Handling

| Edge Case                           | Handling                                          |
| ----------------------------------- | ------------------------------------------------- |
| New alert without case state        | Default to `Open`                                 |
| Invalid state in localStorage       | Reset to `Open`, log warning                      |
| Alert deleted while in localStorage | Ignore orphaned entries; clean up on service init |
| Rapid state changes                 | Last-write-wins (acceptable for demo)             |
| Page refresh mid-transition         | State persisted before visual update completes    |

---

## 7. Accessibility Considerations

| Requirement           | Implementation                                               |
| --------------------- | ------------------------------------------------------------ |
| Screen reader support | Use `aria-label` on state chips describing full state        |
| Keyboard navigation   | Ensure filter buttons and state change buttons are focusable |
| Color contrast        | Kendo theme colors meet WCAG 2.1 AA                          |
| Focus management      | Return focus to trigger after dialog close                   |

---

## 8. Testing Strategy

### 8.1 Unit Tests

| Test Area     | Test Cases                                        |
| ------------- | ------------------------------------------------- |
| AlertsService | State CRUD, persistence, filtering, default state |
| HomeComponent | Filter interaction, state change flow             |

### 8.2 Manual Testing Scenarios

| Scenario         | Steps                              | Expected Result                     |
| ---------------- | ---------------------------------- | ----------------------------------- |
| View case state  | Open home page                     | Each alert shows case state chip    |
| Change state     | Open alert → Click "In Progress"   | State updates visually and persists |
| Filter alerts    | Click "Open" filter                | Only Open alerts displayed          |
| Persistence      | Change state → Refresh page        | State preserved                     |
| Re-open resolved | Open resolved alert → Click "Open" | State changes to Open               |

---

## 9. Open Questions (Resolved)

| Question                                   | Resolution                                                |
| ------------------------------------------ | --------------------------------------------------------- |
| Where to display case state in alert list? | Inline with title (right-aligned chip)                    |
| How to handle state transitions?           | Any state can transition to any other (flexible workflow) |
| Should filter selection persist?           | No - reset to "All" on page load for clean UX             |

---

## 10. References

- Kendo UI Angular Buttons Documentation: ChipThemeColor, ButtonGroup
- Issue #2 Requirements: Patient Case State (Open / In Progress / Resolved)
- Application Style Guide: home.css chip patterns
