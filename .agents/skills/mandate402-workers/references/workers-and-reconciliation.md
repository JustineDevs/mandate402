# Workers and Reconciliation Reference

Use this file when the task needs worker ownership rules.

## Worker Ownership

Request path owns:

- auth
- validation
- policy
- treasury gate
- reserve or reject
- enqueue

Workers own:

- dispatch
- reconciliation
- task durability
- leases
- retries

## Durable Task Rules

Worker tasks should be explicit about:

- kind
- status
- lease owner
- lease expiry
- available time
- attempt count
- last error

## Reconciliation Rules

- `execution_unknown` stays unresolved until correlation proves truth
- reconciliation worker, not operator route, should own final correlation work
- retry policy must be explicit
