---
name: mandate402-api-contracts
description: Load when changing Mandate402 API routes, request/response envelopes, status codes, Zod validation, idempotency, correlation IDs, auth failures, or route-level tests.
---

# Mandate402 API Contracts

## Read First

- `AGENTS.md`
- `docs/SYSTEM_DESIGN.md`
- `references/api-contract-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify the route, caller, auth mode, and mutation/read boundary
- list required request fields, response envelope, status codes, and error shapes
- decide whether the route should execute work or enqueue worker-owned work

### 2. Validate

- reject malformed input before business logic
- preserve `correlationId` propagation on mutating routes
- preserve idempotency for payment and worker-related actions
- keep operator auth separate from internal worker auth

### 3. Execute

Preferred order:

1. schema/type contract
2. route validation
3. business module call
4. response envelope
5. route tests

### 4. Verify

Run focused route tests first, then type/lint/build when shared contracts changed.

## Gotchas

- do not return caller-supplied reconciliation truth as final payment truth
- do not leak stack traces, provider secrets, or raw env values in API errors
- do not introduce route-local state machines outside domain modules
