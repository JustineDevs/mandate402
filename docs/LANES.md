# Mandatory Lane Ownership

This document defines the required ownership map for Mandate402.

## Core Lanes

### Justine

- product direction
- backend
- infrastructure
- release
- architecture

### Sherwin

- wireframes
- visual system
- interaction intent
- design authority

### Edward

- transactional frontend
- auth-aware UI
- API-connected UI
- action-heavy surfaces

Examples:

- create mandate
- run attempt
- revoke flows
- authenticated operator actions

### John

- observability frontend
- dashboard
- audit views
- receipts
- presentation-heavy read surfaces

Examples:

- dashboard
- status surfaces
- audit timeline
- read-model screens

## Shared Primitive Rule

Shared UI primitives must be centralized and reused.

This includes:

- cards
- badges
- tables
- pills
- form controls
- layout shells

No parallel primitive systems are allowed across Edward and John lanes.

## Overlap Rule

If a change touches another lane’s owned surface, the implementer must flag it in the issue or PR explicitly before editing.

Silent overlap is not allowed.
