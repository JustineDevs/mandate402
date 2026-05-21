---
name: mandate402-x402-payment-boundary
description: Load when changing Mandate402 x402 payment attempts, vendor dispatch, facilitator separation, payment identifiers, receipts, execution_unknown, status correlation, or reconciliation truth.
---

# Mandate402 x402 Payment Boundary

## Read First

- `README.md`
- `docs/SYSTEM_DESIGN.md`
- `src/lib/modules/payments.ts`
- `src/lib/infrastructure/x402-client.ts`
- `references/x402-boundary-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify facilitator, vendor, treasury, worker, and receipt responsibilities
- list identifiers used for idempotency and correlation
- decide whether the request path, worker, or vendor status endpoint owns the next action

### 2. Validate

- facilitator URLs are never treated as paid vendor URLs
- `paymentIdentifier` semantics remain stable
- `execution_unknown` stays unresolved until vendor correlation proves truth
- receipt evidence links to the attempt and vendor result

### 3. Execute

Keep policy and treasury checks before vendor dispatch, and keep dispatch/reconciliation worker-owned.

### 4. Verify

Run payment, mandate flow, execution worker, and route tests after boundary changes.

## Gotchas

- do not release reservations on timeout without correlation
- do not let UI labels imply final payment truth while status is unknown
- do not let fallback behavior hide vendor/facilitator configuration mistakes
