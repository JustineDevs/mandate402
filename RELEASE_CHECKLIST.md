# Public Release Checklist

Use this checklist before pushing or releasing from the public remote.

## Safety

- [ ] `.env.local` is not staged
- [ ] `internal/dont push.txt` is not staged
- [ ] no Morph x402 HMAC keys are committed
- [ ] no private keys are committed
- [ ] no local absolute paths remain in docs or source
- [ ] `pnpm check:repo-safety` passes

## Code Quality

- [ ] `pnpm check:biome` passes
- [ ] `pnpm test` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm exec eslint src next.config.ts eslint.config.mjs vitest.config.ts` passes
- [ ] `cd contracts && FOUNDRY_CACHE_PATH=cache FOUNDRY_OUT=out forge test` passes
- [ ] `go build -buildvcs=false .` passes
- [ ] `go test ./...` passes

## Release Readiness

- [ ] `pnpm check:release-readiness` passes
- [ ] `CHANGELOG.md` is updated appropriately
- [ ] a changeset exists for release-worthy changes
- [ ] release notes reflect deployed contract and vendor behavior accurately

## Deploy / Explorer

- [ ] deployed treasury address is correct in docs
- [ ] deployment tx hash is correct in docs
- [ ] contract source is verified on Morph explorer or verification step is queued

## Remote

- [ ] branch protection is enabled on `main`
- [ ] required checks are configured
- [ ] release token / GitHub token permissions are correct
