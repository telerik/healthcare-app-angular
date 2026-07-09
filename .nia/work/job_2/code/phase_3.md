# Phase 3: UI - Display State

## Objective

Display case state chips on each alert in the Daily Alerts list, making workflow state visible to clinical staff.

---

## Dependencies

- **Phase 1**: CaseState type and DailyAlertWithState interface
- **Phase 2**: AlertsService with alerts computed signal

---

## Tasks

### TASK-3.1: Import AlertsService into HomeComponent

**File**: `src/app/home/home.ts`

**Modification 1 - Add Import Statement**:
At the top of the file (around line 46-57 where other imports are), add:

```typescript
import { AlertsService } from '../services/alerts.service';
```

**Modification 2 - Update DailyAlert Import**:
Change the import from home.data.ts (around line 47-54):

```typescript
// Change from:
import {
  DAILY_ALERTS,
  HOME_PATIENTS,
  LAB_TESTS,
  DailyAlert,
  HomePatient,
  LabTest,
} from '../data/home.data';

// Change to:
import {
  DAILY_ALERTS,
  HOME_PATIENTS,
  LAB_TESTS,
  DailyAlert,
  DailyAlertWithState,
  CaseState,
  HomePatient,
  LabTest,
} from '../data/home.data';
```

**Modification 3 - Inject Service**:
Add after line 288 (after `private appointmentsService = inject(AppointmentsService);`):

```typescript
private alertsService = inject(AlertsService);
```

**Modification 4 - Update dailyAlerts Property Type and Initialization**:
Change line 190:

```typescript
// Change from:
public dailyAlerts: DailyAlert[] = [...DAILY_ALERTS];

// Change to:
public dailyAlerts: DailyAlertWithState[] = [];
```

**Modification 5 - Initialize from Service in ngOnInit**:
Add to ngOnInit (around line 304, after `this.nextPatient = PATIENTS_DATA.find...`):

```typescript
// Initialize alerts from service
this.dailyAlerts = this.alertsService.alerts();
```

**Modification 6 - Update selectedAlert Type**:
Change line 192:

```typescript
// Change from:
public selectedAlert: DailyAlert | null = null;

// Change to:
public selectedAlert: DailyAlertWithState | null = null;
```

---

### TASK-3.2: Add getCaseStateColor Method to HomeComponent

**File**: `src/app/home/home.ts`

**Location**: Add after `getAppointmentStatusColor` method (around line 113)

**Code to Add**:

```typescript
public getCaseStateColor(state: CaseState): ChipThemeColor {
  const colorMap: Record<CaseState, ChipThemeColor> = {
    'Open': 'info',
    'In Progress': 'warning',
    'Resolved': 'success',
  };
  return colorMap[state] ?? 'base';
}
```

---

### TASK-3.3: Add Case State Chip to Alert Item Template

**File**: `src/app/home/home.html`

**Location**: Inside the alert-item div, after the alert-title span (around line 237-238)

**Current Code** (lines 235-246):

```html
<div>
  <div class="alert-content">
    <span class="alert-title">{{ alert.title }}</span>
    <div class="alert-bottom">
      <span class="alert-time">{{ alert.time }}</span>
      <span class="alert-link">
        <span class="link-text">View</span>
        <kendo-svgicon [icon]="chevronRightIcon"></kendo-svgicon>
      </span>
    </div>
  </div>
</div>
```

**Modified Code**:

```html
<div>
  <div class="alert-content">
    <div class="alert-title-row">
      <span class="alert-title">{{ alert.title }}</span>
      <kendo-chip
        class="case-state-chip"
        [label]="alert.caseState"
        [themeColor]="getCaseStateColor(alert.caseState)"
        [removable]="false"
        size="small"
        rounded="full"
      ></kendo-chip>
    </div>
    <div class="alert-bottom">
      <span class="alert-time">{{ alert.time }}</span>
      <span class="alert-link">
        <span class="link-text">View</span>
        <kendo-svgicon [icon]="chevronRightIcon"></kendo-svgicon>
      </span>
    </div>
  </div>
</div>
```

**Changes**:

1. Wrap alert-title and chip in new `alert-title-row` div
2. Add kendo-chip component with case state binding

---

### TASK-3.4: Add Case State Chip Styles to home.css

**File**: `src/app/home/home.css`

**Location**: Add after `.alert-title` styles (around line 421)

**Code to Add**:

```css
/* Case State Chip Styles */
.alert-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.case-state-chip {
  flex-shrink: 0;
}

.case-state-chip.k-chip {
  height: 24px;
  font-size: 12px;
}
```

---

## Phase Completion Criteria

| Criterion                                | Verification Method                                 |
| ---------------------------------------- | --------------------------------------------------- |
| AlertsService imported                   | No import errors                                    |
| Alerts initialized from service          | Console log in ngOnInit shows alerts with caseState |
| getCaseStateColor returns correct colors | Visual inspection of chips                          |
| Chip displays on each alert              | UI shows chip next to each alert title              |
| Chip colors are correct                  | Open=blue, In Progress=amber, Resolved=green        |
| Layout is not broken                     | Alert items display correctly without overflow      |
| Application builds                       | `npm run build` succeeds                            |

---

## Visual Verification

After implementation, each alert item should appear as:

```
┌──────────────────────────────────────────────────────────────┐
│  CRP elevated - Sophia Martinez              [Open]          │
│  Now                                                  View > │
└──────────────────────────────────────────────────────────────┘
```

Where `[Open]` is a blue Kendo chip.

---

## Acceptance Criteria Addressed

| AC ID    | Description                                      | Status      |
| -------- | ------------------------------------------------ | ----------- |
| AC-001-1 | Case state visible in UI                         | ✓ Addressed |
| AC-001-2 | Open state visually distinguished (blue)         | ✓ Addressed |
| AC-001-3 | In Progress state visually distinguished (amber) | ✓ Addressed |
| AC-001-4 | Resolved state visually distinguished (green)    | ✓ Addressed |

---

## Rollback Procedure

If issues arise:

1. Revert home.html template changes
2. Revert home.ts changes (imports, service injection, type changes)
3. Revert home.css additions
4. dailyAlerts can be reverted to spread from DAILY_ALERTS directly
