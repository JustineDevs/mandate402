# Changelog

All notable changes to this project will be documented in this file.

## 0.1.0

Initial public MVP release of **Mandate402**.

### Added

- Next.js operator console and API runtime for:
  - mandate creation
  - payment attempts
  - blocked-attempt handling
  - unknown-attempt reconciliation
  - mandate revocation
- normalized runtime domain model with:
  - `agents`
  - `mandates`
  - `payment attempts`
  - `audit entries`
  - `domain events`
- `GET /api/system` for runtime health and status visibility
- structured correlation IDs and route-level observability logging
- idempotent payment-attempt handling with conflict detection on reused `paymentIdentifier`
- local Go x402 merchant with paid demo vendor endpoints:
  - `/x402_demo/api/market-data`
  - `/x402_demo/api/research`
  - `/x402_demo/api/market-data/status`
  - `/x402_demo/api/research/status`
  - `/x402_demo/api/resource`
- upstream market-data provider integration in the Go merchant:
  - CoinMarketCap
  - CoinAPI
  - deterministic demo fallback
- `MandateRegistry` minimal Morph-native issue/revoke anchor contract
- `Mandate402Treasury` Pyth-powered treasury guardrail contract
- Foundry deployment script for `Mandate402Treasury`
- agent simulator kit under `agent-sdk/`
- strict repository governance docs:
  - `AGENTS.md`
  - `CONTRIBUTING.md`
  - `RELEASE_CHECKLIST.md`
  - branch-protection guidance
- semantic CI/CD stack and repo tooling:
  - GitHub Actions CI
  - GitHub Actions release workflow
  - GitHub Actions changesets workflow
  - GitHub Actions API smoke workflow
  - GitHub Actions contract verification workflow
  - `act`
  - `lefthook`
  - `pre-commit`
  - `biome`
  - `changesets`
  - `semantic-release`
  - `renovate`
  - `.devcontainer`
- repository safety and release-readiness scripts:
  - `pnpm check:repo-safety`
  - `pnpm check:release-readiness`
  - `pnpm ci:all`
  - `pnpm release:dry-run`

### Changed

- sanitized `main.go` so Morph x402 access keys and secrets are loaded from environment variables instead of being embedded in source
- separated facilitator URLs from paid vendor URLs throughout the codebase and docs
- aligned the repo to current official Morph Hoodi testnet values instead of stale Holesky-style RPC/chain combinations
- moved the fallback gate artifact into tracked runtime config under `config/mandate402-fallback-gate.md` so CI and deployed runtime do not depend on ignored local `.omx` state
- upgraded `README.md` into a public-remote-safe project document with:
  - centered header image
  - badges
  - acknowledgements
  - deployment summary
  - vendor/facilitator explanation
  - contract verification instructions
  - local demo vendor mapping

### Fixed

- `execution_unknown` no longer emits premature `attempt_reconciled`
- unknown-attempt reconciliation now derives terminal truth from vendor correlation endpoints instead of caller-supplied outcome data
- fallback-gate enforcement now validates declared-target coverage rather than accepting arbitrary attempt counts
- service-layer expiry handling now fails closed on invalid or past timestamps
- API smoke workflow no longer races merchant startup; it now:
  - injects startup env explicitly
  - builds the Go merchant first
  - waits for service readiness
- local release/push safety now blocks accidental inclusion of:
  - private keys
  - Morph HMAC credentials
  - local absolute paths
  - internal notes
  - generated artifacts

### Deployed

- `Mandate402Treasury` deployed to **Morph Hoodi Testnet**
  - contract: `0xD08301fEAc731dDe33b81059A59A69c1A1B5DD60`
  - transaction: `0xfd0b1f2312437a97e791aad3cd14ca251b86b70ffa42215d48b92a2c8c9ff147`

### Verified

- `Mandate402Treasury` source verified on the Morph Hoodi Blockscout explorer

### Verified

- `pnpm test`
- `pnpm typecheck`
- source-tree eslint
- `pnpm check:biome`
- `pnpm check:repo-safety`
- `pnpm check:release-readiness`
- `forge test`
- `go build -buildvcs=false .`
- `go test ./...`
