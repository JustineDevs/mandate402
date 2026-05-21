---
name: mandate402-backend-runtime
description: Load when changing Mandate402 APIs, auth, validation, persistence, request-path logic, database behavior, limits, expected traffic handling, CI/CD, or deployment-grade backend runtime semantics.
---

# Mandate402 Backend Runtime

## Read First

- `AGENTS.md`
- `docs/SYSTEM_DESIGN.md`
- `docs/MORPH-FIRST-HYBRID-ARCHITECTURE.md`
- `references/runtime-and-architecture.md`
- `references/db-security-and-ops.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify the route/module boundary
- list auth, validation, persistence, and traffic assumptions
- decide whether logic belongs in request path or worker path
- identify verification commands before editing

### 2. Validate

Check that the plan preserves:

- fail-closed runtime behavior
- explicit validation
- Postgres-first live persistence
- no silent fallback execution
- correct traffic posture for reads/writes and retries

### 3. Execute

Preferred order:

1. types or schema contract
2. request validation
3. runtime logic
4. health / observability
5. tests

### 4. Verify

Run as relevant:

- `pnpm exec vitest run ...`
- `pnpm typecheck`
- `pnpm exec eslint ...`
- `pnpm exec biome check ...`
- `pnpm build`

## Scope

Use this skill for:

- Next.js API route construction
- RESTful route behavior
- server-side business logic
- validation rules
- request/response envelopes
- persistence semantics
- transaction/pooler-safe DB behavior
- security posture for runtime paths
- CI/CD compatibility and release-safe backend changes

## Gotchas

- do not put worker loops back into routes
- do not fake runtime readiness for convenience
- do not conflate operator auth with internal worker auth
- do not weaken data validation to make tests easier
