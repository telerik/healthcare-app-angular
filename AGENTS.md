# Healthcare App — Agent Instructions

## Project Overview

This is an Angular 21 healthcare application using **Kendo UI for Angular** components with the **Meridian theme**. The app includes patient management, scheduling, analytics, and home dashboard views.

**Key technologies:**
- Angular 21 (standalone components)
- Kendo UI for Angular v24 (`@progress/kendo-*`)
- Kendo Meridian theme (`@progress/kendo-theme-meridian`)
- TypeScript ~5.9
- Vitest for unit testing

---

## MANDATORY: Kendo Angular Component Skill

> **This rule is non-negotiable. No exceptions.**

Before using, configuring, or modifying **any** Kendo UI for Angular component, you **MUST** load and consult the `kendo-angular-component` skill. This applies to every component in the `@progress/kendo-angular-*` package family, including but not limited to:

- Grid, TreeList, ListView
- Chart, Sparkline, StockChart
- Scheduler
- DatePicker, DateTimePicker, DateRangePicker, TimePicker
- DropDownList, ComboBox, MultiSelect, AutoComplete, MultiColumnComboBox, DropDownTree
- Dialog, Window
- Button, ToolBar, Menu, Navigation
- Editor, Upload
- Form inputs (TextBox, NumericTextBox, MaskedTextBox, Slider, Switch, etc.)
- Gauges, Indicators, ProgressBar
- TreeView, PanelBar, TabStrip, Splitter, Card, GridLayout, StackLayout
- Tooltip, Popup, Notification
- AI/Conversational UI components

**How to load the skill:**

Read the skill file at `.github/skills/kendo-angular-component/SKILL.md` and follow all instructions within it, including calling `kendo_component_assistant` via MCP before writing component code.

**Why this is required:**

The skill provides accurate, version-specific API reference, identifies directive restrictions, enforces correct binding patterns (e.g. `kendoGridBinding`, `textField`/`valueField` rules), and prevents common anti-patterns (e.g. getter anti-pattern in Charts). Skipping this step will produce incorrect, outdated, or broken component code.

---

## MANDATORY: Kendo Angular UI Generator Skill

> **This rule is non-negotiable. No exceptions.**

Before planning or implementing **any** complex UI/UX improvement, new page, dashboard, multi-component layout, or style-related change, you **MUST** load and consult the `kendo-angular-ui-generator` skill.

**Triggers that require this skill — load it before any planning or implementation when the request involves:**

- Building or redesigning a full page, view, or dashboard
- Adding or refactoring multiple Kendo components together in a layout
- Applying visual polish, spacing, or responsive layout changes
- Theming, color, or CSS variable customization
- Icon selection for UI elements
- Accessibility improvements to existing UI
- Any request described as "improve the UI", "redesign", "make it look better", "update the layout", "style changes", or similar

**How to load the skill:**

Read the skill file at `.github/skills/kendo-angular-ui-generator/SKILL.md` and follow the full orchestration workflow it defines before writing any code or forming an implementation plan.

**Why this is required:**

The UI generator skill orchestrates the correct sequence of sub-skills (layout utilities, component API, theming, icons, accessibility) and enforces Kendo Design System conventions. Starting planning or implementation without it leads to layout anti-patterns, missed utility classes, incorrect component composition, and avoidable rework.

---

## Project Structure

```
src/
  app/
    analytics/        # Analytics dashboard view
    data/             # Static data files (patients, appointments, schedule, home, analytics)
    home/             # Home dashboard view
    patients/         # Patient list + patient-profile detail view
    pipes/            # Custom pipes (markdown)
    schedule/         # Schedule/calendar view
    services/         # Angular services (appointments, patients, page-header)
    app.config.ts     # App configuration (providers, routes)
    app.routes.ts     # Top-level route definitions
    app.ts            # Root component
public/
  assets/
    profiles/         # Patient profile images (men/, women/)
```

---

## Coding Conventions

- **Standalone components only** — do not use `NgModule`
- **Import Kendo modules directly** in the component's `imports` array
- **No getters for chart series/data** — always use plain properties or arrays to avoid the getter anti-pattern
- **TypeScript strict mode** — no implicit `any`
- **Styles** — use component-scoped CSS files (`.css`); global styles in `src/styles.css`
- **Theme** — Meridian theme is loaded globally via `angular.json`; do not import it in components
- **Testing** — unit tests use Vitest; test files are co-located as `*.spec.ts`

---

## Available Skills

Consult the appropriate skill before performing these tasks:

| Task | Skill file |
|---|---|
| Use or configure any Kendo component | `.github/skills/kendo-angular-component/SKILL.md` (**mandatory**) |
| Complex UI/UX improvements, new pages, layouts, styling | `.github/skills/kendo-angular-ui-generator/SKILL.md` (**mandatory**) |
| Customize theme / CSS variables | `.github/skills/kendo-angular-style/SKILL.md` |
| Build layouts with Kendo CSS utilities | `.github/skills/kendo-angular-layout/SKILL.md` |
| Find an icon | `.github/skills/kendo-angular-icon/SKILL.md` |
| Accessibility / WCAG compliance | `.github/skills/kendo-angular-accessibility/SKILL.md` |
| Add Kendo to a new project | `.github/skills/kendo-angular-getting-started/SKILL.md` |
| Licensing issues / watermark errors | `.github/skills/kendo-angular-product-licensing/SKILL.md` |

---

## Development Commands

```bash
npm start          # Serve the app (ng serve)
npm run build      # Production build
npm test           # Run unit tests (Vitest, no watch)
npm run lint       # TypeScript type check (tsc --noEmit)
```
