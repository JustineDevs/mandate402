---
name: mandate402-release-ci-safety
description: Load when changing Mandate402 GitHub Actions, semantic-release, changesets, repo safety checks, branch protection, smoke tests, release notes, or public-remote safety.
---

# Mandate402 Release CI Safety

## Read First

- `.github/workflows/`
- `scripts/check-repo-safety.mjs`
- `scripts/check-release-readiness.mjs`
- `docs/RELEASE-POLICY.md`
- `references/release-ci-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify affected workflow, release gate, or repo-safety rule
- list required secrets, permissions, branch triggers, and artifacts
- decide whether this affects PR checks, main-only release, or smoke automation

### 2. Validate

- least-privilege workflow permissions
- no direct release from feature branches
- public-remote safety checks still cover secrets and artifacts
- smoke envs reflect real runtime contracts

### 3. Execute

Keep CI changes narrow and update docs/check scripts when the release contract changes.

### 4. Verify

Run repo-safety and release-readiness checks when scripts or release workflows change.

## Gotchas

- do not add workflows that bypass required checks
- do not commit generated contract artifacts
- do not weaken smoke tests to make CI green
