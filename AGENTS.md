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

- `docs/process/WORKFLOW.md`
- `docs/process/BRANCHING.md`
- `docs/process/LANES.md`
- `docs/process/AI-POLICY.md`
- `docs/process/LABELS.md`
- `docs/process/TEAM.md`


These are mandatory operating rules, not optional references.

### Production hardening and verification

For changes that tighten **authentication/authorization**, **persistence truth**, **x402/payment boundaries**, **chain anchoring**, **workers/queues**, or **release/CI safety**, follow **`docs/process/HARDENING-CHECKLIST.md`** and read the applicable **`.agents/skills/*/SKILL.md`** files it references before implementation.

### Mandatory AI-Agentic Augmented Development Standard

This repository uses an explicit **AI-agentic augmented development** model.
For every meaningful change such as:

- bug fix
- feature
- hot-fix
- refactor
- hardening pass
- release-prep change

the agent must execute the applicable repo-local command and skill surfaces, not merely read them.

#### Mandatory command surfaces

The command surfaces under `.cursor/commands/*` are operational lenses.
They must be treated as mandatory checklists when applicable to the change:

- `ZSPS.md`
  - always apply
  - remove slop, fake polish, placeholders, duplicate logic, and blind fixes
- `trace.md`
  - mandatory for page, route, component, worker, or data-flow changes
  - produce a real UI -> route -> module -> store/vendor/chain trace
- `stress.md`
  - mandatory for auth, runtime, worker, route, vendor, store, build, or deployment-shape changes
  - validate real execution and failure behavior
- `security.md`
  - mandatory for auth, secrets, internal routes, tokens, logging, path handling, x402, worker, or release changes
- `sadpath.md`
  - mandatory for user-facing flows, operational flows, and anything that can fail partially or silently
- `engineer.md`
  - mandatory for broad system changes, production hardening, or any pre-push readiness pass
- `architect.md`
  - mandatory when changing boundaries, ownership, deployment shape, or subsystem design
- `ui.md`
  - mandatory for visual/product surfaces
- `trace.md`
  - mandatory for proving whether a surface is truly wired

If a command surface is not applicable, say why in the working notes or final report.
Do not silently skip applicable command lenses.

#### Mandatory skill surfaces

The repo-local skills under `.agents/skills/*` are also mandatory when their scope matches the change.

At minimum:

- choose the matching Mandate402 lane skill before edits
- apply the matching overlay skills before verification

Examples:

- route / auth / persistence changes:
  - `mandate402-backend`
  - `mandate402-backend-runtime`
  - `mandate402-runtime-security`
  - `mandate402-test-harness`
- worker / reconciliation changes:
  - `mandate402-workers`
  - `mandate402-x402-payment-boundary`
  - `mandate402-test-harness`
- frontend / console changes:
  - `mandate402-frontend`
  - `mandate402-frontend-testing`
  - `mandate402-responsive-qa`
  - `mandate402-accessibility-audit`
- blockchain / treasury changes:
  - `mandate402-blockchain`
  - `mandate402-oracle-settlement-assets`
  - `software-crypto-web3`
- release / CI / deployment-shape changes:
  - `mandate402-release-ci-safety`
  - `mandate402-test-harness`

#### Mandatory post-change checklist

After implementation and before declaring completion, the agent must:

1. run the applicable `.cursor/commands/*` lenses
2. run the applicable `.agents/skills/*` verification guidance
3. verify that changed routes, pages, and components are:
   - real
   - wired
   - using actual runtime/store/auth truth
   - not stubbed
   - not fake
   - not layout-only unless explicitly downgraded and labeled
4. clean generated artifacts from repo-visible temp/build directories before repo-safety and lint checks
5. run the relevant verification commands
6. report findings first, then fixes, then residual risks

#### Mandatory pre-PR checklist

Before opening or updating a PR, the agent must perform an applicability pass across:

- `.cursor/commands/*`
- `.agents/skills/*`

and execute all relevant checks needed to prove:

- routes are protected or public by design
- pages are real and not deceptive
- components are not partial or dead mock surfaces
- runtime/module/store ownership is consistent
- fallback behavior is explicit and fail-closed
- build/CI/repo-safety are clean

#### Release prohibition

Do not allow any release-candidate branch, PR, or push-ready state to contain:

- fake operator data in a live route
- canned or hardcoded runtime panels presented as live truth
- stubbed controls that look executable
- placeholder logic behind a production-looking page
- public runtime routes that should be operator-only or worker-only
- generated build artifacts left in tracked or repo-visible temp directories

If a surface cannot be made real yet, it must be:

- removed from the live route tree, or
- explicitly downgraded so it cannot be mistaken for production functionality

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
- Do not work directly on `development`.
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

`main` remains the release-authoritative branch.
`development` is the protected integration branch for normal team work.

All implementers must keep their ownership branch current with `development`.

Required sync moments:

- before starting work for the day
- before opening a PR
- after `development` changes in a related lane
- after a branch sits stale during active work

Use:

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch <branch>
git rebase origin/development
```

Avoid implicit merge-commit syncs from plain `git pull` on feature branches.

### Frontend Lane Rule

Frontend ownership is intentionally split:

- Sherwin = design authority
- John = transactional frontend
- Edward = observability / presentation frontend
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
- Ownership branches must be synced from latest `development` before final review unless Justine explicitly waives that requirement.
- Promotion from `development` to `main` is the normal path to release-authoritative history.

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

For `development`, maintain:

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

## Learned User Preferences

- Treat obvious decorative gradients and template-heavy marketing chrome as unacceptable; the user explicitly calls that out as “AI slop” and wants it removed or avoided.
- Keep global and component colors aligned with `docs/brand/brandkit.md`, `docs/brand/design-tokens.md`, and the official logo or header SVG palette under `public/images/`; if docs and the live UI drift from the logomark, reconcile tokens and documentation to the logo rather than inventing new greens.
- Shape the landing page as a full-viewport, two-column split and follow the ASCII layout and content bounds in `docs/adr/ADR-0002-sherwin-ui-wireframe-task.md` (including roughly lines 76–93 for hero-adjacent blocks), keeping marketing copy restrained and on-brief rather than loud or generic.
- When using other projects only as inspiration, borrow layout geometry (viewport split, padding, margins, positioning), not their visual style, assets, or decorative effects.
- Keep the signed-out home experience a marketing surface rather than turning it into a lightweight operator console shell after sign-in, unless product scope explicitly changes.
- For operator chrome that sits beside primary actions (for example the desktop sidebar next to `bg-mandate-green` CTAs), keep the green read consistent with brand tokens so structural surfaces do not look like a different palette from core buttons.
- Responsive layout and sizing across major breakpoints is treated as an explicit near-term product obligation (called out around v0.1.1), not an afterthought once desktop polish is done.

## Learned Workspace Facts

- Canonical visual references for Mandate402 UI work include `docs/brand/brandkit.md` for palette and tokens and `docs/adr/ADR-0002-sherwin-ui-wireframe-task.md` for the landing and console wireframe intent.
- Primary operator console and marketing surfaces are implemented in the Next.js app under `src/` (for example app routes, layout, and shared components such as the sidebar and landing sections).
- The Sherwin UI ADR references logo assets under `public/images/` (for example `Mandate402_logo.svg` alongside marks such as `mandate_header.svg`); use those paths when checking placement and color read against wireframes.
- Forest and mint greens used in `public/images/mandate_header.svg` are anchored around `#346F2A` and `#91D186`; control-room teal is a separate band color from logomark fills unless brandkit explicitly ties them.
- On Windows with Git Bash, avoid creating a repo-root `nul` file via `> nul` redirection; prefer `> /dev/null` so Turbopack does not choke on an accidental `nul` entry while processing CSS.
- Prefer `pnpm exec wrangler` from the repo root when global Wrangler installs under fnm hit shim conflicts such as `EEXIST` or `EPERM`.
- Run the local Next.js operator console with `pnpm dev` from the repo root when the user asks for the frontend dev server.
