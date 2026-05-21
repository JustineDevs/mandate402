---
name: mandate402-blockchain
description: Load when changing Mandate402 chain-facing code on Morph such as network manifests, RPC handling, contract registry, ABI ownership, treasury execution, chain health, or frontend/backend boundaries that depend on onchain truth.
---

# Mandate402 Blockchain

## Read First

- `AGENTS.md`
- `docs/MORPH-FIRST-HYBRID-ARCHITECTURE.md`
- `docs/adr/ADR-0004-morph-first-hybrid-architecture.md`
- `references/blockchain-runtime.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify whether the change affects network config, contract config, ABI ownership, clients, treasury execution, or chain health
- identify what is canonical onchain truth vs projected/app-local state
- identify any wallet/signer or RPC requirement changes

### 2. Validate

Preserve these rules:

- onchain truth stays canonical for authority and policy
- no inline ABI ownership when curated ABI exists
- no app-local replacement for chain truth
- facilitator is not vendor
- treasury readiness and degradation remain explicit

### 3. Execute

Preferred order:

1. ABI or manifest changes
2. client/runtime boundary changes
3. health/reporting changes
4. tests

### 4. Verify

Run as relevant:

- `pnpm exec vitest run ...`
- `pnpm typecheck`
- `pnpm exec eslint ...`
- `pnpm build`

## Scope

Use this skill for:

- Morph network manifest
- contract registry/address mapping
- curated ABI files
- viem public/wallet client boundaries
- RPC reachability and chain health
- treasury execution runtime
- frontend/backend chain-aware truth boundaries

## Gotchas

- do not put vendor HTTP logic onchain
- do not treat raw projection data as chain truth
- do not hide chain degradation or missing signer readiness
- do not reintroduce inline parseAbi when curated ABI exists
