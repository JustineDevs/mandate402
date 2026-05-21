---
name: mandate402-postgres-persistence
description: Load when changing Mandate402 Postgres, Supabase pooler/direct URLs, migrations, store integrity, locking, transactions, read/write scaling, or persistence tests.
---

# Mandate402 Postgres Persistence

## Read First

- `db/migrations/0001_store.sql`
- `src/lib/infrastructure/postgres-store.ts`
- `src/lib/infrastructure/store-integrity.ts`
- `references/postgres-persistence-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify schema, runtime store, migration, and test impact
- decide whether the change is pooler-safe in Supabase transaction pooling
- list concurrency, retry, and integrity assumptions before editing

### 2. Validate

- live runtime remains Postgres-first
- schema/direct URL usage is not confused with runtime pooler usage
- uniqueness and referential rules are enforced in code and schema where possible
- store integrity remains strict on read/write

### 3. Execute

Preferred order:

1. migration/schema contract
2. TypeScript store types
3. Postgres adapter behavior
4. integrity checks
5. store and route tests

### 4. Verify

Run store integrity and production persistence tests before broader type/build checks.

## Gotchas

- do not use session-only assumptions with a transaction pooler
- do not hide inconsistent persisted data by silently repairing on read
- do not weaken fail-closed production persistence to simplify local setup
