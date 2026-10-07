# Tasks — Issue #79: Improve page background contrast against white content surfaces

> **Note:** No plan artifacts (`README.md`, `research.md`, `phase_*.md`) were found in
> `.forge/work/job_79/code/` at the start of this run. Per the fallback instructions,
> requirements were derived directly from GitHub Issue #79 and implemented without a
> formal plan.

## Requirements (from Issue #79)

- [x] White cards, the app bar, and other white surfaces are clearly distinguishable
      from the page background across all main routes.
- [x] Text and essential UI component boundaries meet WCAG 2.2 AA contrast
      requirements.
- [x] The background remains visually consistent between the page body and sticky
      header.
- [x] The updated treatment works at desktop and mobile viewport sizes.
- [x] Both normal and opacity display modes remain readable.

## Implementation

- [x] `src/styles.css` — replaced the `body` background image (pastel
      `assets/bg.svg`, ~1.1:1 contrast vs. white) with a solid, WCAG-compliant
      `--app-page-background: #868fb9` custom property (a muted blue-violet that
      matches the existing brand accent hue, e.g. the `#5b5fc7` notification dot).
      - Contrast vs. `#ffffff` surfaces: **3.16:1** (passes WCAG 1.4.11 non-text
        contrast, ≥ 3:1).
      - Contrast for the dark `#232a36` page title/subtitle text rendered directly
        on it: **4.56:1** (passes WCAG 2.2 AA normal-text contrast, ≥ 4.5:1).
- [x] `src/app/app.css` — `.sticky-header-wrapper` now uses the same
      `var(--app-page-background)` solid color (previously `#fafafa` fallback +
      the same pastel `bg.svg`), keeping the body and sticky header visually
      consistent while scrolling.
- [x] `src/assets/bg.svg` — removed; no longer referenced anywhere in the codebase
      after the above changes (confirmed via repo-wide search).

## Validation

- [x] `npm run build` — production build succeeds.
- [x] `npm test` — full Vitest suite passes (5 files / 15 tests).
- [x] Manual visual verification via Playwright (`playwright-cli`) against a local
      `ng serve` instance:
      - Desktop (1440×900): clear separation between cards/app bar and background.
      - Mobile (390×844): clear separation maintained.
      - "Toggle contrast" (opacity display mode): translucent cards remain
        distinguishable from the new background.
  - Screenshots saved to `.forge/work/job_79/visual-evidence/`:
    `after.png`, `after-mobile.png`, `after-opacity-mode.png` (compare against the
    pre-existing `before.png` baseline).

## Status: Complete

All requirements implemented and verified. No further phases/tasks remain for this
issue.
