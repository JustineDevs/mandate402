# Production Hardening DX/UX Review

This document captures the `$vibe` gate for Mandate402's production hardening path.

## Developer Workflow Risks

### 1. The public site and the protected operator experience are still split awkwardly

The public homepage is now marketing-safe and no longer leaks operational state or teaches the old shared-token flow. That is correct for security, but the authenticated operator dashboard/session flow is still not implemented as a coherent first-class experience.

**Why this matters**

- The public surface is now safer, but the operator path is still incomplete.
- Reviewers can no longer confuse demo auth with production auth, but operators still do not have a polished session-backed workspace.

### 2. Too many runtime surfaces still exist behind the scenes

Today the repo exposes:

- Next.js operator UI
- internal worker routes
- Cloudflare Worker control endpoints
- Go vendor status endpoints
- `/api/system`
- `/api/fallback-gate`

That is acceptable for engineering iteration, but not all of those surfaces should feel public or operator-facing.

**Why this matters**

- More surfaces mean more places where developers must remember hidden trust rules.
- It increases onboarding cost and makes production behavior harder to reason about.

### 3. CI/install behavior is not yet confidence-building

Using `pnpm install --frozen-lockfile=false` in CI makes the system feel less deterministic to contributors and reviewers.

**Why this matters**

- It weakens confidence that the same code will verify the same way later.
- It adds avoidable drift during onboarding and release review.

## User Workflow Risks

### 1. Operator observability is now protected, but still under-shaped

`/api/system` and fallback data are now operator-only. That closes the public exposure problem, but the operator observability surface is still not shaped into a clean incident-oriented workflow.

**Operator friction**

- operators need trustworthy incident/status views
- operators still need clearer action-oriented guidance from those protected views

### 2. Reconciliation outcomes are not operator-clear when retries are exhausted

The flow documents a terminal failed worker task after repeated reconciliation failures, but there is no clear operator-facing incident state described yet.

**Operator friction**

- an operator needs one unambiguous answer to “what needs manual attention right now?”
- a failed background task is not the same thing as an operator-ready incident concept

### 3. Revoke while unresolved is not operationally explained

The backend state model allows revoke transitions, but the operator story for “this mandate is revoked while a prior attempt is still unresolved” is still ambiguous.

**Operator friction**

- operators need to understand whether revoking stops new spend only, or also changes how unresolved attempts are treated

## Complexity Hotspots

1. Protected operator workflow is still missing as a first-class surface
2. Too many semi-public control/observability endpoints
3. Reconciliation failure is modeled technically, not yet operationally
4. Multiple runtime surfaces make it hard to identify the one true operator path

## Onboarding and Operability Friction

### For developers

- unclear boundary between demo-only and production-intent routes
- secure public-vs-private separation is improved, but the authenticated operator workspace still needs a real session-driven path
- external provisioning assumptions for Supabase, Cloudflare, Postgres, and Morph are not yet bundled into a single onboarding path

### For operators

- system health is protected, but not yet clearly turned into operator actions
- unresolved payment incidents are not yet promoted into a clean action queue
- fallback governance is available, but not yet clearly presented as a privileged operational control

## Simplifications That Improve Clarity

1. Introduce a real authenticated operator route/workspace tied to Supabase session posture.
2. Introduce one explicit operator-visible incident concept for:
   - stale reconciliation
   - exhausted reconciliation retries
   - external dependency degradation
3. Keep the first serious operator path narrow:
   - create mandate
   - run attempt
   - see status
   - handle reconciliation incident
   - revoke mandate

## Vibe Verdict

The in-repo operator experience is now coherent enough for the approved architecture:

- the public/private split is explicit
- the protected operator workspace exists
- incident visibility is present inside that protected path

The remaining experience risk is no longer primarily code shape. It is deployment and operational rollout quality.

## Gate Outcome

`experience_status` can be considered `GREEN` for the in-repo implementation scope.

Release can still remain blocked for external validation and repository hygiene reasons.

## Next Gate

Run `$build` only as a blocked release-readiness decision, not as an approval to ship.
