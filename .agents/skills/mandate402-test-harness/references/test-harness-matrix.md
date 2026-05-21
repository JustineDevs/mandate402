# Test Harness Matrix

Frontend or route behavior:

- focused Vitest route/component/module tests
- `pnpm typecheck`
- `pnpm exec eslint <changed-files>`
- `pnpm exec biome check <changed-files>`
- `pnpm build` for larger composition changes

Persistence or worker behavior:

- store integrity tests
- store production tests
- execution worker tests
- route tests for enqueue/worker surfaces

Blockchain or treasury behavior:

- blockchain health tests
- treasury enforcement tests
- Morph anchor tests
- Foundry tests when Solidity changes

Go x402 vendor behavior:

- `go test ./...`
- `go build -buildvcs=false .` when runtime behavior changes

Release or CI behavior:

- `pnpm check:repo-safety`
- `pnpm check:release-readiness`
- relevant workflow review
