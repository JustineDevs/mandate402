# Mandatory Workflow

This document defines the required execution flow for all meaningful work in Mandate402. It is not optional guidance.

## Core Rule

Every material change must move through this sequence:

`Issue -> Scope -> Design or Technical Clarification -> Branch from development -> PR to development -> Review -> CI -> Merge -> Promotion PR to main`

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

## Contributor Startup Sequence

Every contributor should start with:

1. sync latest `development`
2. read [AGENTS.md](../AGENTS.md)
3. read [WORKFLOW.md](./WORKFLOW.md), [BRANCHING.md](./BRANCHING.md), and [LANES.md](./LANES.md)
4. open the linked issue
5. confirm lane ownership and out-of-scope
6. create a branch from `development` for the issue

## Example Issues

### Good feature issue

- one problem
- one owner
- one lane
- clear acceptance criteria
- explicit out-of-scope

### Bad issue

- mixes frontend, infra, auth, and docs in one scope
- no owner
- no lane
- no acceptance criteria

## Mandatory Sync Rule

Every implementer must sync from the latest `development` before meaningful work continues.

Required sync moments:

1. before starting work for the day
2. before opening a PR
3. after `development` changes in a related lane
4. after a branch sits stale during active work

Recommended stale thresholds:

- more than `4 hours` during active parallel work
- definitely stale after `1 day`

## Mandatory Sync Commands

For `main`:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
```

For `development`:

```bash
git fetch origin
git switch development
git pull --ff-only origin development
```

For an ownership branch:

```bash
git fetch origin
git switch <branch>
git rebase origin/development
```

## Sync Verification Rule

After rebasing or syncing from `development`, rerun the relevant checks before requesting review.

## Non-Negotiable Rules

- No direct work on `main`.
- No direct work on `development`.
- No meaningful implementation without an issue.
- No PR without a linked issue.
- No frontend implementation without Sherwin handoff when visual changes are involved.
- No AI-generated infra, auth, contract, or release change merges without human review.
- No merge while CI is failing.
- No merge to `development` or `main` until all required workflows are green.
- No release from any branch except `main`.
- No stale team branch should be sent for final review without syncing from latest `development`.

## Frontend Rule

The frontend is split into two lanes:

- Edward: transactional UI
- John: observability and presentation UI

They must not silently co-own the same screen by default.

## Escalation Quick Guide

Escalate to Justine if:

- auth changes
- infra changes
- contract changes
- release workflow changes
- issue scope changes
- lane overlap appears

Escalate to Sherwin if:

- design intent is unclear
- shared visual patterns are changing

Escalate across frontend lanes if:

- shared primitives change
- the same screen is touched by both frontend lanes

## Release Rule

The merge/release decision belongs to Justine after:

- code review
- lane review where relevant
- CI success
- repo safety success
- release-readiness success

Release automation, tags, and release notes belong to `main` only.

Normal promotion path:

- ownership branch -> `development`
- validated `development` -> `main`
