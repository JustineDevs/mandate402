---
name: mandate402-x402-vendor-go
description: Load when changing Mandate402 main.go, Go x402 vendor routes, Morph HMAC signing, facilitator config, provider data, status endpoints, or Go verification.
---

# Mandate402 x402 Vendor Go

## Read First

- `main.go`
- `README.md`
- `references/go-vendor-checklist.md`
- `TESTS.md`

## Procedure

### 1. Plan

- identify paid route, status route, provider, facilitator, and token-domain impact
- list required env values and failure behavior
- decide whether the change affects vendor response truth or only payload shape

### 2. Validate

- Go vendor remains an explicit x402 paid service, not hidden sample behavior
- provider mode remains real and fail-closed
- Morph HMAC signing path stays canonical for facilitator requests
- status endpoints remain correlation surfaces

### 3. Execute

Keep route names stable unless docs and environment examples are updated together.

### 4. Verify

Run `go test ./...`; run `go build -buildvcs=false .` when runtime path changes.

## Gotchas

- do not reintroduce deterministic provider fallback
- do not log x402 credentials or HMAC secrets
- do not break the `/x402_vendor/.../status` correlation contract
