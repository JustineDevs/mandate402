# API Contract Checklist

Every meaningful API route change must answer:

- What actor calls this route: operator, worker, smoke test, or public client?
- What auth failure status is returned?
- What validation failure status is returned?
- Does the response use the existing `ok` / `data` / `error` style?
- Does a mutating request preserve or create `correlationId`?
- Is idempotency enforced for payment identifiers, worker tasks, and reconciliation?
- Does the route enqueue work when side effects belong to a worker?
- Are tests covering success, auth failure, validation failure, and relevant conflict cases?

Route-specific rules:

- mandate create/revoke routes own authorization and policy input validation
- attempt routes own reservation/enqueue behavior, not vendor dispatch
- worker routes require worker auth and must not accept operator tokens
- reconcile routes enqueue reconciliation and must not accept caller-supplied final state
- system routes may report readiness but must not expose secrets
