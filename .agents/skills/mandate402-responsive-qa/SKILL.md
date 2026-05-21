---
name: mandate402-responsive-qa
description: Load when checking or changing Mandate402 responsive layouts, mobile behavior, desktop density, landing split layout, modals, tables, drawers, or visual QA.
---

# Mandate402 Responsive QA

## Read First

- `docs/adr/ADR-0002-sherwin-ui-wireframe-task.md`
- `.agents/skills/mandate402-frontend/references/surfaces-and-states.md`
- `references/responsive-qa-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify viewports affected by the change
- list fixed-format UI elements that need stable dimensions
- identify tables, modals, drawers, and action bars that need mobile behavior

### 2. Validate

- no text overlap or clipped action labels
- tables transform or scroll intentionally
- destructive actions stay reachable and distinguishable
- landing split obeys Sherwin's current brief

### 3. Execute

Adjust layout using existing CSS/components first. Keep page sections unframed unless repeated item cards are needed.

### 4. Verify

Check at least mobile, tablet, and desktop widths for visual changes.

## Gotchas

- do not solve mobile by hiding trust-critical status
- do not make hero-scale text inside compact panels
- do not introduce decorative layout patterns that reduce operator scanability
