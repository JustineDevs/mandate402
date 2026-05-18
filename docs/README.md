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
| Understand mandatory delivery workflow | [WORKFLOW.md](./WORKFLOW.md) |
| Understand mandatory branch rules | [BRANCHING.md](./BRANCHING.md) |
| Understand mandatory lane ownership | [LANES.md](./LANES.md) |
| Understand mandatory AI usage rules | [AI-POLICY.md](./AI-POLICY.md) |
| Understand mandatory label taxonomy | [LABELS.md](./LABELS.md) |
| Understand mandatory release rules | [RELEASE-POLICY.md](./RELEASE-POLICY.md) |
| Understand emergency release exceptions | [HOTFIX.md](./HOTFIX.md) |
| Understand mandatory PR policy | [PR-POLICY.md](./PR-POLICY.md) |
| Copy a ready-made onboarding prompt | [CONTRIBUTOR-PROMPT.md](./CONTRIBUTOR-PROMPT.md) |
| Follow deterministic repo startup steps | [REPO-INGESTION.md](./REPO-INGESTION.md) |
| Check if an issue is ready | [DEFINITION-OF-READY.md](./DEFINITION-OF-READY.md) |
| Check if a change is done | [DEFINITION-OF-DONE.md](./DEFINITION-OF-DONE.md) |
| Reuse shared frontend building blocks | [FRONTEND-PRIMITIVES.md](./FRONTEND-PRIMITIVES.md) |
| Follow the public OSS onboarding path | [OPEN-SOURCE-ONBOARDING.md](./OPEN-SOURCE-ONBOARDING.md) |
| Find safe first contribution expectations | [FIRST-PR.md](./FIRST-PR.md) |
| Understand first-issue expectations | [FIRST-ISSUES.md](./FIRST-ISSUES.md) |
| See supported contribution categories | [CONTRIBUTION-TYPES.md](./CONTRIBUTION-TYPES.md) |
| Know where to ask for help | [SUPPORT.md](./SUPPORT.md) |
| Get a simplified repo map | [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md) |
| See contributor recognition norms | [RECOGNITION.md](./RECOGNITION.md) |
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

### Open-source contributor onboarding

1. [OPEN-SOURCE-ONBOARDING.md](./OPEN-SOURCE-ONBOARDING.md)
2. [CONTRIBUTION-TYPES.md](./CONTRIBUTION-TYPES.md)
3. [FIRST-PR.md](./FIRST-PR.md)
4. [SUPPORT.md](./SUPPORT.md)

## Document Roles

### Product and explanation

- [EXPLAIN.md](./EXPLAIN.md): plain-language explanation for non-technical readers
- [PROJECT.md](./PROJECT.md): product framing, problem, scope, what/why/how
- [BM.md](./BM.md): business model, buying triggers, stakeholders, packaging

### Technical

- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md): implementation-grounded runtime and system design
- [GLOSSARY.md](./GLOSSARY.md): normalized definitions for shared terms
- [design-tokens.md](./design-tokens.md): UI design token reference for Sherwin, Edward, and John
- [STATUS.md](./STATUS.md): current MVP status, known boundaries, next-documentation priorities
- [WORKFLOW.md](./WORKFLOW.md): mandatory issue-to-merge execution flow
- [BRANCHING.md](./BRANCHING.md): mandatory branch and worktree rules
- [LANES.md](./LANES.md): mandatory ownership split by team lane
- [AI-POLICY.md](./AI-POLICY.md): mandatory AI usage rules
- [LABELS.md](./LABELS.md): mandatory issue and PR label taxonomy
- [RELEASE-POLICY.md](./RELEASE-POLICY.md): mandatory main-only release and tagging rules
- [HOTFIX.md](./HOTFIX.md): mandatory emergency hotfix rules
- [PR-POLICY.md](./PR-POLICY.md): mandatory PR scope, review, and merge rules
- [CONTRIBUTOR-PROMPT.md](./CONTRIBUTOR-PROMPT.md): copy-paste-ready contributor onboarding prompt
- [REPO-INGESTION.md](./REPO-INGESTION.md): deterministic repo startup checklist
- [DEFINITION-OF-READY.md](./DEFINITION-OF-READY.md): start gate for issues
- [DEFINITION-OF-DONE.md](./DEFINITION-OF-DONE.md): finish gate for PR-ready work
- [FRONTEND-PRIMITIVES.md](./FRONTEND-PRIMITIVES.md): shared primitive reuse guidance
- [OPEN-SOURCE-ONBOARDING.md](./OPEN-SOURCE-ONBOARDING.md): public OSS contributor entry path
- [FIRST-PR.md](./FIRST-PR.md): first PR guidance
- [FIRST-ISSUES.md](./FIRST-ISSUES.md): good first issue expectations
- [CONTRIBUTION-TYPES.md](./CONTRIBUTION-TYPES.md): accepted contribution categories
- [SUPPORT.md](./SUPPORT.md): where and how to ask for help
- [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md): simplified repo and architecture map
- [RECOGNITION.md](./RECOGNITION.md): contributor recognition expectations

### Team and process

- [TEAM.md](./TEAM.md): team roles, anti-silo workflow, ownership model
- [../CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md): community behavior and private reporting path
- [adr/README.md](./adr/README.md): ADR index

## Maintenance Rule

If a decision changes how the team works, how the product is explained, or how implementation should proceed, the relevant document should be updated instead of leaving that decision only in chat or memory.
