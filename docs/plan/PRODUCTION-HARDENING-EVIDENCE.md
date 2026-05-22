# Production Hardening Evidence

This document captures the `$sage` evidence gate for Mandate402's production hardening path.

## Decision

The current architecture is evidence-backed and should proceed to `$flow` with these validated choices:

- Supabase Auth for operator identity
- Postgres for the durable projection and operations store
- Cloudflare Workers + Queues + Durable Objects for thin control, queueing, and serialized coordination
- D1 only for Worker-local cache/dev-fixture storage, not system-of-record data
- viem for EOA-based Morph contract writes in the current sprint
- x402 official SDK/protocol for buyer/resource-server/facilitator flows
- Next.js as the operator console

## Candidate Evaluation

### 1. Supabase Auth

**Candidate:** Supabase Auth  \
**Official source:** `supabase.com/docs`

**Why it fits**

- Supabase Auth is built around JWT-based auth and supports server-side validation.
- The official JavaScript reference for `auth.getUser()` states it performs a network request and returns an authentic user object suitable for authorization logic.
- Supabase's SSR guidance supports cookie-backed server flows and recommends PKCE for SSR.

**Why it can fail**

- It is the wrong fit if the app relies on editable token claims or client-side-only checks for authorization.
- It still requires external project configuration: role claims, cookie/session setup, revocation handling, and service-side secrets posture.

**Repo mapping**

- Current code uses `supabase.auth.getUser()` in `src/lib/modules/auth.ts`.
- This is aligned with the official guidance and is stronger than local JWT claim inspection.

### 2. Postgres as the durable ops/projection store

**Candidate:** Supabase Postgres / managed Postgres  \
**Official source:** `supabase.com/docs/guides/database`, `supabase.com/docs/guides/platform/backups`

**Why it fits**

- Supabase documents a full Postgres database per project.
- Supabase documents automatic daily backups and optional PITR-related workflows.
- This matches the repo's need for normalized attempts, events, worker lease state, and operator-facing projections.

**Why it can fail**

- Backups, restore drills, custom role/password recovery, and operational retention are outside the repo and must be configured and tested in the real project.
- It is the wrong fit to treat Cloudflare D1 as the authoritative ledger instead of Postgres for this repo's current shape.

**Repo mapping**

- Current production mode defaults to Postgres in `src/lib/infrastructure/env.ts`.
- The hardened store writer in `src/lib/infrastructure/postgres-store.ts` now uses upsert-and-prune semantics instead of full delete/reinsert snapshots.

### 3. Cloudflare Workers + Queues + Durable Objects

**Candidate:** Cloudflare Workers platform primitives  \
**Official source:** `developers.cloudflare.com`

**Why it fits**

- Cloudflare documents Queues for background processing and deferred tasks.
- Cloudflare documents Durable Objects as stateful coordination primitives, not stateless request handlers.
- Cloudflare documents that Durable Objects are not directly Internet-facing and are meant to be accessed via Workers.
- Cloudflare documents Cron Triggers as the scheduled execution surface for periodic jobs.

**Why it can fail**

- Cloudflare Queues are at-least-once delivery, not exactly-once. That means idempotency is mandatory on payment/reconciliation paths.
- Durable Objects are single-threaded, but async interleaving still exists; they do not remove the need for careful invariant design.
- Publicly exposing Worker control routes without explicit caller auth creates a privilege-escalation proxy, which the security review already identified.

**Repo mapping**

- Worker scaffold exists in `src/workers/mandate402.ts`.
- Queue and reconciliation ownership already match the repo's target architecture.
- The security review found a high-severity gap: public Worker endpoints currently proxy internal privileged calls.

### 4. D1

**Candidate:** Cloudflare D1  \
**Official source:** `developers.cloudflare.com/d1/`, `developers.cloudflare.com/workers/platform/storage-options/`

**Why it fits**

- D1 is a managed SQLite-compatible database with Worker access.
- It is suitable for Worker-local cache data and dev/smoke fixtures.

**Why it fails as the system of record**

- The current repo architecture explicitly keeps Postgres as the durable projection and operations ledger.
- D1 is not the right authority layer for Mandate402 attempts, leases, and audit truth in the current architecture.

**Repo mapping**

- Current D1 usage is intentionally limited to Worker cache tables in `workers/d1/migrations/0001_worker_cache.sql`.
- That aligns with the approved architecture.

### 5. Hyperdrive

**Candidate:** Cloudflare Hyperdrive  \
**Official source:** `developers.cloudflare.com/hyperdrive/`

**Why it fits**

- Hyperdrive is the official Cloudflare path for accelerating existing Postgres/MySQL databases from Workers.
- It works with existing Postgres drivers and pools connections on Cloudflare's side.

**Why it is not required yet**

- The current Worker design is a thin control plane that forwards to the app/runtime, so direct Worker-to-Postgres connectivity is not required in this sprint.
- If the repo later moves Workers into direct Postgres access, Hyperdrive becomes the evidence-backed default candidate.

### 6. viem for current Morph execution

**Candidate:** viem  \
**Official source:** `viem.sh`

**Why it fits**

- viem documents `createWalletClient()` and `writeContract()` for local account and contract-write flows.
- This matches the current sprint decision to keep a simple EOA signer rather than introduce EIP-4337 complexity.

**Why it can fail**

- It is only as secure as signer custody, RPC correctness, and operational key handling.
- It does not itself solve policy enforcement, rotation, or compromise recovery.

**Repo mapping**

- Current execution uses `privateKeyToAccount` and `createWalletClient` in `src/lib/blockchain/clients.ts`.
- Mandate lifecycle and treasury writes use `writeContract()` in `src/lib/modules/morph-anchor.ts` and `src/lib/blockchain/treasury.ts`.

### 7. x402 official SDK and protocol

**Candidate:** x402 protocol and official SDKs  \
**Official source:** `docs.x402.org`, upstream repo `github.com/x402-foundation/x402`

**Why it fits**

- The official docs describe the buyer/resource-server/facilitator flow Mandate402 depends on.
- The official facilitator docs describe facilitator verification and settlement as optional but recommended, which matches the current architecture.
- The upstream repo provides the TypeScript and Go SDKs already used in this repo.

**Why it can fail**

- Facilitator uptime, settlement truth, and duplicate-settlement behavior are external dependencies.
- The repo still needs stronger vendor status endpoint security and clearer disagreement handling.

**Repo mapping**

- JS packages in `package.json` and the Go demo vendor in `main.go` align with the official protocol shape.

### 8. Next.js for the operator console

**Candidate:** Next.js  \
**Official source:** `nextjs.org/docs`, `developers.cloudflare.com/pages/framework-guides/nextjs/`

**Why it fits**

- Next.js supports standard production builds and self-hosted Node deployments.
- Next.js self-hosting guidance recommends a reverse proxy in front of the app for malformed requests, slow connections, and rate limiting concerns.
- Cloudflare documents full-stack Next.js support through the Workers/OpenNext path, but that is optional for this repo because the current target keeps a separate Worker control plane.

**Why it can fail**

- Multi-instance Next.js deployments need explicit cache coordination and deployment planning.
- Exposing Next directly without a proper proxy or managed platform protections is a hardening mistake.

## Verified Assumptions

- `requireOperator()` using Supabase `getUser()` is an upstream-supported authorization input.
- Postgres is the correct durable store for Mandate402 production intent.
- Cloudflare Queues require idempotency because delivery is at-least-once.
- Durable Objects are appropriate for serialized coordination, but should not be exposed directly or used as the authority layer for this repo.
- D1 is evidence-backed as cache/dev storage, not as the core ledger.
- viem is a valid current-sprint execution client for EOA-based Morph writes.
- x402 facilitator-backed flows are consistent with the official protocol docs.

## Rejected or Deferred Assumptions

- **Rejected:** D1 as the primary production ledger.
- **Deferred:** EIP-4337 / Account Abstraction in the current sprint.
- **Deferred:** Direct Worker-to-Postgres runtime migration; Hyperdrive is the default candidate if that path is taken later.

## Gaps and Caveats

- Real Supabase role claims, session revocation, and cookie/session policy are external to the repo.
- Real Postgres backup/restore drills and incident runbooks are external to the repo.
- Real Cloudflare bindings, secret rotation, and account policy are external to the repo.
- The security review found a high-severity in-repo issue: the Worker control surface currently proxies privileged internal worker calls without authenticating the caller.
- Known dependency findings still need remediation planning:
  - `pnpm audit --prod --json` reported moderate JS dependency findings.
  - `govulncheck ./...` reported affecting `go-ethereum` vulnerabilities through the Go dependency chain.

## Recommendation

Approve the current stack choices with the following conditions:

1. Keep Supabase + Postgres + Cloudflare Workers + viem + x402 + Next.js.
2. Keep D1 scoped to Worker-local cache/dev-fixture use only.
3. Treat Hyperdrive as the official future option if Workers start talking directly to Postgres.
4. Carry the returned security findings into `$flow` and `$vet` before any release claim.

## Next Gate

Run `$flow`.

`$flow` should convert this evidence into a narrow implementation sequence, prioritizing:

1. Worker control-plane auth closure
2. `/api/system` and fallback surface hardening
3. Reproducible CI installs and stronger repo-safety checks
4. Dependency remediation planning
5. Remaining production boot/readiness and reconciliation escalation work
