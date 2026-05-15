# Contributing to Mandate402

Thanks for contributing.

## Scope

Mandate402 has three main lanes:

- `src/` - Next.js operator console and policy backend
- `contracts/` - Solidity treasury and registry contracts
- `main.go` / `agent-sdk/` - x402 demo merchant and agent simulator

## Local Setup

### App

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

### Contracts

```bash
cd contracts
FOUNDRY_CACHE_PATH=cache FOUNDRY_OUT=out forge test
```

### Go x402 Demo Merchant

```bash
go mod tidy
go run .
```

## Verification Before Opening a PR

Run all relevant checks:

```bash
pnpm test
pnpm typecheck
pnpm exec eslint src next.config.ts eslint.config.mjs vitest.config.ts
cd contracts && FOUNDRY_CACHE_PATH=cache FOUNDRY_OUT=out forge test
go build -buildvcs=false .
```

## Secrets and Sensitive Data

Do not commit:

- `.env.local`
- private keys
- Morph x402 HMAC secrets
- deployment cache files
- generated build artifacts

If a secret was ever committed, rotate it immediately.

## Conventions

- Keep Morph facilitator URLs separate from vendor endpoints.
- Treat `execution_unknown` as unresolved until correlation completes.
- Keep treasury guardrails test-first when changing spend logic.
- Prefer small, reviewable PRs.

## Recommended PR Structure

1. Problem statement
2. Design / contract impact
3. Verification commands and results
4. Any external dependency or credential assumptions
