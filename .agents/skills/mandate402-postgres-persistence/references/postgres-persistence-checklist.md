# Postgres Persistence Checklist

Supabase URL model:

- runtime URL: transaction pooler compatible
- direct URL: schema/migration/admin operations only
- SSL behavior must remain explicit and Supabase compatible

Data integrity:

- mandates reference known agents
- attempts reference known mandates and vendors
- worker tasks reference known mandates and attempts
- payment identifiers remain semantically unique
- reserved and consumed budget math must not drift
- domain events must not reference missing entities

Concurrency:

- keep transactions short
- avoid route-owned long-running vendor calls
- use worker task leases for dispatch and reconciliation ownership
- preserve idempotency for duplicate API retries

Verification:

- `src/lib/__tests__/store-integrity.test.ts`
- `src/lib/__tests__/store-production.test.ts`
- focused Postgres adapter tests when present
- `pnpm typecheck`
