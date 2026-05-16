# Mandate402 Docs Guide

This document is for anyone trying to understand which Mandate402 document to read first and what each one is for.

## Start Here

| If you are trying to... | Read this first |
|---|---|
| Understand the idea in simple terms | [EXPLAIN.md](./EXPLAIN.md) |
| Understand the product, scope, and why it exists | [PROJECT.md](./PROJECT.md) |
| Understand the business model and stakeholders | [BM.md](./BM.md) |
| Understand the runtime, contracts, and architecture | [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) |
| Understand team roles and collaboration rules | [TEAM.md](./TEAM.md) |
| Understand current release shape and what is still demo-shaped | [STATUS.md](./STATUS.md) |
| Look up domain terms | [GLOSSARY.md](./GLOSSARY.md) |
| Implement the visual system | [design-tokens.md](./design-tokens.md) |
| Review formal decisions | [adr/README.md](./adr/README.md) |

## Reading Paths

### Non-technical reader

1. [EXPLAIN.md](./EXPLAIN.md)
2. [PROJECT.md](./PROJECT.md)
3. [STATUS.md](./STATUS.md)

### Product or stakeholder reader

1. [PROJECT.md](./PROJECT.md)
2. [BM.md](./BM.md)
3. [STATUS.md](./STATUS.md)

### Engineer or technical reviewer

1. [PROJECT.md](./PROJECT.md)
2. [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)
3. [STATUS.md](./STATUS.md)
4. [GLOSSARY.md](./GLOSSARY.md)

### Team member onboarding

1. [TEAM.md](./TEAM.md)
2. [adr/README.md](./adr/README.md)
3. [STATUS.md](./STATUS.md)
4. the task-specific ADR that applies to your lane

## Document Roles

### Product and explanation

- [EXPLAIN.md](./EXPLAIN.md): plain-language explanation for non-technical readers
- [PROJECT.md](./PROJECT.md): product framing, problem, scope, what/why/how
- [BM.md](./BM.md): business model, buying triggers, stakeholders, packaging

### Technical

- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md): implementation-grounded runtime and system design
- [GLOSSARY.md](./GLOSSARY.md): normalized definitions for shared terms
- [design-tokens.md](./design-tokens.md): UI design token reference for Sherwin and Edward
- [STATUS.md](./STATUS.md): current MVP status, known boundaries, next-documentation priorities

### Team and process

- [TEAM.md](./TEAM.md): team roles, anti-silo workflow, ownership model
- [adr/README.md](./adr/README.md): ADR index

## Maintenance Rule

If a decision changes how the team works, how the product is explained, or how implementation should proceed, the relevant document should be updated instead of leaving that decision only in chat or memory.
