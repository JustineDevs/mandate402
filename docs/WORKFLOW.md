# Mandatory Workflow

This document defines the required execution flow for all meaningful work in Mandate402. It is not optional guidance.

## Core Rule

Every material change must move through this sequence:

`Issue -> Scope -> Design or Technical Clarification -> Branch -> Implementation -> PR -> Review -> CI -> Merge`

No meaningful work should skip the issue or PR stage.

## Mandatory Flow

1. Justine or the lane owner creates or approves the GitHub issue.
2. The issue must define:
   - problem
   - goal
   - owner
   - lane
   - acceptance criteria
   - out of scope
3. If UI is involved, Sherwin must provide the design handoff before frontend implementation starts.
4. The implementer creates a branch tied to the issue.
5. AI tools work only within the issue scope and lane scope.
6. The human owner reviews AI output before commit or PR.
7. A PR must be opened before merge.
8. Justine performs final integration/release review.
9. Required checks must pass before merge.

## Non-Negotiable Rules

- No direct work on `main`.
- No meaningful implementation without an issue.
- No PR without a linked issue.
- No frontend implementation without Sherwin handoff when visual changes are involved.
- No AI-generated infra, auth, contract, or release change merges without human review.
- No merge while CI is failing.

## Frontend Rule

The frontend is split into two lanes:

- Edward: transactional UI
- John: observability and presentation UI

They must not silently co-own the same screen by default.

## Release Rule

The merge/release decision belongs to Justine after:

- code review
- lane review where relevant
- CI success
- repo safety success
- release-readiness success
