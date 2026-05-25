# Stuck Reconciliation Runbook

Use this runbook when `execution_unknown` attempts are not resolving correctly.

## Trigger conditions

- `/api/system` reports stale unknown attempts
- operator workspace shows repeated unresolved payment incidents
- reconciliation worker tasks are repeatedly requeued or failing

## Triage

1. Check `/api/system`
2. Identify:
   - stale unknown attempt count
   - queued reconciliation task count
   - failed reconciliation task count
3. Capture the affected attempt IDs and payment identifiers

## Diagnose by layer

### Worker auth

- verify internal worker routes still accept the current `MANDATE402_WORKER_TOKEN`

### Vendor truth

- verify the named vendor status endpoint is reachable
- verify it returns consistent charge status data

### Facilitator truth

- verify x402 facilitator credentials are valid
- verify facilitator verification calls are succeeding when payment artifacts are present

### Store / lease health

- inspect whether tasks are stuck queued, repeatedly leased, or permanently failed
- check for duplicate reconcile activity on the same attempt

## Safe actions

- re-run reconciliation only through the supported queue/worker path
- do not manually mutate final financial status in the database
- do not release reservations by hand without understanding charge truth

## Escalation path

Escalate when:

- the 15-minute stale window is exceeded
- facilitator truth and vendor truth conflict repeatedly
- multiple attempts are stuck at once
- worker failure repeats after config/network checks

## Resolution criteria

- attempt leaves `execution_unknown`
- reservation state is correct
- consumed amount matches the final financial outcome
- receipt evidence remains explicitly tracked
- incident is reflected as resolved in runtime/system surfaces
