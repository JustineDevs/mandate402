# Repository Ingestion Checklist

This document is for any human or AI contributor who needs a deterministic startup sequence before touching the repo.

## Mandatory Ingestion Steps

1. Read [AGENTS.md](../AGENTS.md).
2. Read [WORKFLOW.md](./WORKFLOW.md).
3. Read [BRANCHING.md](./BRANCHING.md).
4. Read [LANES.md](./LANES.md).
5. Read [AI-POLICY.md](./AI-POLICY.md).
6. Read [TEAM.md](./TEAM.md).
7. Read [adr/README.md](./adr/README.md).
8. Open the linked issue.
9. Confirm:
   - owner
   - lane
   - acceptance criteria
   - out of scope
10. Identify the directories you may edit.
11. Identify the directories you must not edit.
12. Sync from latest `main`.

## Must Confirm Before Coding

- Which lane owns this work?
- Is a design handoff required?
- Is this a high-risk change?
- Which ADRs govern the task?
- Which shared primitives already exist?

## Must Not Skip

- issue review
- lane confirmation
- branch creation
- sync from `main`
- review of shared primitives before creating new ones
