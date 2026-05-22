# Production Hardening Gates

This document captures the active Maestro gate state for the production hardening pass.

## Current Decision

The next safe lane is `$arch`.

Implementation-wide refactoring is blocked until the architecture gate is approved. The repository already has useful production-hardening work, but a full-system hardening pass must not silently widen scope across auth, infra, contracts, frontend, and release without a gated decision record.

## Architecture Brief

Mandate402 is a Morph-native governance and treasury control layer for x402 machine commerce.

The production target is a hybrid architecture:

- Supabase-backed operator identity for dashboard/API access.
- Postgres as the production projection and operations store.
- Cloudflare Workers as thin control, queue, cron, and cache surfaces.
- Morph contracts as canonical trust-critical authority for registry and treasury guardrails.
- The current sprint keeps the simple EOA signer model through `MORPH_PRIVATE_KEY`; Account Abstraction remains future scope.

## Subsystem Boundaries

| Boundary | Owner | Current posture | Hardening requirement |
| --- | --- | --- | --- |
| Operator auth | Supabase + API routes | Implemented in `requireOperator` | Verify revoked/expired users fail closed and roles are auditable. |
| Worker auth | `MANDATE402_WORKER_TOKEN` | Implemented for internal worker routes | Rotate secret and move to Cloudflare secrets in deployment. |
| Chain execution | viem EOA signer | Implemented through Morph wallet client | Keep signer out of repo; define rotation and compromise runbook. |
| Persistence | Postgres/SQLite abstraction | Postgres production mode exists; SQLite test/demo only | Prove row-level semantics under real Postgres CI and no production SQLite path. |
| Reconciliation | Worker queue + route enqueue | Worker-owned flow exists | Define stale `execution_unknown` escalation and operator incident view. |
| Vendor truth | Named vendor endpoints | Narrow vendor registry exists | Document status endpoint contract and disagreement handling. |
| Release | GitHub workflows + repo checks | Checks exist | Gate release on linked issue, PR, CI, secrets posture, and human review. |

## Approved First Scope

The next implementation wave should stay narrow:

1. Stabilize canonical env/config validation.
2. Tighten production boot/readiness checks.
3. Add real Postgres integration evidence for row-level writes and worker lease/retry paths.
4. Add stale reconciliation escalation and `/api/system` visibility.
5. Add security tests for revoked/unauthorized operator paths and worker-token failures.

## Do Not Do Yet

- Do not add EIP-4337 or Account Abstraction in the current sprint.
- Do not broaden vendor marketplace support.
- Do not replace Postgres with D1 as source of truth.
- Do not perform large frontend redesign without Sherwin handoff.
- Do not merge or release from the current dirty branch state.

## Blocked Outside Repo

- Real Supabase project configuration and role claims.
- Real Postgres/Supabase database provisioning and backup policy.
- Real Cloudflare account bindings, queue IDs, D1 database ID, and secret deployment.
- Real Morph signer custody, funding, rotation, and compromise process.
- Real x402 access and vendor credentials.

## Next Gate

After this `$arch` state is accepted, run `$sage`.

`$sage` must verify upstream/service assumptions and map exact repo evidence before `$flow` plans implementation sequencing.
