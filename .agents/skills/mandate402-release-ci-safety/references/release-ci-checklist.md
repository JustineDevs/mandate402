# Release CI Checklist

Workflow rules:

- PR checks must cover app, contracts, and Go paths when relevant
- release automation runs from `main` only
- semantic-release owns release publication
- changesets record release-worthy intent
- smoke workflows use explicit env and no hidden fallback

Public remote safety:

- no `.env.local`
- no private keys
- no x402 credentials
- no contract cache/out/broadcast artifacts
- no local planning or machine paths

Before push:

- `pnpm check:repo-safety`
- `pnpm check:release-readiness`
- relevant test matrix
- inspect staged files for secrets and artifacts
