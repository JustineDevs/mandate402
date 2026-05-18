# Mandatory PR Policy

This document defines the required PR rules for Mandate402.

## Every PR Must Include

- linked issue
- owner lane
- reviewer context
- AI usage note if AI assisted the change
- verification evidence
- release impact note when relevant

## Example Good PR

- one issue
- one lane owner
- one coherent scope
- screenshots if UI changed
- verification commands listed
- release impact clearly stated

## Example Bad PR

- mixed unrelated changes
- no linked issue
- no lane ownership
- no verification evidence
- “misc fixes” style summary

## Every PR Must Satisfy

- one coherent scope
- no unrelated work bundled in
- lane ownership respected
- no silent cross-lane edits
- no direct `main` merge

## Required Reviews

### Always

- at least one review
- Justine final integration/release review on protected or high-risk lanes

### High-risk changes

Justine review is mandatory for:

- auth
- infra
- contracts
- release workflows
- treasury semantics

## Required Checks

PRs must not merge until all required workflows are green.

Minimum expected checks:

- `CI / app`
- `CI / contracts`
- `CI / go`
- `API Smoke / smoke`

Plus repo-level quality gates when relevant:

- repo safety
- release readiness

## Merge Method

Squash merge is the default and required method unless Justine explicitly approves a documented exception.
