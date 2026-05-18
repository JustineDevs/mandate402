# Mandatory Branching Strategy

This document defines the required Git branching model for Mandate402.

## Branch Model

- `main` is the only protected integration branch.
- All work must happen on short-lived feature/fix/docs/chore branches.
- Do not commit directly to `main`.

## Branch Naming

Use issue-linked names:

- `feat/<issue>-<slug>`
- `fix/<issue>-<slug>`
- `docs/<issue>-<slug>`
- `chore/<issue>-<slug>`
- `ui/<issue>-<slug>`

Examples:

- `feat/123-mandate-auth`
- `ui/218-john-audit-dashboard`
- `ui/219-edward-mandate-flow`

## Worktree Rule

Use one worktree per active branch when parallel work is happening.

Mandatory rule:

- one issue = one branch
- one branch = one worktree
- do not stack unrelated work inside one branch

## Mandatory Sync Strategy

Do not rely on blind `git pull` on feature branches.

Required strategy:

- use `git pull --ff-only origin main` on `main`
- use `git fetch origin` + `git rebase origin/main` on ownership branches

Avoid by default:

```bash
git pull
```

because it may create implicit merge commits depending on local config.

## Branch Freshness Rule

- A PR branch must be reasonably fresh against `main` before final review.
- If `main` changed in a shared or related surface, the branch owner must sync before continuing implementation.
- Branches behind `main` should be rebased before merge unless Justine explicitly approves review on a stale branch.

## Merge Rule

- No direct pushes to `main`
- No merge without PR
- No merge without passing required checks
- No merge without Justine review on protected lanes
- Use squash merge by default
- Every ownership branch must map to one issue
- Every merged branch must be releasable only through `main`
