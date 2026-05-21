---
name: mandate402-contract-deploy-verify
description: Load when changing Mandate402 Solidity contracts, Foundry tests, deploy scripts, ABI ownership, Morph explorer verification, contract metadata, or artifact hygiene.
---

# Mandate402 Contract Deploy Verify

## Read First

- `contracts/README.md`
- `contracts/src/`
- `.github/workflows/verify-contract.yml`
- `references/contract-deploy-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify contract, test, deploy, ABI, and explorer impact
- list constructor args, chain ID, verifier URL, and metadata assumptions
- decide whether app-facing curated ABI files must change

### 2. Validate

- contract artifacts, cache, and broadcasts remain out of public remote
- ABI ownership stays curated under app-facing blockchain modules
- explorer verification commands match Morph network target
- tests cover treasury, policy, and accounting changes

### 3. Execute

Update Solidity, Foundry tests, deploy metadata/docs, and curated app ABI together when the interface changes.

### 4. Verify

Run Foundry tests for Solidity changes and app type/tests for ABI-consuming changes.

## Gotchas

- do not treat `contracts/out` as app ABI source of truth
- do not commit private deployment keys or broadcast artifacts
- do not verify against the wrong Morph explorer endpoint
