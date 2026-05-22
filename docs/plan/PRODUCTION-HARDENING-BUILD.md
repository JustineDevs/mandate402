# Production Hardening Build Decision

This document captures the `$build` gate for Mandate402's production hardening path.

## Current Readiness Verdict

The repository is **not release-ready**.

It is, however, **implementation-complete for the approved in-repo hardening slices**.

Current gate status:

- `idea_status = CLEAR`
- `architecture_status = APPROVED`
- `evidence_status = VERIFIED`
- `logic_status = GREEN`
- `security_status = RED`
- `experience_status = GREEN`

That means:

- do **not** approve ship/release yet
- do treat the current in-repo hardening wave as implemented and verified

## Blockers That Still Prevent Release

1. Working tree and branch state remain dirty/stale for release hygiene.
2. No linked production-hardening issue was found in repo-local evidence.
3. Live Supabase, Postgres, Cloudflare, Morph signer, x402 credentials, and deployment secrets still require external validation.

## Implemented Slice

The approved build slices are now implemented:

1. Worker control-plane authentication
2. Protected `/api/system` and `/api/fallback-gate`
3. Shared-token UX removal
4. Dependency and CI hardening
5. Protected operator workspace and incident visibility

## Branch / Worktree Suggestion

Current branch state is already heavily dirty and contains unrelated work.

Recommended next working branch/worktree:

If release work continues, use a fresh cleanup/release-prep branch rather than stacking more unrelated changes onto the current dirty branch.

## Test and Verification Expectations

Verification already completed for the in-repo slices:

1. `pnpm check:repo-safety`
2. `pnpm check:biome`
3. `pnpm audit --prod --json`
4. `go run golang.org/x/vuln/cmd/govulncheck@latest ./...`
5. `pnpm test`
6. `pnpm typecheck`
7. `pnpm exec eslint src next.config.ts eslint.config.mjs vitest.config.ts`
8. `pnpm build`
9. `pnpm workers:dry-run`
10. `go test ./...`
11. `go build -buildvcs=false .`
12. `forge test`

## Exact Next Step

The next step is not another product code slice.

The next step is release-prep hygiene and external validation:

1. clean/scope the branch and worktree
2. link the hardening work to an issue/PR trail
3. validate live Supabase/Postgres/Cloudflare/Morph/x402 deployment inputs
4. decide whether the remaining non-repo blockers are acceptable for release

## Build Verdict

The approved hardening slices are implemented and verified.

Release lane remains blocked until:

- experience goes green or is explicitly waived
- external deployment/configuration prerequisites are validated
- release hygiene requirements are satisfied
