# Phase 5: UI - Filtering

## Objective

Enable clinical staff to filter the Daily Alerts list by case state, allowing focus on specific workflow states.

---

## Dependencies

- **Phase 3**: Case state displayed on alerts
- **Phase 4**: State changes working (for meaningful filter results)

---

## Tasks

### TASK-5.1: Add Filter State Property to HomeComponent

**File**: `src/app/home/home.ts`

**Location**: Add after the `dailyAlerts` property (around line 191)

**Code to Add**:

```typescript
public alertFilter: CaseState | 'All' = 'All';
```

---

### TASK-5.2: Add Filter Button Group Template to home.html

**File**: `src/app/home/home.html`

**Location**: Inside the Next Patient section, between the "Daily Alerts" subtitle and the alerts list (around line 222-224)

**Current Code** (lines 221-225):

```html
<!-- Daily Alerts Header -->
<h3 class="section-subtitle">Daily Alerts</h3>

<!-- Daily Alerts List -->
<div class="daily-alerts"></div>
```

**Modified Code**:

```html
<!-- Daily Alerts Header -->
<div class="daily-alerts-header">
  <h3 class="section-subtitle">Daily Alerts</h3>
  <kendo-buttongroup selection="single" class="alert-filter-group">
    <button
      kendoButton
      [toggleable]="true"
      [selected]="alertFilter === 'All'"
      (selectedChange)="onFilterChange('All', $event)"
      size="small"
    >
      All
    </button>
    <button
      kendoButton
      [toggleable]="true"
      [selected]="alertFilter === 'Open'"
      (selectedChange)="onFilterChange('Open', $event)"
      size="small"
    >
      Open
    </button>
    <button
      kendoButton
      [toggleable]="true"
      [selected]="alertFilter === 'In Progress'"
      (selectedChange)="onFilterChange('In Progress', $event)"
      size="small"
    >
      In Progress
    </button>
    <button
      kendoButton
      [toggleable]="true"
      [selected]="alertFilter === 'Resolved'"
      (selectedChange)="onFilterChange('Resolved', $event)"
      size="small"
    >
      Resolved
    </button>
  </kendo-buttongroup>
</div>

<!-- Daily Alerts List -->
<div class="daily-alerts"></div>
```

**Update Alert Loop** (around line 226):

```html
<!-- Change from: -->
@for (alert of dailyAlerts; track alert.id) {

<!-- Change to: -->
@for (alert of filteredAlerts; track alert.id) {
```

---

### TASK-5.3: Implement Filter Change Handler and Computed Property

**File**: `src/app/home/home.ts`

**Modification 1 - Add Filtered Alerts Getter**:
Add after the `alertFilter` property:

```typescript
public get filteredAlerts(): DailyAlertWithState[] {
  if (this.alertFilter === 'All') {
    return this.dailyAlerts;
  }
  return this.dailyAlerts.filter((alert) => alert.caseState === this.alertFilter);
}
```

**Modification 2 - Add Filter Change Handler**:
Add after `changeCaseState` method (or after acknowledgeAlert):

```typescript
public onFilterChange(filter: CaseState | 'All', selected: boolean): void {
  if (selected) {
    this.alertFilter = filter;
  }
}
```

---

### TASK-5.4: Add Filter Button Group Styles

**File**: `src/app/home/home.css`

**Location**: Add after the case state controls styles

**Code to Add**:

```css
/* Daily Alerts Filter */
.daily-alerts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px;
  gap: 12px;
  flex-wrap: wrap;
}

.daily-alerts-header .section-subtitle {
  padding: 0;
  margin: 0;
}

.alert-filter-group {
  flex-shrink: 0;
}

.alert-filter-group .k-button {
  font-size: 12px;
  padding: 4px 12px;
}

/* Empty state when no alerts match filter */
.daily-alerts-empty {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}
```

**Update existing .section-subtitle rule** (around line 191-195):
The subtitle in next-patient-section needs adjustment since we're moving it to a flex container.

```css
/* Change from: */
.next-patient-section .section-subtitle {
  padding: 20px 20px 10px;
  font-size: 24px;
  margin: 0;
}

/* Change to: */
.next-patient-section .section-subtitle {
  font-size: 24px;
  margin: 0;
}

.next-patient-section > .k-card-body > .section-subtitle {
  padding: 20px 20px 10px;
}
```

---

### TASK-5.5: Add Empty State for No Matching Alerts (Optional Enhancement)

**File**: `src/app/home/home.html`

**Location**: After the @for loop, add an empty state message

**Code to Add** (after the `@for` block closing brace):

```html
@if (filteredAlerts.length === 0) {
<div class="daily-alerts-empty">
  No {{ alertFilter === 'All' ? '' : alertFilter }} alerts to display
</div>
}
```

---

## Phase Completion Criteria

| Criterion                   | Verification Method                             |
| --------------------------- | ----------------------------------------------- |
| Filter buttons render       | See 4-button group above alert list             |
| "All" selected by default   | "All" button appears selected on load           |
| Filter by Open works        | Click Open, only Open alerts shown              |
| Filter by In Progress works | Click In Progress, only matching alerts shown   |
| Filter by Resolved works    | Click Resolved, only matching alerts shown      |
| All shows everything        | Click All, all alerts shown regardless of state |
| Empty state displays        | Filter to state with no alerts, see message     |
| Application builds          | `npm run build` succeeds                        |

---

## Manual Test Scenarios

### Scenario 1: Filter to Open

1. Load home page (should have alerts in Open state by default)
2. Click "Open" filter button
3. **Expected**: Only alerts with "Open" state visible

### Scenario 2: Filter to In Progress

1. First change some alerts to "In Progress" state
2. Click "In Progress" filter button
3. **Expected**: Only "In Progress" alerts visible

### Scenario 3: Filter to Resolved

1. First mark some alerts as "Resolved"
2. Click "Resolved" filter button
3. **Expected**: Only "Resolved" alerts visible

### Scenario 4: Clear Filter

1. With filter applied (e.g., "Open")
2. Click "All" filter button
3. **Expected**: All alerts visible again with their states shown

### Scenario 5: Empty Filter Result

1. Ensure no alerts are in "Resolved" state
2. Click "Resolved" filter button
3. **Expected**: Empty state message appears

### Scenario 6: State Change Updates Filtered List

1. Filter to "Open"
2. Open an alert, change to "In Progress"
3. **Expected**: Alert disappears from filtered list (now In Progress)

---

## Acceptance Criteria Addressed

| AC ID    | Description                    | Status      |
| -------- | ------------------------------ | ----------- |
| AC-004-1 | Filter by Open works           | ✓ Addressed |
| AC-004-2 | Filter by In Progress works    | ✓ Addressed |
| AC-004-3 | Filter by Resolved works       | ✓ Addressed |
| AC-004-4 | No filter shows all with state | ✓ Addressed |

---

## Rollback Procedure

If issues arise:

1. Remove daily-alerts-header div and filter button group from home.html
2. Revert @for loop to use `dailyAlerts` instead of `filteredAlerts`
3. Remove `alertFilter` property and related methods from home.ts
4. Remove filter styles from home.css
5. Restore original `.section-subtitle` CSS rule
