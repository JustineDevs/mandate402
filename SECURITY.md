# Security Policy

## Supported Branches

Security fixes are supported on:

- `main`
- `development`

Feature branches and preview branches are not long-term support surfaces.

## Reporting a Vulnerability

Do not open a public issue for:

- exposed secrets
- auth bypasses
- worker token leakage
- treasury or payment boundary flaws
- contract or chain-execution vulnerabilities

Instead:

1. email the maintainer or repository owner directly
2. include:
   - affected commit or branch
   - reproduction steps
   - impact
   - whether credentials or funds may be exposed
3. if a secret is involved, rotate it immediately and mention that in the report

## Scope Expectations

High-priority security surfaces in Mandate402 include:

- operator authentication and authorization
- internal worker route protection
- Supabase and Postgres persistence truth
- x402 payment and reconciliation boundaries
- Morph treasury anchoring and contract execution
- CI/CD and release automation safety

## Response Expectations

The repository aims to:

- acknowledge valid reports quickly
- reproduce and scope the issue
- rotate affected secrets when required
- ship the smallest safe fix
- document any required operator or deployment follow-up
