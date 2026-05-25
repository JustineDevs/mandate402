# Mandate402 Agile Delivery Notes

This document explains how Mandate402 applies Agile principles without turning
them into vague process theater.

## Agile Interpretation

For this repository, Agile means:

- small scoped issues
- explicit ownership
- rapid feedback
- visible tradeoffs
- honest verification

It does **not** mean:

- skipping architecture
- silently widening scope
- merging partial work because “we’ll iterate later”

## Agile Constraints For Mandate402

Because Mandate402 touches trust boundaries and treasury behavior, iteration is
allowed on:

- UI polish
- developer experience
- observability refinement
- roadmap sequencing

But iteration is **not** an excuse to leave core truth ambiguous in:

- auth
- payment execution
- reconciliation
- chain anchoring
- release safety

## Agile Operating Rules

1. Start with one issue, not one big promise.
2. Keep each issue small enough to review.
3. Record architecture and ownership decisions durably.
4. Reconcile docs and runtime together.
5. Prefer one honest increment over three speculative ones.

## Team Alignment

Agile delivery in Mandate402 still respects:

- Justine scope authority
- Sherwin design authority
- John transactional UI lane
- Edward observability UI lane

## Release Discipline

Agile iteration stops at the release gate.

No issue is “done enough” if:

- CI is failing
- the runtime claim is misleading
- the docs drift from behavior
- the issue body no longer describes the real outcome
