# Hardening checklist (Mandate402)

Use this checklist when moving the system from **demo-tolerant** to **production-truthful**: fewer silent fallbacks, stronger authz, and verification that matches the risk of the change.

## How to use it

1. Pick the **phase** and **lane** that match your PR.
2. **Read** the listed `.agents/skills/<name>/SKILL.md` files *before* writing code (agents load skills by path; humans follow the same contract).
3. **Execute** the applicable `.cursor/commands/*` lenses, not just read them.
4. Complete the **verification** row for your lane (do not substitute `pnpm typecheck` for everything).
5. In the PR description, list **skills read**, **command lenses executed**, and **commands run** (per `.agents/skills/mandate402-test-harness/SKILL.md`).

## Global PR hygiene

- [ ] Listed every `.agents/skills/.../SKILL.md` consulted for the change.
- [ ] Listed every applicable `.cursor/commands/*` lens executed for the change (`ZSPS`, `trace`, `stress`, `security`, `sadpath`, `engineer`, `architect`, `ui` as applicable).
- [ ] No secrets, real keys, or `.env.local` in the diff (`AGENTS.md` security rules).
- [ ] If behavior crosses lanes (API + DB + worker + chain), read `.agents/skills/mandate402-backend/SKILL.md` first to route work.
- [ ] Verified all changed live routes/pages/components are **real**:
  - not fake
  - not stubbed
  - not canned
  - not layout-only unless explicitly downgraded
  - backed by real auth/runtime/store truth

## Verification commands (repo scripts)

| Step | Command | When |
|------|---------|------|
| Repo safety | `pnpm run check:repo-safety` | Always before merge-ready PRs |
| Formatter / lint (Biome) | `pnpm run check:biome` | TS/TSX/markdown/config touched |
| Unit + integration (Vitest) | `pnpm test` | Any `src/` logic, APIs, workers tests |
| Typecheck | `pnpm run typecheck` | Any TS change |
| ESLint | `pnpm exec eslint src next.config.ts eslint.config.mjs vitest.config.ts` | Per `ci:all` / local parity |
| Next build | `pnpm run build` | Release-bound or routing/layout/auth changes |
| Worker dry-run | `pnpm run workers:dry-run` | Worker config or `src/workers/` semantics |
| Cloudflare / OpenNext | `pnpm run cloudflare:dry-run` | Deploy packaging or `wrangler` config |
| Full local CI bundle | `pnpm run ci:all` | Before calling a branch “merge-ready” |

## Mandatory command-lens execution

Use the repo-local Cursor command files as mandatory validation lenses:

| Lens | When it is mandatory |
|------|-----------------------|
| `.cursor/commands/ZSPS.md` | Always for meaningful changes |
| `.cursor/commands/trace.md` | Page, route, component, worker, or data-flow changes |
| `.cursor/commands/stress.md` | Runtime, auth, worker, store, vendor, deploy-shape, or release-bound changes |
| `.cursor/commands/security.md` | Auth, token, secret, internal route, logging, path-handling, or release changes |
| `.cursor/commands/sadpath.md` | User flows, failure behavior, fallback behavior, or degraded-mode validation |
| `.cursor/commands/engineer.md` | Broad system changes, production hardening, or pre-push audits |
| `.cursor/commands/architect.md` | Ownership/boundary/deployment-shape changes |
| `.cursor/commands/ui.md` | Visual or product-surface changes |

If a lens is not applicable, document why in the PR or audit notes.

**Contract / chain / Go:** when you change `contracts/`, run Foundry tests from that tree (`forge test` or project script if added). When you change `main.go`, run Go tests for the vendor. The **mandate402-test-harness** skill requires not skipping these when those paths move.

---

## Phase 0 — Harness and honesty

- [ ] **Vitest / esbuild** — Local `pnpm test` runs clean (fix host/binary mismatch with aligned `esbuild` / clean install if needed). Skill: `.agents/skills/vitest/SKILL.md`, `.agents/skills/mandate402-test-harness/SKILL.md`.
- [ ] **No silent prod demo** — Environments that claim production do not rely on `demo_*` Morph anchors or unconfigured chain writes. Review `src/lib/modules/morph-anchor.ts` and env gates. Skills: `.agents/skills/mandate402-blockchain/SKILL.md`, `.agents/skills/mandate402-runtime-security/SKILL.md`, `.agents/skills/software-crypto-web3/SKILL.md`.

---

## Phase 1 — Identity, session, and Postgres truth

- [ ] **Supabase session vs operator authorization** — `ConsoleAuthGate` + `requireOperator` + `operator_profiles` / JWT `app_metadata.role` are consistent; new sign-ups are provisioned or documented as invite-only. Skills: `.agents/skills/mandate402-runtime-security/SKILL.md`, `.agents/skills/supabase-postgres-best-practices/SKILL.md`, `.agents/skills/mandate402-postgres-persistence/SKILL.md`.
- [ ] **Safe redirects** — `?next=` only accepts allowlisted console paths (`src/lib/auth/safe-operator-next-path.ts`). Skill: `.agents/skills/api-security-hardening/SKILL.md` (open-redirect class issues).
- [ ] **API contracts** — Public or operator routes have stable envelopes, Zod (or equivalent) validation, and route tests updated. Skill: `.agents/skills/mandate402-api-contracts/SKILL.md`.

---

## Phase 2 — x402, vendors, and money boundary

- [ ] **Facilitator vs vendor** — No vendor env points at Morph facilitator URLs; payment identifiers and `execution_unknown` semantics unchanged or ADR’d. Skills: `.agents/skills/mandate402-x402-payment-boundary/SKILL.md`, `.agents/skills/mandate402-backend-runtime/SKILL.md`.
- [ ] **Go vendor** — `main.go` signing, config, and status routes match production assumptions. Skill: `.agents/skills/mandate402-x402-vendor-go/SKILL.md`.
- [ ] **Oracles / settlement** — Pyth feeds, decimals, stale handling when amounts change. Skill: `.agents/skills/mandate402-oracle-settlement-assets/SKILL.md`.

---

## Phase 3 — Workers, queues, reconciliation

- [ ] **Worker auth and payloads** — Internal routes validate `MANDATE402_WORKER_TOKEN` (or successor); JSON bodies validated. Skills: `.agents/skills/mandate402-workers/SKILL.md`, `.agents/skills/mandate402-runtime-security/SKILL.md`.
- [ ] **Queues** — Dispatch / reconcile leases, retries, and failure visibility covered by tests where behavior changes. Skills: `.agents/skills/mandate402-workers/SKILL.md`, `.agents/skills/cloudflare-workers-testing/SKILL.md`.

---

## Phase 4 — Contracts and on-chain registry

- [ ] **Solidity** — Registry / treasury changes have Foundry coverage and deploy script parity. Skills: `.agents/skills/mandate402-contract-deploy-verify/SKILL.md`, `.agents/skills/web3-testing/SKILL.md`, `.agents/skills/mandate402-blockchain/SKILL.md`.

---

## Phase 5 — Operator console (UI/UX)

- [ ] **Console surfaces** — Match `mandate402-frontend` lane rules (tokens, scope, accessibility). Skills: `.agents/skills/mandate402-frontend/SKILL.md`, `.agents/skills/mandate402-accessibility-audit/SKILL.md`, `.agents/skills/mandate402-responsive-qa/SKILL.md`.
- [ ] **Visual polish / marketing** — Heavier design passes: `.agents/skills/frontend-design/SKILL.md`, `.agents/skills/ui-ux-pro-max/SKILL.md`, `.agents/skills/web-design-guidelines/SKILL.md`, `.agents/skills/co-star-ui/SKILL.md`, `.agents/skills/vercel-react-best-practices/SKILL.md` as appropriate.
- [ ] **UI tests** — Route-driven or Playwright smoke where user-visible policy or money flows change. Skills: `.agents/skills/mandate402-frontend-testing/SKILL.md`, `.agents/skills/playwright/SKILL.md`.

---

## Phase 6 — Security, architecture, and release

- [ ] **Security review pass** — For auth, payments, public endpoints: `.agents/skills/security-review/SKILL.md`, `.agents/skills/cc-skill-security-review/SKILL.md`, `.agents/skills/api-security-hardening/SKILL.md`.
- [ ] **Architecture record** — If boundaries move (demo vs prod, new service): `.agents/skills/architecture-decision/SKILL.md`, `.agents/skills/system-design/SKILL.md`.
- [ ] **Engineering bar** — Coupling, boundaries, YAGNI: `.agents/skills/core-engineering/SKILL.md`.
- [ ] **Type-level safety** — Only when types are the risk: `.agents/skills/typescript-best-practices/SKILL.md`, `.agents/skills/typescript-expert/SKILL.md`, `.agents/skills/typescript-advanced-types/SKILL.md`.
- [ ] **Acceptance matrix** — For PRD-sized scope: `.agents/skills/test-cases/SKILL.md`.
- [ ] **CI / release** — Workflow or semantic-release edits: `.agents/skills/mandate402-release-ci-safety/SKILL.md`.
- [ ] **Contributor clarity** — Env or setup churn: `.agents/skills/developer-onboarding/SKILL.md`.

---

## Maintenance

When a phase is completed for **production**, tick boxes in a tracking issue or epic; keep this file as the **canonical skill map** for hardening (update it when new first-party lanes or skills appear).
