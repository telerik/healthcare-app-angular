# Phase 1: Data Model & Types

## Objective

Define the case state type system and extend existing interfaces to support workflow tracking.

---

## Dependencies

- None (foundational phase)

---

## Tasks

### TASK-1.1: Add CaseState Type Definition

**File**: `src/app/data/home.data.ts`

**Location**: Add after line 13 (after DailyAlert interface closing brace)

**Code to Add**:

```typescript
export type CaseState = 'Open' | 'In Progress' | 'Resolved';
```

**Verification**:

- TypeScript compilation succeeds
- Type is exported and accessible from other files

---

### TASK-1.2: Add DailyAlertWithState Interface

**File**: `src/app/data/home.data.ts`

**Location**: Add immediately after the CaseState type definition

**Code to Add**:

```typescript
export interface DailyAlertWithState extends DailyAlert {
  caseState: CaseState;
}
```

**Verification**:

- Interface extends DailyAlert correctly
- TypeScript compilation succeeds

---

### TASK-1.3: Add caseState to DAILY_ALERTS Data

**File**: `src/app/data/home.data.ts`

**Location**: Modify the `DAILY_ALERTS` constant declaration (line 27)

**Change Type Declaration**:

```typescript
// Change from:
export const DAILY_ALERTS: DailyAlert[] = [

// Change to:
export const DAILY_ALERTS: DailyAlertWithState[] = [
```

**Add Property to Each Alert Object**:
Add `caseState: 'Open'` property to each of the 8 alert objects in the array.

**Example for first alert (lines 28-46)**:

```typescript
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
  caseState: 'Open',  // ADD THIS LINE
  details:
    'C-reactive protein (CRP) levels are significantly elevated...',
  recommendations: [
    'Order additional inflammatory markers panel',
    ...
  ],
},
```

**Complete List of Modifications**:
| Alert ID | Line Range (approx) | Add After Line |
|----------|---------------------|----------------|
| 1 | 28-46 | After `priority: 'High',` |
| 2 | 47-66 | After `priority: 'High',` |
| 3 | 67-86 | After `priority: 'Medium',` |
| 4 | 87-106 | After `priority: 'Medium',` |
| 5 | 107-125 | After `priority: 'High',` |
| 6 | 126-144 | After `priority: 'High',` |
| 7 | 145-165 | After `priority: 'High',` |
| 8 | 166-183 | After `priority: 'Medium',` |

**Verification**:

- All 8 alerts have `caseState: 'Open'` property
- TypeScript compilation succeeds
- No runtime errors when loading home page

---

## Phase Completion Criteria

| Criterion                    | Verification Method                     |
| ---------------------------- | --------------------------------------- |
| CaseState type exported      | Import in test file compiles            |
| DailyAlertWithState exported | Import in test file compiles            |
| All alerts have caseState    | Console log DAILY_ALERTS shows property |
| Application builds           | `npm run build` succeeds                |
| Application runs             | Home page loads without errors          |

---

## Rollback Procedure

If issues arise:

1. Revert changes to `src/app/data/home.data.ts`
2. Remove CaseState type and DailyAlertWithState interface
3. Change DAILY_ALERTS back to `DailyAlert[]`
4. Remove `caseState` properties from alert objects
