# Runtime and Architecture Reference

Use this file when the task needs the approved backend shape.

## Trust Boundary

- facilitator = payment infrastructure
- vendor = paid service endpoint
- Mandate402 = governance and treasury guardrail layer
- oracle = fiat value reference

Do not collapse these roles.

## Approved Architecture

Mandate402 follows a Morph-first hybrid direction:

- onchain truth for authority and policy
- workers for execution and reconciliation
- Postgres for projection and operational reads
- chain-aware frontend for trust-critical visibility

## Request Path Order

1. authenticate
2. validate request
3. load current state
4. enforce policy
5. enforce treasury gate
6. reserve or reject
7. enqueue work
8. record audit and domain events

## Worker Path Ownership

Workers own:

- vendor dispatch
- reconciliation
- lease and retry behavior
- queue/task progression

## System Truth Rules

- `execution_unknown` stays unresolved until correlation proves final truth
- reservation remains held until execution result or reconciliation releases it
- projected DB state is not the same as chain truth
- route handlers should not silently absorb worker logic when worker ownership is intended
