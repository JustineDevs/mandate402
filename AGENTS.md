# AGENTS.md

This file is the strict operating contract for the `JustineDevs/mandate402` repository.

It applies to the entire repository unless a deeper `AGENTS.md` overrides a narrower scope.

## Mission

Mandate402 is a Morph-native governance and treasury control layer for x402 machine commerce.

The repository must remain:

- technically correct
- security-conscious
- release-safe
- public-remote-safe
- reproducible in CI

## Core Principles

1. Preserve the system boundary:
   - **facilitator** = payment infrastructure
   - **vendor** = paid service endpoint
   - **Mandate402** = policy + treasury guardrail layer
   - **oracle** = fiat value reference
2. Prefer explicit state machines over implicit behavior.
3. Treat `execution_unknown` as unresolved until correlation proves final truth.
4. Keep secrets, credentials, and generated artifacts out of the public remote.
5. Do not merge anything that fails local verification or required CI checks.

## Repository Shape

Primary lanes:

- `src/` = Next.js operator console, APIs, policy runtime
- `contracts/` = Solidity treasury and registry contracts
- `main.go` = local Go x402 merchant / demo vendors
- `agent-sdk/` = client simulation helpers
- `.github/workflows/` = CI / release / verification / smoke automation

## Strict Do / Don't

### Do

- Use environment variables for all secrets and deployment-specific values.
- Keep runtime-critical files under tracked repo paths.
- Keep `.omx/` for local planning/orchestration only.
- Add tests for behavioral changes, especially around policy, reconciliation, or treasury accounting.
- Keep changes small, reviewable, and reversible where possible.
- Use `lefthook` as the Git hook manager.
- Keep `CHANGELOG.md`, release metadata, and deployment docs consistent with reality.

### Don't

- Do not commit `.env.local`.
- Do not commit private keys, API secrets, or Morph x402 HMAC credentials.
- Do not commit contract cache/output/broadcast artifacts.
- Do not commit local build outputs such as `.next/`, local binaries, temp dirs, or data snapshots.
- Do not add `husky` alongside `lefthook`.
- Do not point vendor envs at the Morph facilitator URLs.
- Do not mark unknown payment attempts as reconciled before correlation.
- Do not bypass CI by merging failing branches.

## Security Rules

Secrets that must never appear in committed files:

- `MORPH_PRIVATE_KEY`
- `MANDATE402_DEPLOYER_PRIVATE_KEY`
- `MORPH_X402_ACCESS_KEY`
- `MORPH_X402_SECRET_KEY`
- real `CMC_API_KEY`
- real `COINAPI_KEY`
- any other production or testnet wallet secret

If a secret is ever committed:

1. rotate it immediately
2. remove it from tracked files
3. update docs to avoid reintroducing it

## Runtime / System Design Rules

### Idempotency

- `paymentIdentifier` must be unique per semantic payment attempt.
- Reuse of an existing `paymentIdentifier` with different semantics must fail.
- Correlation logic must rely on stable identifiers, not UI guesswork.

### Event-Driven Behavior

- Critical transitions must emit both:
  - human-readable audit entries
  - structured domain events
- Domain events must be persisted in the tracked runtime store.

### Database / Store Discipline

Current persistence is lightweight, but the code must still behave as if data were normalized:

- agents are first-class entities
- mandates reference agents via `agentId`
- attempts reference mandates and vendors
- fallback gate is a tracked config artifact, not hidden orchestration state

### Distributed Systems Discipline

- `execution_unknown` means payment truth is unresolved.
- Reservation must remain held until correlation completes.
- Reconciliation must fetch vendor truth; it must not accept caller-supplied final outcome data.

### Observability

- Mutating API routes must propagate a `correlationId`.
- Important route actions should emit structured logs.
- System status must be introspectable via `GET /api/system`.

## Workflow Rules

### Before Commit

Run:

```bash
pnpm check:repo-safety
pnpm check:biome
pnpm test
pnpm typecheck
pnpm exec eslint src next.config.ts eslint.config.mjs vitest.config.ts
cd contracts && FOUNDRY_CACHE_PATH=cache FOUNDRY_OUT=out forge test
cd .. && GOCACHE=$(pwd)/.tmp/go-build-cache GOTMPDIR=$(pwd)/.tmp/go-tmp go test ./...
```

If code paths changed materially, also run:

```bash
go build -buildvcs=false .
pnpm check:release-readiness
```

### Before Push

The following must be true:

- `pnpm check:repo-safety` passes
- `pnpm check:release-readiness` passes
- all relevant tests pass
- no secret or artifact files are staged

### Before Merge

**All required CI must pass first.**

Minimum required checks:

- `CI / app`
- `CI / contracts`
- `CI / go`
- `API Smoke / smoke`

No merge to `main` unless all required checks are green.

## CI / Release Rules

- `semantic-release` is the release engine.
- `changesets` are used to record release-worthy change intent.
- Release automation must run from `main` only.
- GitHub Releases should reflect actual deployed contract metadata when available.
- Contract verification should use the Morph explorer workflow or the documented manual command.

## Branch Protection

For `main`, maintain:

- PR required before merge
- at least 1 approval
- stale approvals dismissed on new commits
- required status checks
- no force-push for non-maintainers
- no direct merge with failing CI

## PR Expectations

Every PR or review-ready change should include:

1. problem statement
2. what changed
3. verification run
4. deployment or credential assumptions
5. any remaining external blockers

## Public Remote Safety

Tracked repo content should include:

- source
- contracts
- tests
- workflows
- documentation
- public deployment metadata

Tracked repo content should not include:

- local env files
- internal notes
- build output
- temporary caches
- deployment cache/broadcast artifacts

## Allowed Tooling Choices

Preferred and already accepted:

- `lefthook`
- `biome`
- `changesets`
- `semantic-release`
- `renovate`
- `pre-commit`
- `act`
- `.devcontainer`

Avoid adding overlapping alternatives unless replacing the current standard intentionally.

## Final Rule

If there is any tension between:

- “ship fast”
- “ship safely”

choose the smallest change that preserves correctness, CI, and public-remote safety.
