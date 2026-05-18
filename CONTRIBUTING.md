# CONTRIBUTING.md

This repository is strict internally, but we still want public contributors to have a clear, approachable path into the project.

If you are a new contributor, start here first:

1. [README.md](./README.md)
2. [docs/OPEN-SOURCE-ONBOARDING.md](./docs/OPEN-SOURCE-ONBOARDING.md)
3. [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
4. [docs/CONTRIBUTION-TYPES.md](./docs/CONTRIBUTION-TYPES.md)
5. [docs/FIRST-PR.md](./docs/FIRST-PR.md)
6. [docs/SUPPORT.md](./docs/SUPPORT.md)

If you are a core team member or an autonomous coding agent, treat the rest of this file as a required execution protocol, not optional guidance.

## Mandatory Read Order

Before changing any file, read these in this exact order:

1. [AGENTS.md](./AGENTS.md)
2. [README.md](./README.md)
3. [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)
4. [`.github/BRANCH_PROTECTION.md`](./.github/BRANCH_PROTECTION.md)

Then read the lane-specific files you are about to touch:

- App / API lane:
  - [src/lib/modules/mandates.ts](./src/lib/modules/mandates.ts)
  - [src/lib/modules/payments.ts](./src/lib/modules/payments.ts)
  - [src/lib/domain/types.ts](./src/lib/domain/types.ts)
- Contract lane:
  - [contracts/src/Mandate402Treasury.sol](./contracts/src/Mandate402Treasury.sol)
  - [contracts/src/MandateRegistry.sol](./contracts/src/MandateRegistry.sol)
  - [contracts/test/Mandate402Treasury.t.sol](./contracts/test/Mandate402Treasury.t.sol)
- Go x402 vendor lane:
  - [main.go](./main.go)
  - [agent-sdk/agentSimulator.js](./agent-sdk/agentSimulator.js)

Do not start coding before reading the above.

## Mandatory First Commands

Run these before making changes:

```bash
pnpm install
pnpm check:repo-safety
pnpm check:release-readiness
pnpm test
pnpm typecheck
pnpm exec eslint src next.config.ts eslint.config.mjs vitest.config.ts
pnpm check:biome
cd contracts && FOUNDRY_CACHE_PATH=cache FOUNDRY_OUT=out forge test
cd .. && GOCACHE=$(pwd)/.tmp/go-build-cache GOTMPDIR=$(pwd)/.tmp/go-tmp go test ./...
```

If any of these are already failing, your first task is to understand whether:

- the failure is pre-existing
- your branch/environment caused it
- the repo is in an invalid local state

Do not bury existing failures under unrelated edits.

## Mandatory Contribution Flow

Every contribution must follow this order:

1. Read the required files.
2. Run the mandatory first commands.
3. Narrow scope to one lane or one coherent multi-lane change.
4. Make the smallest correct change.
5. Add or update tests if behavior changes.
6. Re-run verification.
7. Check repo safety and release readiness again.
8. Only then stage, commit, and propose the change.

If you skip steps, the contribution is incomplete.

## Scope Rules

Keep changes lane-aware:

- `src/` = Next.js operator console and policy runtime
- `contracts/` = Solidity treasury and registry
- `main.go` / `agent-sdk/` = x402 merchant and client simulation
- `.github/workflows/` = CI/CD and release automation

Do not mix unrelated refactors across lanes unless the change truly spans them.

## Mandatory System Semantics

All contributors must preserve these invariants:

- facilitator != vendor
- vendor != treasury
- oracle != settlement
- `execution_unknown` is unresolved until correlation proves final truth
- reservation stays held until reconciliation completes
- `paymentIdentifier` collisions with different semantics must fail
- runtime-critical files must not depend on ignored local planning or orchestration state

If your change weakens any of these, it is wrong.

## Tests and Verification

### Minimum verification for app/API changes

```bash
pnpm test
pnpm typecheck
pnpm exec eslint src next.config.ts eslint.config.mjs vitest.config.ts
pnpm check:biome
```

### Minimum verification for contract changes

```bash
cd contracts
FOUNDRY_CACHE_PATH=cache FOUNDRY_OUT=out forge test
```

### Minimum verification for Go merchant changes

```bash
GOCACHE=$(pwd)/.tmp/go-build-cache GOTMPDIR=$(pwd)/.tmp/go-tmp go build -buildvcs=false .
GOCACHE=$(pwd)/.tmp/go-build-cache GOTMPDIR=$(pwd)/.tmp/go-tmp go test ./...
```

### Full repo verification before push

```bash
pnpm check:repo-safety
pnpm check:release-readiness
pnpm check:biome
pnpm test
pnpm typecheck
pnpm exec eslint src next.config.ts eslint.config.mjs vitest.config.ts
cd contracts && FOUNDRY_CACHE_PATH=cache FOUNDRY_OUT=out forge test
cd .. && GOCACHE=$(pwd)/.tmp/go-build-cache GOTMPDIR=$(pwd)/.tmp/go-tmp go test ./...
```

Do not claim success without actual command results.

## Mandatory Safety Rules

Never commit:

- `.env.local`
- `internal/dont push.txt`
- private keys
- Morph x402 HMAC credentials
- live provider API keys
- `.next/`
- `.tmp/`
- `contracts/out`
- `contracts/cache`
- `contracts/broadcast`
- local binaries
- local data snapshots

Always run:

```bash
pnpm check:repo-safety
```

before staging or pushing.

## Mandatory Release Discipline

Before anything is merged to `main`:

- all required CI checks must pass
- release readiness must pass
- release notes / changelog must still be accurate

Always run:

```bash
pnpm check:release-readiness
```

If the contribution is release-worthy, create a changeset:

```bash
pnpm changeset
```

If release automation is touched, dry-run it:

```bash
pnpm release:dry-run
```

## Merge Gate

No merge is acceptable unless all required checks are green:

- `CI / app`
- `CI / contracts`
- `CI / go`
- `API Smoke / smoke`

If any required check is red, do not merge.

## PR / Change Description Format

Every PR or proposed change should state:

1. what problem it solves
2. which lane(s) it touches
3. what invariants it preserves
4. what commands were run
5. what remains external or unverified

If the write-up lacks verification evidence, it is incomplete.

## Agent-Specific Rule

If you are an autonomous coding agent:

- do not improvise workflow rules
- do not skip mandatory reads
- do not skip mandatory commands
- do not trade safety for speed without explicit instruction
- do not hide external blockers behind fake local success

Local success is not the same as external integration proof.

## Final Rule

When in doubt:

- read [AGENTS.md](./AGENTS.md) again
- follow the smallest safe path
- verify before claiming done
