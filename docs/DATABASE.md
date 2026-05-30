# Database and migrations

## Canonical schema

The **canonical** Postgres schema lives in:

- `src/lib/db/schema.ts` (Drizzle table definitions)

Generate and apply migrations with Drizzle Kit:

```bash
pnpm db:generate   # emit SQL under drizzle/
pnpm db:migrate    # apply drizzle/ migrations to the target database
```

Production and hosted smoke flows should treat **`drizzle/` + `pnpm db:migrate`** as the migration source of truth.

## Runtime bootstrap (legacy compatibility)

The Next.js Postgres store still runs `db/migrations/*.sql` during `ensureSchema()` for environments that have not yet cut over to Drizzle-only applies. Those files are **compatibility mirrors**, not a second schema authority.

Do not add new production features by editing raw SQL under `db/migrations/` alone. Change `src/lib/db/schema.ts`, run `pnpm db:generate`, review the generated SQL in `drizzle/`, then migrate.

## Supabase operator boundary

Operator profile and treasury wallet rows are protected with Supabase RLS (`auth.uid() = auth_user_id`). Server bootstrap may use the direct Postgres pool for profile creation; routine operator reads/writes use the Supabase client with the operator JWT.

Internal worker routes remain on `MANDATE402_WORKER_TOKEN`, separate from operator session auth.

## Readiness

`GET /api/system` exposes `readiness.*` booleans (`postgresReady`, `operatorAuthReady`, `morphAnchoringReady`, `treasuryEnforcementMode`, `primaryVendorsReady`, `workerReady`, `fallbackExecutionEnabled`) plus machine-readable `degradedReasons`.
