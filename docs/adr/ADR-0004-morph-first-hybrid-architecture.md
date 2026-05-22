# ADR-0004: Morph-First Hybrid Architecture

## Status

Accepted

## Date

2026-05-19

## Decision

Mandate402 will evolve toward a **Morph-first hybrid architecture**:

- Morph contracts and events are the canonical trust and authority layer
- deployed workers perform offchain execution and reconciliation
- Postgres remains the projection and read-model layer
- the frontend becomes chain-aware and index-backed instead of server-local in its trust model

## Context

The repository already has:

- Morph lifecycle anchoring
- treasury contract logic
- x402 payment execution
- a structured runtime model
- a growing blockchain runtime layer

But the repository also still reflects a more traditional app-server posture than the product should keep long term.

That creates several problems:

- laptop-local or repo-local services still influence the implementation story
- chain truth is important but not yet the primary truth surface
- reconciliation and execution are still too request-path-centric
- frontend trust surfaces depend too much on app-local state

## Why This Decision

Mandate402 is not trying to be:

- a generic wallet
- a pure backend SaaS
- a pure onchain application

It is trying to be:

> a governance and treasury control layer for machine payments on Morph

That means the architecture must preserve:

- chain-native trust
- offchain execution practicality
- strong auditability
- operator-readable state

The right model is therefore hybrid:

- onchain for truth
- workers for execution
- projection DB for reads

## What Becomes Canonical Onchain

- mandate issue / revoke truth
- treasury guard truth
- facilitator allowlists
- kill-switch truth
- agent/onchain identity mapping

## What Stays Offchain

- vendor HTTP calls
- x402 facilitator interaction details
- private API key use
- correlation retries
- long-form audit projections
- query/index surfaces

## Architectural Consequences

### Positive

- clearer trust model
- less dependence on local runtime assumptions
- better frontend transparency
- stronger release and deployment story

### Negative

- more moving parts
- need for deployed workers
- need for projection/index maintenance
- higher operational sophistication than a single app server

## Rejected Alternatives

### 1. Full app-server authority

Rejected because it weakens the chain-native trust proposition and keeps too much hidden authority offchain.

### 2. Fully onchain backend

Rejected because vendor execution, x402 HTTP flow, private credentials, and dashboard query needs do not belong fully onchain.

### 3. Remove Postgres entirely

Rejected because dashboards, audit views, and operator queries still need a projection/read model.

## Immediate Follow-On Work

1. extract execution into workers
2. implement worker-owned reconciliation
3. add explicit projection/index layer
4. replace env-only agent address mapping with a proper identity surface
5. make frontend read chain truth and projected truth explicitly

## Directive

Do not re-center trust-critical authority in app-local runtime state after this decision. New work should bias toward:

- chain truth
- worker execution
- projection-backed reads

and should treat laptop-local runtime behavior as a development convenience only, never as product architecture.
