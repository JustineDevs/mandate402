# Production Hardening Security Review

This document captures the `$vet` gate for Mandate402's production hardening path.

## Trust Boundaries

### 1. Operator -> Next.js API

- Authenticated with Supabase bearer tokens.
- Authorization depends on `requireOperator()` and the role mapping derived from the Supabase user record.

### 2. Cloudflare Worker control plane -> internal worker routes

- Intended to be an internal execution boundary.
- Currently implemented as a public HTTP Worker surface that can proxy privileged internal worker calls.

### 3. API/worker runtime -> Postgres store

- Holds the canonical application ledger and operational state.
- Any mutation path here is security-sensitive because it controls attempts, reservations, leases, and audits.

### 4. Runtime -> Morph signer and contracts

- Uses `MORPH_PRIVATE_KEY` and `viem` wallet writes.
- This is a high-value secret boundary and not just an infrastructure detail.

### 5. Runtime -> x402 facilitator / vendor endpoints

- External dependency boundary.
- Facilitator and vendor truth influence settlement and reconciliation.

### 6. Operator/public clients -> observability and governance endpoints

- `/api/system`
- `/api/fallback-gate`
- vendor `/status` endpoints in the Go demo service

These are not neutral read endpoints. They expose control-plane state, fallback posture, and payment-outcome metadata.

## Authn/Authz Expectations

### Must hold

1. Operator mutation routes require authenticated Supabase-backed identity.
2. Worker execution routes must only accept trusted internal callers.
3. Public users must not be able to queue, execute, or reconcile worker jobs.
4. Public users must not receive detailed operational topology, signer readiness, or fallback governance information.

### Missing or weak assumptions

1. The Worker control plane does not currently authenticate callers before forwarding the trusted internal token.
2. `/api/system` and `/api/fallback-gate` are currently public.
3. Vendor status endpoints in the Go service are currently unauthenticated.
4. Repo safety checks do not cover all secrets described in repo policy.

## Sensitive Data Paths

- `MORPH_PRIVATE_KEY`
- `MANDATE402_DEPLOYER_PRIVATE_KEY`
- `MANDATE402_WORKER_TOKEN`
- `MANDATE402_DATABASE_URL`
- `MANDATE402_DATABASE_DIRECT_URL`
- `MORPH_X402_ACCESS_KEY`
- `MORPH_X402_SECRET_KEY`
- Supabase auth credentials and any future service-role secrets
- audit/event data that links operator activity, payment identifiers, and vendor outcomes

## Abuse Cases and Likely Failure Modes

### Release Blocker 1: Public worker execution proxy

**Boundary:** public Internet -> Cloudflare Worker -> internal worker routes  \
**Current behavior:** public callers can hit `POST /control/*` and `POST /queues/*`, and the Worker itself injects the trusted worker bearer token when forwarding.

**Failure mode**

- unauthorized dispatch execution
- unauthorized reconciliation
- forced queueing / replay pressure
- indirect privilege escalation into internal worker operations

**Disposition:** must-fix blocker

### Release Blocker 2: Public operational state exposure

**Boundary:** public Internet -> `/api/system` and `/api/fallback-gate`

**Failure mode**

- reveals signer readiness, contract addresses, queue state, fallback posture, and degraded/ready state
- enables reconnaissance and operational probing

**Disposition:** must-fix blocker

### Release Blocker 3: Weak secret scanning and non-reproducible CI installs

**Boundary:** repo/CI supply chain

**Failure mode**

- secrets outside the currently checked patterns can be committed
- CI/release can drift from the lockfile via `--frozen-lockfile=false`

**Disposition:** must-fix blocker

### Blocker 4: Known dependency findings without disposition

**Boundary:** dependency / supply chain

**Failure mode**

- moderate JS dependency advisories remain unresolved
- affecting `go-ethereum` vulns remain unresolved or unwaived

**Disposition:** blocker until fixed or explicitly waived with scope and upgrade plan

### Accepted-but-documented risk: vendor status metadata exposure in demo service

**Boundary:** public Internet -> Go demo vendor `/status`

**Failure mode**

- outcome metadata can be queried by caller-supplied identifiers

**Disposition:** low severity in demo context, but should be fixed before any serious external exposure

## Concrete Mitigations

1. Require explicit caller auth on Cloudflare Worker control endpoints before any forwarding or queueing happens.
2. Restrict `/api/system` and `/api/fallback-gate` to operator access, or split them into public-safe and operator-only views.
3. Add auth to Go vendor `/status` endpoints if they remain reachable outside local/dev scopes.
4. Expand `scripts/check-repo-safety.mjs` to cover:
   - worker tokens
   - DB URLs with credentials
   - Supabase service-role style secrets
   - broader secret-like bearer/token patterns
5. Change CI and release installs to frozen lockfile mode unless there is a documented exception.
6. Triage `pnpm audit` and `govulncheck` findings into:
   - direct repo fix
   - pinned override
   - upstream-blocked waiver

## Resolved In-Repo Security Blockers

- Worker control endpoints now require trusted caller auth before queueing or forwarding.
- `/api/system` is operator-only.
- `/api/fallback-gate` is operator-only.
- Repo-safety coverage now includes worker tokens, Supabase service-role secrets, and guarded remote DB URL checks.
- CI and release workflows now use frozen lockfile installs.
- `pnpm audit --prod --json` reports zero vulnerabilities.
- `govulncheck ./...` reports zero vulnerabilities affecting this code.

## Acceptable Risks

- D1 cache use is acceptable only while it stays non-authoritative
- EOA signer model is acceptable for the sprint if signer custody and rotation are treated as external operational controls
- Go vendor `/status` endpoints are tolerable for local demo use only, not for production exposure

## Security Verdict

The in-repo security hardening slice is complete.

`security_status = GREEN` is now justified for the repository code and workflow state.

Release is still blocked by external operational validation and experience gaps, not by an unresolved in-repo security defect from this slice.

## Next Gate

Run `$vibe`.

`$vibe` should assess whether the operator-facing surfaces match the intended trust posture after the required security constraints are applied, especially around system status visibility and operator-only controls.
