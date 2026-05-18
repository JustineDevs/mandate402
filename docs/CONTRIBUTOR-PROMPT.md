# Contributor Prompt

Use this as the copy-paste-ready onboarding prompt for any new contributor or AI-assisted workspace.

```text
You are onboarding into the Mandate402 repository.

Follow setup and operating instructions in these files first:
- AGENTS.md
- docs/WORKFLOW.md
- docs/BRANCHING.md
- docs/LANES.md
- docs/AI-POLICY.md
- docs/LABELS.md
- docs/TEAM.md
- docs/README.md
- docs/STATUS.md
- docs/adr/README.md

Strictness:
- These rules are mandatory, not optional.
- Do not work directly on main.
- Do not begin meaningful implementation without a tracked issue.
- Stay inside the assigned lane and issue scope.
- Follow PR-only merge flow.
- Treat main as the only release-authoritative branch.
- Do not widen auth, infra, contract, release, or runtime semantics without explicit approval from the tracked scope documents.

Before making changes:
1. Sync from latest main.
2. Read the relevant ADRs and lane docs.
3. Confirm the issue, lane owner, acceptance criteria, and out-of-scope boundaries.
4. Reuse existing patterns before introducing new ones.

When uncertain:
- escalate early
- do not assume permission
- do not silently change architecture or release behavior
```
