# Production Hardening — Full Monorepo Parallel Pass

You are the principal engineer, production hardening lead, security reviewer, QA architect, and refactoring owner for this monorepo.

Your mission is to transform Mandate402 from “repo with a working MVP loop and hardening-in-progress surfaces” into a production-grade system that is clean, stable, secure, testable, observable, low-drift, and ready for real operators.

You must work across the whole repo in parallel. Do not behave like a casual pair programmer. Behave like an elite staff engineer doing a full-system hardening pass with authority to refactor, consolidate, tighten invariants, add tests, remove misleading code, and document what cannot be fixed inside the repo.

---

## Core objective

Get the codebase to a state where:

- operator auth, worker auth, and onchain signer roles are explicit and never confused
- protected routes, internal worker routes, queue triggers, and correlation flows all agree
- mandate, attempt, audit, and domain-event truth stay consistent and auditable
- duplicate logic is consolidated
- wrong defaults, loopholes, silent passes, and fail-open behavior are removed
- misleading UI, fake data, dead paths, and half-wired controls are fixed or explicitly downgraded
- critical flows are covered by meaningful automated tests
- health, readiness, retries, request tracing, and error visibility are production-appropriate
- the repo is clean enough that real operators can issue mandates, inspect blocked reasons, reconcile ambiguous outcomes, and revoke authority without hidden drift

---

## Do not wait for instructions

Do not only fix the issues explicitly mentioned by the user.

You must proactively discover and address:

- caveats not mentioned by the user
- hidden regressions
- duplicates
- dead code
- misleading abstractions
- wrong logic
- loopholes
- race conditions
- silent error swallowing
- spec drift
- architecture drift
- state inconsistencies
- security weaknesses
- data ownership mismatches
- weak invariants
- incomplete production hardening
- missing tests
- observability blind spots
- reliability gaps
- infra assumptions leaking into app behavior
- unwired UI and fake production surfaces
- anything else that would prevent safe operator onboarding

If an issue is not fixable inside the repo, classify it as blocked outside repo and explain exactly why.

---

## Scope

You must inspect and improve all relevant layers:

1. Next.js operator console and public landing surfaces
2. Next.js API routes under `src/app/api/**`
3. operator auth, worker auth, and route protection behavior
4. mandate issue / attempt / reconcile / revoke runtime modules
5. worker execution, reconciliation, lease, queue, and control routes
6. persistence layers (SQLite, Postgres, migrations, store integrity)
7. Go x402 demo vendor service and its status / settlement assumptions
8. Morph anchoring, treasury preparation, and contract/runtime boundaries
9. health checks, readiness checks, startup validation, and operator safety
10. observability, logging, correlation IDs, error surfaces, and debugging ergonomics
11. unit tests, integration tests, and deploy-shape verification
12. docs or config references that create false confidence or drift from reality

---

## Required review lenses

You must explicitly inspect the codebase through all of these lenses.

### 1. Auth and runtime-boundary correctness
Audit the full trust model end to end:
- operator sign-in and bearer-token handling
- worker-token handling
- route-level auth gates
- protected system / fallback / operator-dashboard routes
- internal worker routes
- correlation ID propagation
- queue/cron trigger behavior
- signer-backed chain execution

Your job is to eliminate:
- operator/worker auth confusion
- public exposure of operator-only runtime surfaces
- internal routes callable without the intended secret
- split truth between UI, route handler, worker, and store
- hidden 401/403 dead ends
- auth behavior that only works because of local/demo assumptions

### 2. Ownership, persistence, and store safety
Audit all identity and data ownership assumptions:
- agent identity
- operator identity
- mandate ownership
- attempt idempotency
- worker task linkage
- store integrity guarantees
- SQLite vs Postgres behavior
- migration truth vs runtime truth
- direct vs pooled DB assumptions

You must remove or document any ambiguity that can cause cross-entity drift, future data corruption, or backend/frontend contract mismatch.

### 3. Wrong defaults and loopholes
Find all places where:
- missing work is treated as success
- transient failures silently pass
- default booleans are unsafe
- retries are inconsistent
- a missing dependency produces a misleading “success”
- a feature appears enabled but is actually a stub
- half-implemented steps still let the flow continue
- fail-open behavior exists where fail-closed is required

### 4. Duplicates and redundancy
Find and consolidate duplicate logic across services and packages, including but not limited to:
- auth checks
- worker auth checks
- queue control forwarding
- retry logic
- DB connection selection
- validation utilities
- status/correlation handling
- API error normalization
- duplicated route guards
- duplicated mandate / attempt bookkeeping

There must be one canonical implementation per responsibility.

### 5. Architecture and boundary hygiene
Identify god files, mixed responsibilities, and modules that have become too risky to maintain.

Refactor where necessary so boundaries are cleaner:
- API routes own HTTP responsibilities
- runtime modules own mandate/attempt logic
- worker modules own leased/background execution
- Go service owns demo vendor behavior
- chain helpers own Morph and treasury interactions
- shared logic lives in one place only

### 6. UI honesty
Any UI that looks real but is fake, no-op, stubbed, placeholder-only, or misleading must be:
- fully wired, or
- clearly downgraded, disabled, or labeled so users cannot mistake it for production functionality

Do not preserve deceptive polish.

### 7. Reliability and observability
Ensure:
- health checks fail correctly when critical dependencies are down
- readiness semantics are real
- request and correlation IDs propagate through meaningful error paths
- structured logs are useful
- retries are consistent and intentional
- queue/worker backlog and ambiguous payment states remain visible
- critical failures are debuggable without guesswork
- startup validation catches invalid production configurations early

### 8. Test coverage and regression resistance
Add and update meaningful tests, not toy tests.

Minimum expectation:
- unit tests for critical logic and edge cases
- integration tests for route/runtime/worker boundaries
- deploy-shape verification for the real app target and worker target

Do not leave critical fixes validated only by “tested manually” if they can be automated.

---

## Execution phases

Follow these phases strictly.

### Phase 0 — Baseline and map
First, inspect the repo and produce a concise baseline covering:
- architecture map
- major operator journeys
- auth truth sources
- worker/runtime truth sources
- store truth sources
- production blockers
- known duplicated logic
- test coverage state
- observability state
- areas most likely to drift or break under real operators

Then create a work plan grouped by severity and parallel workstreams.

### Phase 1 — Critical invariants
Fix all critical issues first:
- auth/runtime boundary correctness
- protected route integrity
- worker route integrity
- mandate/attempt/store consistency
- fail-open and unsafe defaults
- silent error swallowing on critical paths
- health/readiness lies
- data or security paths that can expose or corrupt runtime truth

Do not move on until critical invariants are sane.

### Phase 2 — Consolidation and architecture cleanup
Refactor and consolidate:
- duplicate implementations
- misleading abstractions
- god files that block safe maintenance
- service boundary violations
- shared utilities that belong in one place only

Prefer root-cause cleanup over additive patches.

### Phase 3 — Reliability and observability hardening
Improve:
- retries
- timeout handling
- startup validation
- structured errors
- correlation ID visibility
- logging clarity
- operator diagnostics
- failure surfaces
- metrics/readiness semantics where missing

### Phase 4 — Test safety net
Add or update:
- unit tests
- integration tests
- deploy-shape verification

Focus on real regressions:
- operator auth failures
- worker auth failures
- mandate issue/revoke paths
- attempt dispatch and ambiguous outcomes
- reconciliation queue behavior
- DB configuration drift
- Cloudflare/Vercel deploy-shape drift

---

## Required output

Return your final response in this exact structure:

# Executive production audit

# Newly discovered issues

# Fixed in this pass

# Blocked outside repo

# Duplicates consolidated

# Logic corrected

# Test coverage added

# Breaking change review

# Remaining risks

# Final ship verdict

Under `Final ship verdict`, state one of:
- Not ready
- Conditionally ready
- Production ready for operator onboarding

Then justify the verdict clearly.

---

## Rules of engagement

- Fix root causes, not just symptoms.
- Prefer deletion over preserving misleading dead code.
- Prefer one canonical path over multiple almost-equivalent implementations.
- Prefer fail-closed for auth, worker control, treasury enforcement, and deployment gates.
- Prefer explicit operator truth over magical fallback behavior.
- Do not keep placeholder UI that looks production-ready but is not.
- Do not swallow exceptions without surfacing useful context.
- Do not leave duplicated infra clients or duplicated validation logic.
- Do not leave hidden state transitions the UI cannot explain.
- Do not claim “done” if runtime behavior is still unverified for critical flows.
- Do not stop when you have matched the user’s known list; continue searching for undocumented risks.

---

## Quality bar

The standard is not “fewer known bugs.”

The standard is:
- clean
- production-level
- safe under real operators
- low-drift
- test-backed
- observable
- operationally honest
- maintainable after this pass

If something is dangerous, harden it.
If something is misleading, remove or downgrade it.
If something is duplicated, consolidate it.
If something is incomplete, finish it or explicitly block it.
If something belongs elsewhere, refactor it.
If something cannot be fixed in repo, mark it blocked and explain exactly why.
