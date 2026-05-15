# Mandate402 Contracts

This workspace contains two contract lanes:

- `MandateRegistry.sol` - minimal Morph-native issue/revoke anchor
- `Mandate402Treasury.sol` - oracle-aware treasury guardrails for x402 execution

## Scope

`MandateRegistry` anchors only mandate issuance and revocation onchain.

- `issueMandate(bytes32 mandateId, bytes32 specHash)` stores an offchain mandate reference and marks it active.
- `revokeMandate(bytes32 mandateId, bytes32 revokeRef)` stores the revocation reference and marks the mandate revoked.
- Budget accounting, vendor allowlists, expiry enforcement, and payment authorization remain offchain in the backend policy layer by plan.

## Layout

- `src/MandateRegistry.sol` - minimal anchor contract
- `src/Mandate402Treasury.sol` - Pyth-powered USD guardrail treasury
- `src/interfaces/IPyth.sol` - Pyth oracle interface
- `test/MandateRegistry.t.sol` - issue/revoke and event coverage
- `test/Mandate402Treasury.t.sol` - guardrail and oracle coverage
- `test/utils/Test.sol` - local Foundry test helpers to avoid external dependency pulls
- `script/DeployMandate402Treasury.s.sol` - deployment entrypoint for the treasury contract

## Running tests

Install Foundry locally, then run:

```bash
cd contracts
forge test
```

Verified in this workspace with:

```bash
FOUNDRY_CACHE_PATH=cache FOUNDRY_OUT=out /root/.foundry/bin/forge test
```
