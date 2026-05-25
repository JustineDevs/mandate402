# ADR-0005: Edward Observability Frontend Implementation Boundary

- Status: Accepted
- Date: 2026-05-25
- Owners: Justine (`@JustineDevs`), Edward Joseph (`@automatewithedward`)

## Context

Mandate402 already has:

- an explicit Justine scope-authority ADR
- an explicit Sherwin design/wireframe ADR
- an explicit John transactional frontend ADR

But Edward’s lane still lives mostly in `docs/process/TEAM.md` and issue copy,
not in its own durable ADR.

That creates three problems:

1. observability-heavy UI ownership is documented less strongly than John’s
   transactional lane
2. contributors can still confuse read-heavy surfaces with action-heavy ones
3. shared-surface collisions between John and Edward are easier to justify
   informally because Edward’s lane is not captured as a first-class tracked
   decision

## Decision

Edward’s frontend work will follow an **observability-first implementation
boundary** with explicit read-heavy ownership, shared-primitive reuse rules,
and escalation triggers.

## Edward Task Definition

Edward is responsible for implementing the presentation-heavy and read-model
frontend lane while preserving current runtime truth and avoiding overlap with
John’s default action-heavy ownership.

This includes:

- dashboard and treasury status surfaces
- audit and receipt views
- policy, system-health, and other read-heavy operator screens
- reusable presentation primitives for read-heavy surfaces
- responsive refinement for observability-oriented layouts

## Default File Ownership

Unless Justine scope documents explicitly widen the task, Edward’s default lane
is:

- `src/components/**` for read-heavy presentation primitives
- `src/app/**` where work touches dashboard, audit, receipts, policy-registry,
  status, and read-model operator views
- shared style surfaces only when observability-lane work requires them

Edward should not silently widen into:

- transactional action flows already owned by John
- backend or API semantic changes
- contract logic
- release tooling
- duplicated component systems

## What Sherwin’s Handoff Authorizes

Sherwin’s approved design handoff authorizes Edward to implement:

- layout hierarchy for read-heavy screens
- spacing, typography, and visual state treatment
- cards, tables, badges, and status surfaces
- responsive behavior for dashboard and audit-style screens

It does not authorize Edward to redefine:

- API truth
- policy rules
- payment semantics
- release posture
- product scope

Those remain under Justine scope authority and runtime review.

## Escalation Triggers

Edward must escalate instead of improvising when:

- a read-heavy UI needs backend data that does not exist yet
- a dashboard or audit view implies a new product rule or runtime meaning
- a shared component change materially affects John’s transactional surfaces
- the simplest UI implementation would hide degraded, blocked, or unresolved
  truth

## Expected Output

Edward’s implementation handoff should include:

- working read-heavy frontend changes
- notes on shared primitives reused or updated
- screenshots or recordings for observability surfaces
- responsive verification notes
- explicit notes when runtime or API limitations were discovered

## Acceptance Criteria

This ADR is satisfied when:

1. Edward’s read-heavy frontend lane is explicit and reviewable
2. observability surfaces can be implemented without silently taking
   transactional ownership
3. shared-primitives reuse is the default instead of component duplication
4. Justine can review Edward’s work knowing exactly where observability
   ownership ends and runtime escalation begins

## Consequences

### Positive

- clearer separation between read-heavy and action-heavy frontend work
- fewer shared-screen collisions
- stronger anti-silo documentation for frontend ownership
- easier issue creation and roadmap assignment for Edward’s lane

### Tradeoffs

- Edward may need to stop earlier on missing backend truth
- some shared-surface edits will require more coordination up front

## Operational Notes

- `docs/process/TEAM.md` should reference this ADR for Edward’s lane
- roadmap and sprint issues for observability UI should cite this ADR when
  ownership matters
- shared-primitives work should still be coordinated with John when both lanes
  touch the same surface
