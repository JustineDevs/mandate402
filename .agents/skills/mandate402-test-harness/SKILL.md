---
name: mandate402-test-harness
description: Load when choosing, adding, fixing, or reporting Mandate402 verification across Vitest, route tests, store tests, Foundry, Go tests, smoke checks, typecheck, lint, or build.
---

# Mandate402 Test Harness

## Read First

- `package.json`
- `vitest.config.ts`
- `.github/workflows/ci.yml`
- `references/test-harness-matrix.md`
- `TESTS.md`

## Procedure

### 1. Plan

- map the changed files to the smallest meaningful verification set
- identify whether app, contracts, Go, smoke, or repo-safety checks are affected
- state any verification that is intentionally skipped and why

### 2. Validate

- include negative tests for security, config, validation, and state-machine changes
- include worker/reconciliation tests when queue behavior changes
- include Foundry tests when Solidity or deployment assumptions change

### 3. Execute

Run focused tests first, then broaden to type/lint/build when shared contracts changed.

### 4. Report

Final reports must name exact commands run and any known gaps.

## Gotchas

- do not claim build safety from typecheck alone
- do not skip Go tests when `main.go` changes
- do not skip Foundry tests when contracts, ABI expectations, or deploy scripts change
