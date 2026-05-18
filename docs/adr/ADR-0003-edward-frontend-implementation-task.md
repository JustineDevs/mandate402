# ADR-0003: Edward Transactional Frontend Implementation Boundary

- Status: Accepted
- Date: 2026-05-16
- Owners: Justine (`@JustineDevs`), Edward Joseph (`@automatewithedward`)

## Context

The team has a documented design lane for Sherwin, but implementation can still drift if Edward does not have an equally explicit boundary for:

- what "repo audit first" means
- which files are normally in his lane
- what he may implement directly from Sherwin's handoff
- when he must escalate back to Justine instead of improvising

Without this, frontend work can easily widen into backend, infra, or product-redefinition work under the pressure of "just making the UI function." It also creates overlap risk once a second frontend implementer is added.

## Decision

Edward's frontend work will follow a repo-audit-first implementation model with explicit default ownership, escalation rules, and handoff expectations for the transactional UI lane.

## Edward Task Definition

Edward is responsible for converting approved design handoffs into working transactional frontend code while preserving the existing runtime and API semantics.

This includes:

- auditing the repository before coding
- reusing current app patterns where they already exist
- implementing semantic, responsive UI
- wiring approved interactions to existing API and runtime boundaries
- surfacing conflicts early instead of silently widening scope

## Required Intake Checklist

Before implementation, Edward should:

1. sync the latest repository state
2. review the active scope source from Justine
3. review Sherwin's design handoff
4. inspect the current app structure and existing patterns
5. identify any likely conflict between design intent and the current runtime shape

If a conflict is found, it should be written down and escalated before large implementation begins.

## Default File Ownership

Unless Justine scope documents explicitly widen the task, Edward's default implementation lane is:

- `src/components/**`
- `src/app/**` where work touches mandate creation, attempts, revoke, or auth-aware flows
- shared frontend styling surfaces only when a transactional lane change requires them
- `public/**` for UI assets needed for implementation

Edward may update these areas to complete frontend work, but should not silently widen into:

- infrastructure or workflow files
- backend semantics
- contract logic
- release tooling
- changes that redefine the product model itself
- presentation-heavy screens already owned by John unless coordination is explicit

## What Sherwin's Handoff Authorizes

Sherwin's design handoff authorizes Edward to implement:

- layout structure for transactional surfaces
- spacing and hierarchy
- visual states
- responsive behavior
- status badges and presentation logic

It does not by itself authorize Edward to redefine:

- policy rules
- backend validation rules
- API contracts
- release rules
- contract-facing behavior

Those require scope authority from Justine as defined in [ADR-0001](./ADR-0001-justine-scope-documents.md).

## Escalation Triggers

Edward must escalate instead of improvising when:

- the UI requires backend data the current API does not provide
- the design implies a product rule not present in the scope documents
- implementation would require infra, release, or contract-facing changes
- current runtime semantics conflict with the apparent UI intent
- a visual simplification would materially change product meaning

The goal is not to block progress; the goal is to keep product truth visible.

## Expected Output

Edward's implementation handoff should include:

- working transactional frontend changes
- short repo-audit notes if a conflict was found
- screenshots or recordings
- responsive verification notes
- a brief note on whether runtime or API assumptions were preserved or whether escalation was required

## Acceptance Criteria

This ADR is satisfied when:

1. Edward can implement transactional frontend work without having to guess his authority boundary
2. Sherwin's design handoff can be translated into code without redefining backend semantics
3. Justine can review the output knowing where frontend authority ended and escalation began

## Consequences

### Positive

- clearer implementation ownership
- less silent scope creep
- fewer design-to-code misunderstandings
- easier review of what is transactional frontend-only versus product-semantic change

### Tradeoffs

- Edward may need to pause sooner on ambiguous work
- some "quick fixes" become explicit scope conversations instead of silent implementation choices
