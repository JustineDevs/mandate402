# Frontend Primitives

This document defines the shared frontend primitives that John and Edward must reuse instead of duplicating.

## Shared Primitive Classes

- cards
- badges
- tables
- pills
- form controls
- layout shells
- status chips
- section headers

## Rule

If a new frontend need can be satisfied by extending a shared primitive, do that instead of creating a second local version in another lane.

## Lane Reminder

- John owns transactional UI
- Edward owns observability/presentation UI

But neither lane owns a private duplicate primitive system.

## Escalate When

- a primitive change affects both lanes
- a shared component needs a new state or style variant
- design intent and implementation convenience conflict
