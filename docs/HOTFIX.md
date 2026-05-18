# Mandatory Hotfix Policy

This document defines the only acceptable exception path for urgent production fixes.

## Hotfix Definition

A hotfix is a production repair needed to restore safety, availability, or correctness.

Examples:

- release automation broke `main`
- a security or auth issue must be corrected immediately
- a treasury-critical runtime path is broken in deployed production

## Default Rule

Even hotfixes should still use:

- an issue
- a branch
- a PR
- required checks where time allows

## Emergency Exception

If waiting for the normal path would materially increase production harm, Justine may approve an emergency hotfix path.

Emergency hotfix path:

1. create a hotfix issue
2. create branch:
   - `hotfix/<issue>-<slug>`
3. keep the diff as small as possible
4. run the fastest relevant verification
5. merge with Justine approval
6. document the exception and follow with a post-incident cleanup PR if needed

## Manual Tagging Exception

Manual release tagging is not normal workflow.

It is allowed only if:

- release automation is broken
- the hotfix has already been reviewed and merged
- Justine explicitly approves the emergency release action

## After-Action Requirement

Every emergency hotfix must produce:

- a short incident note
- what was bypassed
- what was verified
- what must be repaired in the normal release path afterward
