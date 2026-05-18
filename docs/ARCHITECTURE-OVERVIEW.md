# Architecture Overview

This is a simplified architecture guide for contributors who need orientation before reading the full system design.

## Major Areas

- `src/`: Next.js app, UI, APIs, policy runtime
- `src/lib/modules/`: application behavior such as mandates, payments, auth
- `src/lib/infrastructure/`: environment, persistence, integrations
- `contracts/`: Solidity contracts
- `main.go`: demo x402 vendor service
- `agent-sdk/`: simulation and helper tooling

## High-Risk Areas

Changes in these areas require extra care and usually Justine review:

- auth
- infrastructure
- contracts
- release workflows
- treasury semantics

## Lower-Risk Entry Areas

For new contributors, easier areas are usually:

- docs
- isolated UI surfaces
- tests
- workflow clarity

## Important System Rules

- facilitator is not the vendor
- vendor is not the treasury
- `execution_unknown` stays unresolved until correlated
- reservations stay held until reconciliation completes
