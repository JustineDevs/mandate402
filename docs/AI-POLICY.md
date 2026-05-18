# Mandatory AI Policy

This document defines how AI tools may be used in Mandate402.

## AI Is Allowed To

- search and map the codebase
- draft code
- draft tests
- draft docs
- suggest refactors
- help with review preparation

## AI Is Not Allowed To Merge Directly

AI output must be reviewed by the human issue owner before PR or merge.

## Mandatory AI Scope Rules

- AI work must stay inside the assigned issue scope.
- AI work must stay inside the assigned lane unless the issue explicitly widens it.
- AI must not silently widen architecture, auth, infra, release, or contract scope.

## High-Risk Areas Requiring Explicit Human Review

- auth
- infrastructure
- contracts
- treasury logic
- release workflows
- secret handling

## Required Repo-Native Context

AI-assisted work must use the repo’s checked-in instructions:

- `AGENTS.md`
- `docs/TEAM.md`
- `docs/LANES.md`
- `docs/WORKFLOW.md`
- `docs/BRANCHING.md`
- issue + PR templates
- relevant ADRs

Chat alone is not a durable authority source.
