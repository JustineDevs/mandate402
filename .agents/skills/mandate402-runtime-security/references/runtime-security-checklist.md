# Runtime Security Checklist

Secrets that must never be committed or printed:

- Morph private keys
- x402 access or secret keys
- Supabase service credentials
- production vendor tokens
- database direct URLs with credentials

Boundary rules:

- operator auth uses operator identity and roles
- worker auth uses internal worker credentials only
- facilitator URLs are payment infrastructure, not vendors
- vendor endpoints are paid service endpoints, not settlement infrastructure
- missing live runtime config must block or degrade explicitly

Security test cases:

- missing auth
- malformed token
- wrong worker secret
- missing production env
- vendor/facilitator confusion
- secret-like data in generated output
