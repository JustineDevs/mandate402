# Mandate402 Agile Flow

This document defines the **practical idea-to-issue-to-PR flow** for Mandate402.

It is specific to:

- issue-first work
- lane ownership
- AI-augmented execution
- `main`-only release authority

## Flow Overview

`Idea -> Clarify -> PRD or Issue -> Lane Assignment -> Ready -> Branch -> Implement -> PR -> Review -> Merge -> Release`

## Stage 1: Idea

An idea starts as:

- feature
- bug
- docs/process gap
- infra/release problem

It is not work yet.

## Stage 2: Clarify

Before implementation, decide:

- is this small enough for one issue?
- or does it need a PRD?

Use a PRD when:

- multiple lanes are involved
- architecture changes
- release behavior changes
- the change is ambiguous or broad

Use a direct issue when:

- one lane owns it
- scope is narrow
- acceptance criteria are obvious

## Stage 3: Lane Assignment

Every work item must have:

- one primary owner
- one lane
- one reviewer path

Examples:

- `lane:frontend-transactional` -> Edward
- `lane:frontend-observability` -> John
- `lane:design` -> Sherwin
- `lane:backend` / `lane:web3` / `lane:ops` -> Justine-led review path

## Stage 4: Ready State

Before branch creation, the issue must be:

- labeled
- assigned
- accepted into sprint if relevant
- explicitly in scope
- explicitly out of scope

If not, it stays:

- `state:needs-design`
- `state:needs-architecture`
- or `state:blocked`

## Stage 5: Branch

Create one ownership branch per issue.

Examples:

- `feat/123-mandate-auth`
- `ui/218-john-audit-dashboard`
- `ui/219-edward-mandate-flow`
- `docs/302-oss-onboarding`

## Stage 6: Implementation

Rules:

- stay inside the issue scope
- stay inside the lane
- escalate if overlap appears
- sync from `main` before review

## Stage 7: PR

Every meaningful change must land through PR.

PR must include:

- linked issue
- lane owner
- AI usage note if relevant
- verification evidence
- release impact if relevant

## Stage 8: Review

Review requirements:

- human review required
- Justine final review on protected/high-risk work
- Sherwin review for visual changes where relevant

## Stage 9: Merge

Merge only when:

- required checks are green
- scope is still clean
- no unresolved review thread remains
- branch is current enough with `main`

## Stage 10: Release

Release authority is:

- `main` only

No feature branch releases.
No direct merge-to-release shortcut.

## Backlog State Model

Recommended states:

- `state:needs-architecture`
- `state:needs-design`
- `state:ready`
- `state:blocked`
- `state:in-review`
- `done`

## Agile Rule

Mandate402 uses Agile to control flow and reduce rework, not to justify vague execution.
