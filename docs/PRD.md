# Mandate402 PRD Standard

This document defines the **mandatory Product Requirements Document format** for Mandate402.

It is not a generic PRD template. It is specifically for this repository, this team, and this release model.

## Purpose

Use a PRD when a change is too important to be described safely by a short issue alone.

For Mandate402, a PRD exists to stop these failure modes:

- vague scope
- mixed-lane execution
- design and implementation drifting apart
- release-impact changes being hidden inside ordinary issues
- AI agents widening work without an explicit approval boundary

## When a PRD Is Mandatory

Open a PRD when the change:

- affects multiple lanes
- changes product behavior materially
- changes runtime semantics
- changes deployment or release posture
- changes auth, infra, contracts, treasury logic, or vendor policy
- introduces a new feature family
- spans more than one coherent issue

Examples:

- replacing shared operator auth with Supabase Auth
- moving persistence from SQLite to Postgres
- introducing worker-owned reconciliation
- changing release policy or `main` branch behavior

Examples that usually **do not** need a PRD:

- docs typo fix
- single isolated UI card tweak
- one small test fix
- issue-template copy update

## Mandatory PRD Sections

Every PRD must contain the following sections in this order.

### 1. Metadata

Required fields:

- title
- owner
- supporting lanes
- target sprint
- target release or version
- status

### 2. Problem

State:

- what is broken or missing
- who it affects
- why it matters now
- why an issue alone is insufficient

### 3. Goal

State:

- what should be true after the work lands
- what the desired user, operator, or system outcome is

Good goal example:

> Production mode refuses demo auth, demo anchor fallback, and SQLite persistence so Mandate402 can be deployed with a real operator boundary.

### 4. In Scope

List:

- affected modules
- affected routes
- affected docs
- affected lanes

Be concrete. Name files, surfaces, or runtime boundaries when possible.

### 5. Out of Scope

This section is mandatory.

It prevents the team from silently widening the change.

Example:

- does not implement worker-owned reconciliation yet
- does not redesign operator UI
- does not change contract semantics beyond config validation

### 6. Users / Actors

List:

- human roles
- system actors
- lane owners affected

For example:

- operator
- platform admin
- agent
- vendor
- facilitator
- Edward lane
- John lane

### 7. Acceptance Criteria

Every item must be testable.

Do not use vague phrases like:

- better
- cleaner
- more robust
- improved

Use concrete outcomes:

- production rejects `x-operator-token`
- `GET /api/mandates` requires auth
- `pnpm build` passes

### 8. Constraints

Explicitly state:

- technical constraints
- product constraints
- time constraints
- cost constraints
- release constraints

For Mandate402, you should usually include:

- small team
- low budget
- web3-native requirement
- fail-closed requirement
- release through `main` only

### 9. Risks

List the actual risks, not generic boilerplate.

Examples:

- branch overlap
- auth misconfiguration
- release drift
- migration regression
- design/implementation mismatch

### 10. Verification

List the exact commands and evidence expected.

Examples:

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- screenshots
- PR review
- CI green on required checks

### 11. Ownership

State:

- primary owner
- supporting lanes
- final reviewer

This must map to the issue and PR later.

## Mapping to GitHub Issues

A PRD should be decomposed into one or more issues.

Each issue should contain:

- one lane owner
- one narrow outcome
- one branch
- one PR

The PRD is the strategic wrapper.  
The issue is the execution unit.

## Mapping to Scrum

A PRD should also answer:

- should this enter the current sprint?
- what sprint does it belong to?
- does it block release readiness?
- does it require design before implementation?

## Rule

If work is large enough to need a PRD and no PRD exists, the work is not ready.
