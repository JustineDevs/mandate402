# Mandate402 Scrum Model

This is the **actual small-team Scrum model** for Mandate402.

It is designed for:

- Justine
- Sherwin
- Edward
- John
- AI-augmented execution

It is intentionally strict on scope and loose on ceremony overhead.

## Sprint Length

Recommended default:

- **1 week** when the team is moving quickly
- **2 weeks** only when the scope is unusually large or infrastructure-heavy

For the current stage of Mandate402, one-week sprints are preferred because:

- the product is still moving fast
- branch drift becomes expensive
- AI-assisted output can make stale planning dangerous quickly

## Sprint Roles

### Justine

Role:

- sprint owner
- backlog priority owner
- final integration/release reviewer

Responsibilities:

- choose sprint goal
- decide what enters the sprint
- reject not-ready work
- keep architecture and release boundaries coherent

### Sherwin

Role:

- design readiness owner

Responsibilities:

- produce wireframe or design handoff for UI work
- clarify visual states before frontend implementation starts

### Edward

Role:

- transactional UI sprint implementer

Responsibilities:

- implement action-heavy frontend work
- preserve API/runtime semantics

### John

Role:

- observability/presentation sprint implementer

Responsibilities:

- implement dashboard/read-heavy frontend work
- preserve shared primitive consistency

## Sprint Stages

### 1. Sprint Planning

Required outputs:

- sprint goal
- list of included issues
- owner per issue
- lane per issue
- dependencies called out
- blocked/not-ready issues excluded

### 2. Sprint Execution

Rules:

- no work without issue ownership
- no “while I’m here” scope creep
- no branch without issue
- no frontend work without Sherwin handoff where visual changes are involved

### 3. Mid-Sprint Check

Recommended for active weeks.

Ask:

- what is blocked?
- what widened?
- what needs design clarification?
- what risks release?

### 4. Sprint Review

At end of sprint:

- review completed issues
- review blocked issues
- review what should move to next sprint

### 5. Sprint Retrospective

Mandatory questions:

- what created rework?
- what slowed down reviews?
- where did AI help?
- where did AI create confusion?
- which docs/process rules need adjustment?

## Sprint Entry Rules

An issue can enter a sprint only if:

- it meets Definition of Ready
- it has one owner
- it has one lane
- acceptance criteria exist
- design exists if needed

## Sprint Exit Rules

An issue is counted as done only if:

- it meets Definition of Done
- the PR is reviewed
- checks are green
- it is either merged or explicitly deferred with reason

## Anti-Scrum Failure Modes to Avoid

- too many issues in flight
- vague sprint goal
- cross-lane issues with no primary owner
- design not ready before frontend starts
- AI-generated code ahead of clarified issue scope

## Scrum Rule

Mandate402 uses Scrum to keep the backlog disciplined, not to create ceremony for its own sake.
