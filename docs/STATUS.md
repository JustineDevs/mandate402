# Mandate402 Status

This document is for contributors, reviewers, and stakeholders who want a concise view of what Mandate402 is today, what runtime surfaces are already real, and what the likely next documentation and product steps are.

## Current Product Shape

Mandate402 currently implements a narrow but complete operator loop:

- create a mandate
- allow one approved payment attempt
- block one invalid attempt before vendor execution
- separate financial outcome from receipt evidence outcome
- reconcile an ambiguous attempt
- revoke a mandate

## What Is Real Now

- operator-facing Next.js app and API routes
- fail-closed Supabase-backed auth boundary
- Postgres-first live persistence semantics
- explicit audit entries and domain events
- policy checks before payment dispatch
- x402-based vendor execution path with explicit endpoint requirements
- Morph lifecycle anchoring for mandate issue and revoke
- treasury contract that models facilitator allowlists and fiat-window guardrails
- optional on-chain treasury execution when runtime config is complete

## What Is Still In Progress

- broader production vendor ecosystem beyond the local sample vendor service
- full token quote / settlement asset model for treasury execution
- worker-owned reconciliation
- deploy and rollback runbooks

## What This Means

The project is beyond concept stage and now defaults to real-runtime behavior.

It proves the control model first:

- allow
- block
- reserve
- reconcile
- revoke
- audit

## Current Team/Process State

- Justine scope authority is defined in [ADR-0001](./adr/ADR-0001-justine-scope-documents.md)
- Sherwin's wireframe task is defined in [ADR-0002](./adr/ADR-0002-sherwin-ui-wireframe-task.md)
- John's transactional implementation boundary is defined in [ADR-0003](./adr/ADR-0003-john-frontend-implementation-task.md)
- The frontend is split into transactional UI and observability/presentation UI lanes.

## Current Documentation State

Available:

- plain-language explainer
- product overview
- business model
- technical system design
- team contract
- workflow, branching, lane, AI policy, and label docs
- release, hotfix, and PR policy docs
- ADR set
- glossary
- design token reference

Still useful to add later:

- deployment runbook
- release runbook
- API contract reference if the public surface grows

## Next Practical Priorities

Likely next product or documentation steps:

1. keep one shared design-token and primitive system aligned across both frontend lanes
2. expand vendor-path documentation only when the real vendor shape stabilizes
3. add more deployment and operations guidance as release readiness expands
