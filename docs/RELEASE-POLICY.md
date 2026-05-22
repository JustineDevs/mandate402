# Mandatory Release Policy

This document defines how releases happen in Mandate402. It is not optional.

## Release Authority

- `main` is the only release-authoritative branch.
- Only changes merged into `main` may produce:
  - release tags
  - GitHub Releases
  - release notes

No feature, fix, UI, docs, or chore branch may publish a release directly.

## Release Automation Rule

Release automation is owned by CI on `main`.

That means:

- tags are created automatically from `main`
- release notes are created automatically from `main`
- humans do not manually tag releases under normal operation

## Merge-to-Release Rule

Every change that affects the shipped product must:

1. originate from its own ownership branch
2. be linked to an issue
3. normally merge into `development` first
4. pass required checks
5. be promoted from `development` into `main`
6. allow release automation to decide whether a release is produced

Hotfix exception:

- urgent maintainer-approved hotfixes may branch from `main` and return directly to `main`
- after a hotfix lands, `development` must be resynced from `main`

## Required Conditions Before Merge To `main`

- PR is linked to an issue
- lane ownership is clear
- required reviewers approved
- all required workflows passed
- repo safety passed
- release-readiness passed
- no unresolved conversation remains

## Tagging Rule

- No manual release tagging in normal flow
- Tags are automation-owned artifacts from `main`
- Manual tagging is allowed only under the emergency hotfix policy

## Release Notes Rule

Release notes must come from the merged branch history and release automation on `main`.

That means PRs must be clear enough to support useful release notes:

- linked issue
- concise scope
- release impact if any
- deployment assumptions if any

## Merge Method Rule

Use **squash merge** for normal work unless a documented exception is approved by Justine.

Reason:

- one issue -> one PR -> one merge artifact
- cleaner AI-assisted history
- easier release-note tracing
