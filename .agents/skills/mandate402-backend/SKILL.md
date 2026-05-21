---
name: mandate402-backend
description: Load when the backend task is broad or spans multiple runtime lanes in Mandate402 and you need a strict router for backend-runtime, blockchain, and workers plus the shared rules for validation, security, DB behavior, and deployment-grade execution.
---

# Mandate402 Backend Router

Use this skill as the umbrella backend surface when the task is broad or the lane is not yet narrowed.

## Mandatory Router Behavior

Choose one or more narrower repo-local backend skills before implementing:

- `mandate402-backend-runtime`
  Use for APIs, auth, validation, persistence, DB limits, traffic assumptions, route logic, and CI/runtime safety.
- `mandate402-blockchain`
  Use for Morph networks, contracts, ABIs, clients, chain health, treasury execution, and onchain truth boundaries.
- `mandate402-workers`
  Use for durable task queues, leases, retries, dispatch workers, reconciliation workers, internal worker routes, and background execution.

If the task clearly belongs to only one lane, load that narrower skill directly.

## Shared Backend Rules

- runtime must fail closed when critical config is missing
- request path must not reclaim worker-owned logic casually
- chain truth must not be silently replaced by app-local state
- live runtime is Postgres-first
- worker and operator auth must remain separate
- vendor is not facilitator
- receipt evidence is not financial outcome

## Planning Loop

1. identify lane or mixed-lane scope
2. load the narrower backend skill(s)
3. plan the change
4. validate against AGENTS, architecture docs, and DB/security constraints
5. execute
6. verify with tests, typecheck, lint, and build

## Gotchas

- broad backend work often looks simple until it crosses workers, chain runtime, or persistence semantics
- do not let a “small fix” bypass the narrower skill boundaries when the task clearly belongs to runtime, blockchain, or workers
