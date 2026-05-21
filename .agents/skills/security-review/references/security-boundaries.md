# Mandate402 Security Boundaries

- API and auth: server-side validation, authorization, correlation IDs, no stack traces in public responses.
- Database: pooler-compatible access, least privilege, migrations reviewed with Postgres constraints.
- Payment and x402: stable identifiers, idempotency, vendor truth correlation, no caller-supplied final truth.
- Workers: leases, retries, reconciliation ownership, no duplicate state transitions.
- Morph and contracts: curated ABI, network registry, contract registry, signer readiness, RPC health, no private keys in repo.
- Release: repo-safety, CI, no generated artifacts, no local orchestration state in public remote.
