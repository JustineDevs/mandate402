---
name: mandate402-accessibility-audit
description: Load when reviewing or changing Mandate402 accessibility, keyboard flow, focus states, modals, tables, status semantics, color contrast, aria labels, or destructive UI flows.
---

# Mandate402 Accessibility Audit

## Read First

- `docs/adr/ADR-0002-sherwin-ui-wireframe-task.md`
- `src/components/`
- `references/accessibility-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify interactive controls, status messages, and structured data affected
- list keyboard order and focus-return expectations
- identify whether color is being used as the only status signal

### 2. Validate

- buttons have accessible names
- modals trap focus and return focus
- tables expose useful headers or transform accessibly on mobile
- destructive actions require confirmation

### 3. Execute

Fix semantics before visual tweaks. Keep labels concise and operator-facing.

### 4. Verify

Keyboard through the changed flow and run focused lint/type checks.

## Gotchas

- do not use icon-only controls without accessible labels
- do not rely on color alone for blocked/unknown/degraded states
- do not let popovers contain essential actions that keyboard users cannot reach
