# Runtime and Architecture Reference

Use this file when the task needs the approved backend runtime shape.

## Request Path Contract

1. authenticate
2. validate request
3. load current state
4. enforce policy
5. enforce treasury gate when configured
6. reserve or reject
7. enqueue work
8. record audit and domain events

## Live Runtime Rules

- live runtime is Postgres-first
- runtime must fail closed
- no silent fallback execution
- no fake success states
- queue/task durability must be explicit where workers own execution

## Traffic Assumptions

Assume:

- moderate write pressure on attempts, events, and worker tasks
- read-heavy dashboards and audit views
- retry amplification under vendor degradation
