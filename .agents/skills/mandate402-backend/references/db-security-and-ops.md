# DB, Security, and Ops Reference

Use this file when the task needs concrete backend operational rules.

## Database Posture

- live runtime is Postgres-first
- SQLite is test-only
- live runtime must not silently use in-memory state
- worker task durability should be explicit when worker ownership exists

## Pooling Guidance

Runtime traffic:

- `MANDATE402_DATABASE_URL` / `DATABASE_URL`
- should be safe for pooled runtime traffic such as Supabase transaction pooler usage

Schema or direct operations:

- `MANDATE402_DATABASE_DIRECT_URL` / `DATABASE_DIRECT_URL`

## Traffic Assumptions

Assume:

- read-heavy dashboards and audit views
- bursty writes on attempts, events, and worker tasks
- retry amplification during vendor degradation
- queue growth under unresolved reconciliation

## Security Rules

Never allow:

- silent auth fallback
- fake success states
- hidden degraded runtime
- operator and worker auth conflation
- implicit trust in user-provided final payment truth

## CI/CD and Verification

Backend changes should remain compatible with:

- `pnpm check:repo-safety`
- `pnpm exec biome check ...`
- `pnpm exec eslint ...`
- `pnpm typecheck`
- `pnpm build`
- `go test ./...` if touching `main.go`

Use release-safe behavior by default. If a slice changes auth, infra, contracts, workers, or runtime semantics, verification must be stronger, not lighter.
