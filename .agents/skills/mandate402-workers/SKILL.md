---
name: mandate402-workers
description: Load when changing Mandate402 worker execution, durable task queues, leases, retries, internal worker routes, background processing, reconciliation ownership, or scheduler-facing runtime behavior.
---

# Mandate402 Workers

## Read First

- `AGENTS.md`
- `docs/MORPH-FIRST-HYBRID-ARCHITECTURE.md`
- `docs/adr/ADR-0004-morph-first-hybrid-architecture.md`
- `references/workers-and-reconciliation.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify whether the task is dispatch, reconciliation, task durability, lease logic, retry logic, or worker route behavior
- identify which parts belong in request path vs worker path
- identify whether the worker action must be durable, retryable, or externally triggerable

### 2. Validate

Preserve these rules:

- request path reserves and enqueues; workers execute or reconcile
- worker tasks must be durable where worker ownership exists
- `execution_unknown` remains unresolved until correlation proves truth
- worker auth stays separate from operator auth
- retries and lease transitions are explicit

### 3. Execute

Preferred order:

1. task type / lease model
2. worker route or processor behavior
3. retry / failure handling
4. tests and health reporting

### 4. Verify

Run as relevant:

- `pnpm exec vitest run ...`
- `pnpm typecheck`
- `pnpm exec eslint ...`
- `pnpm build`

## Scope

Use this skill for:

- execution workers
- reconciliation workers
- durable worker task entities
- lease ownership and expiry
- internal worker routes
- queue metrics and health
- scheduler-ready runtime behavior

## Gotchas

- do not let routes swallow worker ownership because it feels faster
- do not resolve `execution_unknown` without correlation
- do not make retries implicit or unbounded
- do not hide queue backlog or leased-task state
