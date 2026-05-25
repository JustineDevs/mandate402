# Mandate402 Product Requirements Document

This document is the repo-native PRD anchor for Mandate402.

It is not meant to replace the more detailed `.omx/plans/*` artifacts. Its job
is to give contributors, reviewers, and issue authors one durable product-level
source of truth they can cite from GitHub issues and sprint work.

## Product Summary

Mandate402 is a governance and treasury control layer for x402 machine payments
on Morph.

The product exists to let organizations authorize agent spend without giving
software agents unrestricted access to treasury value.

## Core Problem

x402 solves payment transport for paid HTTP resources.

It does not solve:

- vendor allowlisting
- budget boundaries
- mandate expiry
- receipt requirements
- ambiguous payment reconciliation
- operator-visible revocation and auditability

Mandate402 fills that control gap.

## Core User Promise

An operator can issue a mandate, allow one approved payment, block one invalid
payment before dispatch, reconcile an ambiguous outcome, and revoke authority
later with a visible audit trail.

## Current Product Boundary

The current product boundary is intentionally narrow:

- Morph-first runtime and chain identity
- x402-paid HTTP API vendors only
- policy-first offchain control
- explicit worker-owned reconciliation
- named vendors and explicit fallback posture

## Primary Users

- AI-native startup teams
- technical operators
- treasury and finance reviewers
- developer teams integrating paid agent workflows

## Product Rules

- no vendor execution before auth, policy approval, and reservation
- `execution_unknown` remains unresolved until correlation proves final truth
- financial outcome and receipt evidence remain separate truths
- revoked or expired mandates fail closed for new attempts

## Acceptance Shape

Mandate402 is only “done” for a release when:

- docs, env, runtime, and UI claims are aligned
- verification evidence exists for the release gate
- no demo-only or misleading production behavior remains in the claimed scope

## Canonical Detailed Planning References

For detailed release and implementation planning, use:

- `.omx/plans/prd-mandate402-v0-1-0.md`
- `.omx/plans/release-ladder.md`
- `.omx/plans/mandate402-production-hardening-map.md`
- `.omx/plans/post-roadmap-closure-v0-3-0-v1-0-0-consensus-approved.md`
