---
name: mandate402-frontend-testing
description: Load when adding or changing Mandate402 frontend tests, UI regression checks, React state assertions, form flows, route-driven UI behavior, or frontend verification strategy.
---

# Mandate402 Frontend Testing

## Read First

- `src/components/`
- `src/app/`
- `vitest.config.ts`
- `references/frontend-testing-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify the UI surface and the state transitions users rely on
- decide whether coverage belongs in component, route, or module tests
- list loading, empty, unauthorized, blocked, unknown, and degraded states

### 2. Validate

- tests assert user-visible truth, not implementation trivia
- destructive flows require explicit confirmation coverage
- worker queued state is distinguishable from final payment state

### 3. Execute

Prefer focused tests around behavior and state rendering. Do not add a test framework dependency without explicit scope.

### 4. Verify

Run focused Vitest checks plus type/lint for touched frontend files.

## Gotchas

- do not fake backend truth in frontend tests
- do not snapshot giant markup as the main assertion
- do not leave `execution_unknown` hidden behind generic loading copy
