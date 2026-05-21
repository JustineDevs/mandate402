# DB, Security, and Ops Reference

## Pooling Guidance

Runtime URLs:

- `MANDATE402_DATABASE_URL`
- `DATABASE_URL`

Schema/direct URLs:

- `MANDATE402_DATABASE_DIRECT_URL`
- `DATABASE_DIRECT_URL`

## Security Rules

- auth must fail closed
- worker auth must stay separate from operator auth
- no silent degraded runtime
- no leaked secrets in repo

## Verification

Run as relevant:

- `pnpm exec vitest run ...`
- `pnpm typecheck`
- `pnpm exec eslint ...`
- `pnpm build`
- `pnpm check:repo-safety`
- `pnpm check:release-readiness`
