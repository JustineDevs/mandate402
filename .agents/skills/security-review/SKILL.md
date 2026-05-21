---
name: security-review
description: "Load when reviewing Mandate402 for security risks across API, auth, database, payment, x402, worker, Morph, contract, or release boundaries."
metadata:
  compatibility: "OpenAI/Codex, Claude, Cursor, Gemini, and agents that can read repo-local Markdown skills"
  source: repo-local bridge
  upstream_note: "The requested sickn33 security-review slug is not exposed by the current upstream skill index; use cc-skill-security-review plus Mandate402 security skills."
---

# Security Review

This is the repo-local security review router for Mandate402. It keeps the public trigger stable while routing agents to the narrower project and OSS skills that match the actual risk boundary.

## Procedure

1. Classify the boundary before reading code: API/auth, database, x402/payment, worker/reconciliation, Morph/contract, frontend trust boundary, or release/CI.
2. Load the mandatory Mandate402 skill for that boundary first. Use `mandate402-runtime-security` for API/auth/payment runtime work and `mandate402-blockchain` for Morph or contract-facing work.
3. Load `api-security-hardening` for public API hardening, `cc-skill-security-review` for general secure-code checklist coverage, and `software-crypto-web3` for onchain/offchain risk.
4. Verify with deterministic checks before reporting: repo-safety, focused tests, typecheck, contract tests, or route-level tests as appropriate.
5. Do not mark a finding resolved unless code, tests, and docs agree.

## Gotchas

- Do not treat client-side checks as authorization. Server routes and worker surfaces own enforcement.
- Do not log secrets, private keys, signed payloads, raw HMAC credentials, or local machine paths.
- Do not call unresolved payment truth final. `execution_unknown` remains unresolved until correlation proves final truth.
- Do not rely on LLM-only security judgment for contracts or signing. Reproduce findings with tests or deterministic tools.
