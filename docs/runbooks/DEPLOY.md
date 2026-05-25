# Deployment Runbook

This runbook is the minimum deployment checklist for Mandate402 when treating
the app as a real production operator control surface.

## Purpose

Deploy the operator app and worker/runtime surfaces without silently falling
 back to demo assumptions.

## Preconditions

- `main` is the release-authoritative branch
- required CI checks are green
- release-ready diff has no secrets or local artifacts
- production environment values are configured for:
  - Supabase auth
  - Postgres
  - worker auth token
  - Morph RPC / signer / contract address
  - named vendor endpoints
  - x402 facilitator credentials

## Required env validation

Before deploy, confirm:

- `APP_ENV=production`
- live runtime does not rely on SQLite
- operator routes require Supabase-backed identity
- `MANDATE402_WORKER_TOKEN` is present for internal worker routes
- Morph anchoring config is complete if production issue/revoke is expected
- vendor endpoints are named production targets, not placeholder local URLs

## Deploy order

1. Deploy database migrations first
2. Deploy the app/runtime
3. Deploy the worker/runtime routes
4. Run smoke verification

## Smoke verification

Verify at minimum:

- operator auth works
- `GET /api/system` returns a sensible status shape
- mandate creation works with a real operator identity
- an approved attempt can be queued or dispatched correctly
- blocked paths still fail before vendor execution
- worker execution and reconciliation endpoints authenticate correctly

## Stop conditions

Stop the deployment and rollback if any are true:

- production boot fails due to missing Postgres or Morph config
- operator auth accepts a shared/demo auth path
- worker auth is missing or bypassed
- named vendor endpoints are absent or clearly wrong
- smoke checks fail on auth, queueing, reconciliation, or system health

## Evidence to save

- deployed commit SHA
- migration version applied
- smoke commands run
- `/api/system` snapshot
- any incident or degraded-state notes
