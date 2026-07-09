# Issue #2: Introduce Patient Case State (Open / In Progress / Resolved)

## Context and Background

The healthcare application currently tracks **patient medical status** (`Critical`, `Monitoring`, `Stable`) which reflects the patient's health condition. However, there is no mechanism to track the **workflow state of patient issues or alerts** — meaning staff cannot record whether a medical concern has been acknowledged, is being actively managed, or has been fully addressed.

### Current State Analysis

- **Patient Status**: Represents clinical condition (`Critical`, `Monitoring`, `Stable`) and is displayed in the patients grid and patient profile via color-coded chips
- **Daily Alerts**: Displayed on the home dashboard (e.g., "CRP elevated", "Blood pressure high") but lack resolution tracking
- **Lab Results**: Each result has a status (`Critical`, `Monitoring`, `Stable`) but no case state
- **Gap**: No way to differentiate between:
  - A new issue that hasn't been seen
  - An issue a clinician is actively investigating
  - An issue that has been resolved/addressed

### Business Value

This feature enables clinical staff to:

- Track progress on patient issues through their resolution lifecycle
- Prioritize unaddressed critical alerts
- Maintain audit trail of issue handling
- Improve shift handoff by clearly showing pending work
- Reduce risk of overlooked patient concerns

---

## User Stories and Acceptance Criteria

### US-001: View Case State on Patient Issues

**As a** clinical staff member  
**I want to** see the case state of each patient issue/alert  
**So that** I can quickly identify which issues need attention

**Acceptance Criteria:**

| ID       | Criterion                                                                                                            |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| AC-001-1 | Given a patient issue exists, when displayed in the UI, then the case state (Open, In Progress, Resolved) is visible |
| AC-001-2 | Given an issue with state "Open", when displayed, then it is visually distinguished (e.g., specific color/icon)      |
| AC-001-3 | Given an issue with state "In Progress", when displayed, then it is visually distinguished from Open and Resolved    |
| AC-001-4 | Given an issue with state "Resolved", when displayed, then it is visually distinguished (e.g., muted/grayed styling) |

---

### US-002: Update Case State to In Progress

**As a** clinical staff member  
**I want to** mark an issue as "In Progress"  
**So that** other staff know the issue is being actively addressed

**Acceptance Criteria:**

| ID       | Criterion                                                                                                            |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| AC-002-1 | Given an issue in "Open" state, when I take action to mark it "In Progress", then the state changes to "In Progress" |
| AC-002-2 | Given the state changes, when viewing the issue, then the visual indicator reflects "In Progress"                    |
| AC-002-3 | Given I mark an issue as "In Progress", when I navigate away and return, then the state persists                     |

---

### US-003: Mark Issue as Resolved

**As a** clinical staff member  
**I want to** mark an issue as "Resolved"  
**So that** it is clear the concern has been addressed

**Acceptance Criteria:**

| ID       | Criterion                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| AC-003-1 | Given an issue in "Open" or "In Progress" state, when I mark it as "Resolved", then the state changes to "Resolved" |
| AC-003-2 | Given a resolved issue, when displayed, then it appears with resolved styling (e.g., checkmark, muted colors)       |
| AC-003-3 | Given I mark an issue as "Resolved", when I navigate away and return, then the state persists                       |

---

### US-004: Filter/Sort Issues by Case State

**As a** clinical staff member  
**I want to** filter or sort issues by their case state  
**So that** I can focus on open or in-progress issues

**Acceptance Criteria:**

| ID       | Criterion                                                                                           |
| -------- | --------------------------------------------------------------------------------------------------- |
| AC-004-1 | Given a list of issues, when I filter by "Open", then only Open issues are displayed                |
| AC-004-2 | Given a list of issues, when I filter by "In Progress", then only In Progress issues are displayed  |
| AC-004-3 | Given a list of issues, when I filter by "Resolved", then only Resolved issues are displayed        |
| AC-004-4 | Given a list of issues, when no filter is applied, then all issues are displayed with state visible |

---

### US-005: Re-open a Resolved Issue

**As a** clinical staff member  
**I want to** re-open a resolved issue  
**So that** I can track follow-up concerns on previously resolved cases

**Acceptance Criteria:**

| ID       | Criterion                                                                             |
| -------- | ------------------------------------------------------------------------------------- |
| AC-005-1 | Given a resolved issue, when I choose to re-open it, then the state changes to "Open" |
| AC-005-2 | Given a re-opened issue, when displayed, then it appears with Open styling            |

---

## Technical Considerations

### Existing Data Structures

1. **Patient interface** (`src/app/data/patients.data.ts`):
   - Currently has `status: 'Critical' | 'Monitoring' | 'Stable'` (clinical status)
   - Case state would be a separate concern, potentially at the alert/issue level

2. **DailyAlert interface** (`src/app/data/home.data.ts`):
   - Contains: `id`, `title`, `patient`, `patientId`, `time`, `condition`, `value`, `normalRange`, `priority`, `details`, `recommendations`
   - **Does NOT** currently have a case state field

3. **LabResult interface** (`src/app/data/patients.data.ts`):
   - Contains: `testName`, `value`, `referenceRange`, `status`, `notes`
   - `status` represents clinical severity, not workflow state

### Key Integration Points

- **Home Dashboard**: Daily Alerts section displays alerts without state tracking
- **Patients Grid**: Shows patient clinical status via chips
- **Patient Profile**: Shows lab results with clinical status
- **PatientsService**: Provides patient data access

### Dependencies

- This feature should integrate with existing Kendo UI components (chips, grid, buttons)
- State persistence mechanism is required (currently data is mock/static)
- No external API dependencies (sample app uses local data)

---

## Potential Edge Cases and Risks

### Edge Cases

| Case                           | Description                                      | Consideration                                                                   |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| State conflict                 | Two users attempt to change state simultaneously | For demo app: last-write-wins acceptable. Production: optimistic locking needed |
| Orphaned states                | Patient record deleted while issue in progress   | Cascade handling or validation check                                            |
| State on lab results vs alerts | Different entity types may need state            | Define scope: alerts only, or also lab results?                                 |
| Historical state               | Viewing past patient visits                      | State applies to current session/visit only vs historical                       |
| Bulk state changes             | Resolving multiple alerts at once                | Optional enhancement for efficiency                                             |

### Risks

| Risk                           | Impact                                                                | Mitigation                                         |
| ------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------- |
| Confusion with clinical status | Users may conflate case state (workflow) with patient status (health) | Clear visual differentiation and labeling          |
| Scope creep                    | Feature may expand to full workflow system                            | Strict scope to three states only                  |
| State persistence              | Demo app lacks backend persistence                                    | Clarify expectations: session-only vs localStorage |
| UI clutter                     | Adding state indicators may crowd existing views                      | Design review for clean integration                |

---

## Non-Functional Requirements (NFR)

### NFR-001: Visual Clarity

- Case state indicators must be clearly distinguishable from clinical status indicators
- Color/icon choices should follow accessibility guidelines (WCAG 2.1 AA)

### NFR-002: Responsiveness

- State changes should reflect in UI within 100ms (local data scenario)
- State indicators must be visible on mobile viewport (existing responsive design)

### NFR-003: State Consistency

- State should persist within the session (minimum requirement)
- Consider localStorage for demo persistence across page refreshes

### NFR-004: Intuitive Interaction

- State change action should require no more than 2 clicks
- State change affordance should be discoverable without documentation

### NFR-005: Minimal Visual Footprint

- State indicator should not significantly increase row height in grids/lists
- Preserve existing card/grid layout aesthetics

---

## Scope Clarification

### In Scope

- Case state (`Open`, `In Progress`, `Resolved`) for Daily Alerts on the home dashboard
- Visual state indicator (chip, icon, or badge)
- Ability to change state via UI action
- Filter/sort by state in alert list

### Out of Scope (Future Consideration)

- Case state on lab results (separate evaluation needed)
- Audit trail / state change history
- User assignment to cases
- Notification on state changes
- Backend/API persistence (demo app limitation)

---

## Definition of Done

- [ ] Case state field added to relevant data model(s)
- [ ] Visual state indicator implemented and visible in UI
- [ ] User can change state from Open → In Progress → Resolved
- [ ] User can re-open a Resolved issue
- [ ] State persists within session (page navigation)
- [ ] Filter/sort by state functional
- [ ] Existing tests pass (if applicable)
- [ ] Visual design consistent with existing application style
