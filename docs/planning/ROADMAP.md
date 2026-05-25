# Mandate402 Roadmap

This document gives the high-level roadmap shape for Mandate402.

The detailed issue-level roadmap is tracked in GitHub issues and milestones.

## Current Release Sequence

### `v0.1.x`

MVP stabilization:

- auth/runtime hardening
- release-safety corrections
- deploy-shape and verification improvements
- no major widening beyond the current control loop

### `v0.2.0`

Production-hardening:

- stronger operator auth and signer isolation
- Postgres-first persistence
- worker-owned execution/reconciliation as standard path
- safer deployment topology and observability

### `v0.3.0`

Operational confidence + first strategic extensions:

- Goldsky subgraph indexing
- Goldsky-backed audit/dashboard views
- narrow Morph Rails group-approval path
- batch payment orchestration spike
- first DeFi adapter slice
- LI.FI and facilitator-staking research gates

### `v1.0.0`

Stable operator control plane:

- cross-chain treasury rebalance engine
- facilitator staking/slashing registry
- multi-protocol treasury allocation engine
- portfolio and governance dashboards
- compliance-grade enforcement
- stable docs and runbooks pack

## Rule

Roadmap work must not start before the current release gate is honestly closed.

For the canonical version-delivery ladder, see:

- `.omx/plans/release-ladder.md`
