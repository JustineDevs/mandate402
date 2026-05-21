---
name: mandate402-runtime-security
description: Load when changing Mandate402 auth, secrets, worker auth, production env gates, vendor/facilitator boundaries, security headers, sensitive errors, or fail-closed runtime behavior.
---

# Mandate402 Runtime Security

## Read First

- `AGENTS.md`
- `docs/AI-POLICY.md`
- `src/lib/modules/auth.ts`
- `src/lib/modules/worker-auth.ts`
- `references/runtime-security-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify trust boundary: operator, worker, vendor, facilitator, chain, or DB
- list secrets and env values touched by the change
- decide what must fail closed when config is missing

### 2. Validate

- no secret enters tracked files, logs, API responses, or docs
- operator auth and worker auth remain distinct
- vendor URLs are not facilitator URLs
- production mode never falls back to test/sample behavior

### 3. Execute

Implement smallest boundary-preserving change, then add negative tests for missing config, bad auth, and forbidden fallback behavior.

### 4. Verify

Run auth, env production, route, repo-safety, and type checks as relevant.

## Gotchas

- do not mention private local artifacts or local paths in public docs
- do not weaken auth for easier local testing
- do not expose raw Supabase, Morph, x402, private key, or HMAC values
