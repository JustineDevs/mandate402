# Blockchain Runtime Reference

Use this file when the task needs chain-facing architecture details.

## Canonical Layer

Use the shared blockchain layer:

- `src/lib/blockchain/networks.ts`
- `src/lib/blockchain/contracts.ts`
- `src/lib/blockchain/clients.ts`
- `src/lib/blockchain/health.ts`
- `src/lib/blockchain/treasury.ts`

## Truth Rules

Canonical onchain truths include:

- mandate lifecycle
- treasury guard state
- facilitator approvals
- kill switch
- future agent identity mapping

## Do Not

- move vendor HTTP logic onchain
- treat projection state as chain truth
- hide missing signer or RPC readiness
