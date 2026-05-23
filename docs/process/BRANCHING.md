# Mandatory Branching Strategy

This document defines the required Git branching model for Mandate402.

## Branch Model

- `main` is the only release-authoritative branch.
- `development` is the protected team integration branch.
- All day-to-day work must happen on short-lived feature/fix/docs/chore branches created from `development`.
- Do not commit directly to `main`.
- Do not commit directly to `development`.

Normal path:

`ownership branch` -> `PR into development` -> `promotion PR from development into main` -> `semantic-release on main` -> `auto-sync main back into development`

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
- use `git pull --ff-only origin development` on `development`
- use `git fetch origin` + `git rebase origin/development` on ownership branches

Avoid by default:

```bash
git pull
```

because it may create implicit merge commits depending on local config.

## Branch Freshness Rule

- A team PR branch must be reasonably fresh against `development` before final review.
- If `development` changed in a shared or related surface, the branch owner must sync before continuing implementation.
- Branches behind `development` should be rebased before merge unless Justine explicitly approves review on a stale branch.
- The `development` branch should stay current with `main` through the repo sync workflow or an explicit maintainer repair merge.

## Merge Rule

- No direct pushes to `main`
- No direct pushes to `development`
- No merge without PR
- No merge without passing required checks
- No merge without Justine review on protected lanes
- Use squash merge by default
- Every ownership branch must map to one issue
- Team ownership branches normally merge into `development`
- Releases and release tags still happen only through `main`
