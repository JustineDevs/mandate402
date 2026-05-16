# Agentic Velocity Progress Ledger

> Version: `v0.1.0`

## Active Sprint Engine

### [TEAM-OPS-001] Team Structure & Anti-Silo Workflow

- Intent Owner: `Justine`
- Status: `[READY]`
- Context Anchors:
  - Team contract: [`docs/TEAM.md`](./docs/TEAM.md)
  - Team structure config: [`team-structure.yml`](./team-structure.yml)
  - Agentic workflow: [`agentic-workflow.yml`](./agentic-workflow.yml)

- Working lane:
  - `Justine`: scope, review, release criteria
  - `Sherwin`: wireframes, layout intent, design system
  - `Edward`: repo audit, frontend implementation, responsive wiring

## Guardrails & Conflict Management

### 1. The 15-Minute Rule

If an AI-assisted implementation gets stuck in a repeated error-fix loop for more than `15 minutes`, the human owner must:

1. stop the loop
2. stash or discard the unstable branch of work
3. tighten the prompt or scope boundaries
4. restart from a cleaner context

### 2. Context Isolation

AI tools should be scoped to the relevant directory whenever possible.

Examples:

- Edward UI work: `src/components/`, `src/app/`, relevant styles
- Justine infra work: workflow, config, backend, release, contracts where needed
- Sherwin design artifacts: docs, design tokens, mockups, references

### 3. Human Gates

No task is considered complete until:

- design context is attached
- code is reviewed
- relevant checks pass
- Justine signs off for merge
