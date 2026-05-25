# Mandate402 Scrum Model

This document defines how Mandate402 uses Scrum-style planning in a way that
fits the repository’s issue-first, lane-owned workflow.

## Why Scrum Here

Mandate402 is not a generic SaaS project. It mixes:

- operator UX
- backend trust boundaries
- worker execution
- chain integration
- release-safety work

That means the team needs short, inspectable delivery loops rather than long
undifferentiated build phases.

## Scrum Units

### Product backlog

The product backlog is represented by:

- roadmap issues
- hardening issues
- release-specific issues
- ADR follow-up work

### Sprint backlog

A sprint backlog is the set of issue-scoped work the team commits to during a
bounded sprint window.

### Increment

A sprint increment is whatever repo state can be honestly reviewed and merged
through the existing workflow:

`Issue -> Scope -> Design/Tech Clarification -> Branch -> PR -> CI -> Merge`

## Roles Mapped To The Team

### Product owner / release authority

- Justine (`@JustineDevs`)

### Design authority

- Sherwin (`@owenlim225`)

### Frontend lanes

- John (`@bam841`) for transactional UI
- Edward (`@automatewithedward`) for observability/read-heavy UI

## Sprint Expectations

Each sprint should define:

- sprint goal
- included issues
- owners and lane guardians
- acceptance criteria
- non-goals
- review gates

## Definition Of Ready

An issue is sprint-ready only when:

- the problem is clear
- the goal is explicit
- labels and lane are correct
- acceptance criteria exist
- dependencies are known
- design or ADR references are linked if needed

## Definition Of Done

A sprint issue is done only when:

- code or docs are implemented
- required checks are run
- review is complete
- issue body and PR reflect what actually changed

## Recommended Sprint Artifacts

- `docs/planning/SPRINT-YYYY-MM-DD-to-YYYY-MM-DD.md`
- GitHub milestone
- GitHub Project board alignment
- linked issues with semantic labels
