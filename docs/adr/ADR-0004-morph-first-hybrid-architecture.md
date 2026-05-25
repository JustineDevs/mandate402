# ADR-0004: Morph-First Hybrid Runtime Architecture

- Status: Accepted
- Date: 2026-05-20
- Owners: Justine (`@JustineDevs`), Mandate402 team

## Context

Mandate402 needs a durable architecture decision that explains how the app,
worker, chain, vendor, and persistence surfaces fit together as the product
moves from MVP into production-hardening releases.

Earlier planning and execution work already converged on a few non-negotiable
constraints:

- Morph remains the canonical chain environment for mandate lifecycle anchoring
- x402-paid HTTP API vendors remain the primary paid supplier format
- operator auth and policy checks must fail closed before any treasury value is
  allowed to leave the system
- ambiguous payment outcomes must be owned by worker-led reconciliation instead
  of UI or caller guesswork
- production persistence must be Postgres-backed rather than local SQLite

What was missing was a tracked ADR that makes the runtime shape explicit enough
that later contributors do not re-open the same architecture decision from
scratch.

## Decision

Mandate402 will use a **Morph-first hybrid runtime architecture**.

That means:

1. the product remains a modular-monolith application at the main runtime layer
2. protected operator actions run through the Next.js app and API boundary
3. worker-owned execution and reconciliation handle queued and ambiguous payment
   states
4. Morph is the canonical chain surface for mandate issue/revoke anchoring and
   related treasury-facing chain reads or writes
5. named vendors remain environment-configured integrations behind explicit
   policy controls
6. Postgres is the live and production persistence authority

## Architectural Shape

### Control plane

- Next.js app under `src/app/**`
- protected operator console
- API routes for mandates, attempts, reconcile queueing, system status, and
  operator access

### Runtime modules

- `auth`
- `mandates`
- `policy`
- `payments`
- `execution-worker`
- `receipts_audit`
- `vendor integrations`

### Persistence

- Postgres-backed runtime store for live and production paths
- SQLite remains test-only and local-isolated for narrow test execution

### Chain boundary

- Morph issue/revoke anchoring stays explicit
- production chain writes fail closed when required config is missing
- treasury-facing chain behavior remains centralized behind typed modules

### Vendor boundary

- named primary vendors
- fallback-only wrapper posture remains explicit
- vendor truth and facilitator truth stay separated

## What “Hybrid” Means Here

The architecture is “hybrid” because Mandate402 is not:

- a pure on-chain application
- a pure off-chain dashboard
- a pure vendor-owned settlement layer

Instead it combines:

- off-chain operator identity and policy enforcement
- worker-owned runtime reconciliation
- on-chain Morph lifecycle anchoring
- external vendor and facilitator payment infrastructure

That split is intentional because it preserves the product’s core value:
governed machine spend with explicit audit and failure semantics.

## Consequences

### Positive

- keeps the system small-team operable
- preserves clear trust boundaries
- supports production hardening without rewriting the whole app into
  microservices
- makes worker ownership, Postgres authority, and Morph anchoring explicit

### Tradeoffs

- the modular monolith still requires discipline to avoid tight coupling
- some future multi-chain or multi-vendor ambitions must wait for later
  releases
- chain, runtime, and vendor truth still need careful documentation and
  verification so contributors do not collapse them back together

## Boundaries This ADR Does Not Set

This ADR does not by itself decide:

- exact vendor contracts for every future integration
- final cross-chain treasury policy
- DeFi allocation strategy
- facilitator staking or slashing policy

Those require later ADRs or release-specific implementation issues.

## Operational Notes

- `docs/architecture/SYSTEM_DESIGN.md` should remain aligned with this ADR
- release-ladder planning should treat this architecture as the baseline for
  `v0.2.0` and `v0.3.0` hardening work
- later roadmap issues should reference this ADR when they widen treasury,
  vendor, or chain integration scope
