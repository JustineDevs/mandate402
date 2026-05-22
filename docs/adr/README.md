# Mandate402 ADR Index

This document is for contributors who need to know which architecture or workflow decisions are already recorded and which ADR governs a given lane of work.

## ADR Registry

| ADR | Title | Status | Purpose |
|---|---|---|---|
| [ADR-0001](./ADR-0001-justine-scope-documents.md) | Justine Scope Documents as the Explicit Authorization Surface | Accepted | Defines what counts as explicit scope authority for Justine-led work |
| [ADR-0002](./ADR-0002-sherwin-ui-wireframe-task.md) | Sherwin UI Wireframe Task for Mandate402 Operator Surfaces | Accepted | Defines the canonical wireframe, palette, and design handoff for Sherwin |
| [ADR-0003](./ADR-0003-john-frontend-implementation-task.md) | John Frontend Implementation Task and Repo Audit Boundary | Accepted | Defines John's transactional frontend lane and escalation boundaries |
| [ADR-0004](./ADR-0004-morph-first-hybrid-architecture.md) | Morph-First Hybrid Architecture | Accepted | Defines the target production architecture: onchain truth, worker execution, projection reads, and chain-aware frontend behavior |

## How To Use ADRs

- Read the ADR that applies to your lane before widening scope.
- If an ADR conflicts with casual instructions or stale assumptions, the tracked ADR wins until it is updated.
- If a new important decision is made, add a new ADR or update the existing one instead of relying on chat history.

## Current Ownership Mapping

- Justine scope authority: [ADR-0001](./ADR-0001-justine-scope-documents.md)
- Sherwin design task: [ADR-0002](./ADR-0002-sherwin-ui-wireframe-task.md)
- John transactional implementation task: [ADR-0003](./ADR-0003-john-frontend-implementation-task.md)
- Morph-first production architecture: [ADR-0004](./ADR-0004-morph-first-hybrid-architecture.md)
