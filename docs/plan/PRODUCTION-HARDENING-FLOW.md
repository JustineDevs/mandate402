# Production Hardening Flow Review

This document captures the `$flow` gate for Mandate402's production hardening path.

## Key Actors

- Operator
- Next.js API runtime
- Postgres/SQLite-backed store abstraction
- Execution worker
- Reconciliation worker
- Cloudflare Worker control plane
- Durable Object budget lock
- Morph contracts
- x402 facilitator
- Vendor service

## Key System States

### Mandate states

- `draft`
- `issued_active`
- `issued_reserved`
- `revoking`
- `revoked`
- `expired`

### Attempt states

- `created`
- `auth_validated`
- `policy_denied`
- `reserved`
- `dispatch_queued`
- `dispatching`
- `execution_unknown`
- `executed_charge_succeeded`
- `executed_charge_failed`
- `cancelled_released`

### Worker task states

- `queued`
- `leased`
- `completed`
- `failed`

## Main Flows

### 1. Mandate issuance

1. Operator is authenticated through Supabase.
2. API validates the request payload.
3. Runtime validates agent existence and expiry.
4. Morph issue anchor is written.
5. Mandate transitions `draft -> issued_active`.
6. Audit and domain events are persisted.

### 2. Attempt creation and dispatch

1. Operator is authenticated.
2. Runtime validates amount, vendor, payment identifier, and mandate existence.
3. Policy checks run before any dispatch.
4. Treasury enforcement may run before reservation.
5. Budget is reserved.
6. Attempt transitions `reserved -> dispatch_queued`.
7. A dispatch worker task is enqueued.
8. Worker leases the task and transitions attempt `dispatch_queued -> dispatching`.
9. Vendor request is attempted through x402 payment flow.
10. Outcome becomes:
   - `executed_charge_succeeded`
   - `executed_charge_failed`
   - `execution_unknown`

### 3. Unknown execution reconciliation

1. Attempt becomes `execution_unknown`.
2. Reconciliation task is enqueued.
3. Reconciliation worker leases the task.
4. Worker queries vendor status by `paymentIdentifier` and/or `chargeReference`.
5. Attempt is finalized to `executed_charge_succeeded` or `executed_charge_failed`.
6. Reservation is released and consumed totals updated if successful.

## Failure Flows

### 1. Policy denial

- Attempt is persisted as `policy_denied`.
- No reservation is held.
- No worker dispatch occurs.

### 2. Dispatch start failure

- Attempt transitions to `cancelled_released`.
- Reservation is released.
- Worker task becomes `failed`.

### 3. Vendor timeout

- Attempt becomes `execution_unknown`.
- Reservation remains logically held until reconciliation finalizes truth.

### 4. Reconciliation retry

- Worker task is requeued with delay when correlation fails.
- After max attempts, worker task becomes `failed`.

## Invariants

1. One semantic payment attempt must map to one `paymentIdentifier`.
2. One active reservation per mandate is implied by `mandateCanReserve()` and `reservedCents === 0`.
3. Reservation must be held before charge-causing dispatch.
4. `execution_unknown` is unresolved until correlation finalizes it.
5. Worker tasks must reference an existing attempt and matching mandate.
6. `operatorId` and `correlationId` must survive enqueue and worker ownership transitions.
7. D1 must not become the authoritative ledger.

## Race Conditions and Consistency Risks

### 1. Public Worker control surface breaks execution ownership

The current Worker control API exposes public `POST /control/*` and `POST /queues/*` endpoints that forward privileged internal worker calls. This breaks the ownership model and allows unauthorized queueing/execution triggers.

### 2. Queue delivery is at-least-once

Cloudflare Queues can redeliver. The repo correctly uses `paymentIdentifier`, but the flow still depends on all charge-causing paths treating it as the hard idempotency fence.

### 3. Reconciliation stale-state dead end

`MAX_RECONCILIATION_ATTEMPTS = 3` exists, but there is no explicit production incident state or escalation object once retries are exhausted. A failed reconciliation task can become a terminal queue failure while the business incident remains under-modeled.

### 4. Durable Object and store authority mismatch

The Durable Object budget lock exists, but the current request/runtime path still treats the store as the budget ledger. That is acceptable for the current sprint only if the DO remains advisory/not yet authoritative. Mixing both without a single enforced write path would drift.

### 5. Lease expiry vs. duplicate work

Worker leases expire after 30 seconds. If execution or reconciliation is slow and the task is redelivered after expiry, correctness depends on the attempt state machine plus `paymentIdentifier` protecting downstream effects.

### 6. Revoke during unresolved attempt

Current behavior allows mandate revoke transitions, but the exact contract for `revoked` while an existing attempt is already `execution_unknown` is still ambiguous at the requirements level.

## Missing or Ambiguous Requirements

1. Whether `/api/system` is public, operator-only, or split into public/private views.
2. Whether fallback governance data is public or operator-only.
3. The exact stale reconciliation escalation contract after retries are exhausted.
4. The required operator-visible incident surface for failed worker reconciliation.
5. Expected behavior when a mandate is revoked while an unresolved attempt is still in flight.
6. Whether Worker control endpoints are intended to be internal-only, token-authenticated, or Cloudflare network-restricted.

## Flow Verdict

The behavioral model is mostly coherent and supports a narrow hardening wave, but it is not release-safe yet.

The highest-priority logic fix is to restore single-owner execution semantics by authenticating the Cloudflare Worker control plane and by preserving the internal/public boundary.

## Next Gate

Run `$vet`.

`$vet` should review the trust boundaries and convert the identified behavior risks into concrete security requirements, especially:

1. Worker control-plane authentication
2. `/api/system` and fallback data exposure
3. status endpoint protection for vendor reconciliation
4. secrets scanning and reproducible CI policy
