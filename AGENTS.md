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
- Keep local planning/orchestration state out of runtime-critical tracked behavior.
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

### Mandatory Orchestration Model

All meaningful work in this repository must follow the tracked workflow documents:

- `docs/WORKFLOW.md`
- `docs/BRANCHING.md`
- `docs/LANES.md`
- `docs/AI-POLICY.md`
- `docs/LABELS.md`
- `docs/TEAM.md`

These are mandatory operating rules, not optional references.

### Issue-First Rule

Do not begin meaningful implementation without a tracked issue or equivalent scoped work item.

Every meaningful issue must define:

- problem
- goal
- owner
- lane
- acceptance criteria
- out of scope

### Branch and Worktree Rule

- Do not work directly on `main`.
- One issue must map to one branch.
- One branch should map to one worktree when parallel work is active.
- Do not stack unrelated work in one branch.

Recommended branch forms:

- `feat/<issue>-<slug>`
- `fix/<issue>-<slug>`
- `docs/<issue>-<slug>`
- `ui/<issue>-<slug>`
- `chore/<issue>-<slug>`

### Sync Rule

All implementers must keep their ownership branch current with `main`.

Required sync moments:

- before starting work for the day
- before opening a PR
- after `main` changes in a related lane
- after a branch sits stale during active work

Use:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch <branch>
git rebase origin/main
```

Avoid implicit merge-commit syncs from plain `git pull` on feature branches.

### Frontend Lane Rule

Frontend ownership is intentionally split:

- Sherwin = design authority
- Edward = transactional frontend
- John = observability / presentation frontend
- Justine = final integration / release authority

Edward and John must not silently co-own the same screen or feature surface by default.

Shared frontend primitives must be centralized and reused:

- cards
- badges
- tables
- pills
- form controls
- layout shells

### AI Scope Rule

AI-assisted work must remain inside the assigned issue scope and lane scope.

AI must not silently widen:

- auth
- infra
- contracts
- release workflows
- runtime semantics

without explicit authority from the tracked scope documents.

### Review Rule

- No direct merge to `main`.
- No PR without a linked issue.
- No frontend implementation without Sherwin handoff when visual changes are involved.
- No AI-generated high-risk change may merge without human review.
- No merge to `main` until all required workflows are green.
- `main` is the only release-authoritative branch.
- Release tags and release notes are automation-owned artifacts from `main`.
- Every meaningful change must originate from its own ownership branch and land through PR.
- Branches must be synced from latest `main` before final review unless Justine explicitly waives that requirement.

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
- squash merge by default

## PR Expectations

Every PR or review-ready change should include:

1. problem statement
2. what changed
3. verification run
4. deployment or credential assumptions
5. any remaining external blockers
6. linked issue
7. owner lane
8. AI usage note when AI assisted the change

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
