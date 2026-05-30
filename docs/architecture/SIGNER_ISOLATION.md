# Signer Isolation

This document explains the security architecture regarding the separation of Operator Authority and Signer Authority in Mandate402.

## Architectural Separation

Mandate402 enforces a strict boundary between the identity that *authorizes* an action and the identity that *executes* the transaction on-chain.

### 1. Operator Authority (Authorization)
- **Identity:** Human operators or administrative systems.
- **Authentication:** Supabase Auth (JWT/Session).
- **Responsibility:** Operators interact with the dashboard to review, approve, or reject settlement requests.
- **Persistence:** Approvals are recorded in the PostgreSQL database (managed by Supabase/Drizzle) with an audit trail of which operator performed the action.
- **Scope:** Cannot directly sign blockchain transactions. They only modify the state of the system within the database.

### 2. Signer Authority (Execution)
- **Identity:** The Settlement Worker.
- **Secret Management:** Controlled via the `MORPH_PRIVATE_KEY` environment variable.
- **Responsibility:** The worker polls the database for "Approved" settlements that are ready for execution.
- **Execution:** Once an approved settlement is found, the worker uses the `MORPH_PRIVATE_KEY` to sign and broadcast the transaction to the Morph network.
- **Scope:** Does not have administrative access to the database or the ability to "approve" its own tasks. It only executes what has been authorized in the database.

## Workflow Summary

1. **Request:** A payment request is created.
2. **Approval:** An Operator (authenticated via Supabase JWT) reviews the request and marks it as `APPROVED` in the database.
3. **Detection:** The Settlement Worker (running in a secure environment) detects the `APPROVED` record.
4. **Signing:** The Worker uses `MORPH_PRIVATE_KEY` to sign the transaction.
5. **Settlement:** The transaction is submitted to the chain.

## Security Benefits

- **Credential Isolation:** Operators never handle the private key used for chain writes.
- **Auditability:** Every on-chain action can be traced back to a specific database approval by an authenticated operator.
- **Reduced Attack Surface:** Compromising an operator account allows for approval of requests but does not grant direct access to the private key. Conversely, the private key is only usable for transactions that have been properly authorized in the database.
