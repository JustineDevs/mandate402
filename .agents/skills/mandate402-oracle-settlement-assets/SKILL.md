---
name: mandate402-oracle-settlement-assets
description: Load when changing Mandate402 treasury settlement assets, token decimals, Pyth feeds, fiat conversion, stale oracle handling, facilitator settlement assumptions, or onchain payment amounts.
---

# Mandate402 Oracle Settlement Assets

## Read First

- `contracts/src/Mandate402Treasury.sol`
- `src/lib/blockchain/treasury.ts`
- `src/lib/blockchain/contracts.ts`
- `references/oracle-settlement-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify asset, decimals, oracle feed, network, and quote assumption
- list what is onchain truth versus offchain runtime convention
- decide whether contract, runtime, docs, and tests all need updates

### 2. Validate

- token decimals are explicit
- price feed IDs and stale thresholds are explicit
- stable-value assumptions are not generalized silently
- treasury execution amount matches settlement asset units

### 3. Execute

Keep quote/asset logic centralized and visible in `/api/system` readiness where relevant.

### 4. Verify

Run treasury enforcement, blockchain health, route tests, and Foundry tests when contract logic changes.

## Gotchas

- do not convert cents to arbitrary token units without a quote model
- do not assume all settlement assets are USDC-like
- do not ignore stale or missing oracle data
