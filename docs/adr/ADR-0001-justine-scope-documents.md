# ADR-0001: Justine Scope Documents as the Explicit Authorization Surface

- Status: Accepted
- Date: 2026-05-16
- Owners: Justine (`@JustineDevs`), Mandate402 team

## Context

The Mandate402 team workflow assigns Justine responsibility for:

- product direction
- sprint planning
- infrastructure and backend alignment
- release authority
- major and minor scope changes

The AI rule files currently say:

> Do not modify infrastructure, backend, release, or contract-facing files without explicit instruction from Justine's scope documents.

That rule is directionally correct but ambiguous without a clear definition of:

- which documents count as scope documents
- what level of change they authorize
- what happens when scope is incomplete or conflicting

Without that definition, the team can drift into tunnel vision, undocumented assumptions, or informal approvals living only in chat history.

## Decision

Mandate402 will treat a small set of repository artifacts as the official scope authority for work owned or approved by Justine.

### 1. Documents that count as Justine scope documents

The following are valid scope sources when authored or explicitly approved by Justine:

1. GitHub issue descriptions using the team handoff template
2. Product, scope, or architecture documents committed under `docs/`
3. ADRs committed under `docs/adr/`
4. Sprint or progress entries committed in `PROGRESS.md`
5. PR descriptions or review comments from Justine when they explicitly approve a change in direction

### 2. What a valid scope document must contain

A scope document is considered explicit only if it states enough of the following to guide implementation safely:

- goal or problem statement
- intended user or system impact
- constraints or non-goals
- affected surfaces or directories
- acceptance criteria or review gates

If those elements are missing, the document may provide context, but it does not authorize broad interpretation.

### 3. Authority boundaries

Justine scope documents may authorize:

- frontend changes
- backend and infrastructure changes
- runtime and API changes
- release-process changes
- contract-adjacent changes

But only to the extent that the document makes those changes explicit or clearly implied.

They do not authorize:

- silent widening of scope
- accidental changes to unrelated files
- policy or contract semantics being changed by convenience
- replacing review gates with agent autonomy

### 4. Escalation rule

If Edward, Sherwin, or any AI tool cannot point to a valid Justine scope document for a risky change, the correct action is:

1. stop widening the change
2. document the ambiguity
3. request clarification or a committed scope update

This is especially required for:

- infrastructure
- backend logic
- release tooling
- contract-facing behavior
- changes that alter product semantics instead of presentation only

### 5. Source-of-truth rule

Chat messages, verbal agreements, and ephemeral AI prompts may help explain intent, but they are not the enduring source of truth unless the decision is written back into a tracked repository artifact.

If a decision matters for later contributors, it should be written into one of the recognized scope documents above.

## Consequences

### Positive

- the team gets a concrete authorization surface instead of ambiguous “Justine said so” reasoning
- Edward can audit scope before implementation
- Sherwin can distinguish design context from product authorization
- AI rule files gain a stable repository reference
- review conversations become easier to trace later

### Tradeoffs

- Justine must keep scope artifacts current instead of relying on private context
- some work will pause when documentation is incomplete
- the team needs discipline to write back decisions instead of leaving them in chat

## Operational Notes

- `docs/TEAM.md` should point contributors to this ADR when referencing Justine scope authority.
- `.cursorrules`, `.clauderules`, and `.devinrules` should treat this ADR as the definition of “Justine scope documents.”
- New ADRs may refine this rule later, but they should not weaken the requirement for explicit, tracked scope without a deliberate decision.
