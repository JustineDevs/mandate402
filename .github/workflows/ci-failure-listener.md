---
name: "CI Failure Listener"
description: "Analyze completed CI and API Smoke workflow runs for pull requests and comment a concise diagnosis on the related PR when they fail."
on:
  workflow_run:
    workflows: ["CI", "API Smoke"]
    types: [completed]
    branches:
      - main
      - development
      - "integration/**"
      - "feat/**"
      - "fix/**"
      - "chore/**"
      - "docs/**"
      - "ui/**"
  github-token: ${{ secrets.GH_TOKEN }}
engine: copilot
permissions:
  contents: read
  actions: read
  issues: read
  pull-requests: read
tools:
  github:
    github-token: ${{ secrets.GH_TOKEN }}
    toolsets: [actions, pull_requests, issues, repos]
safe-outputs:
  github-token: ${{ secrets.GH_TOKEN }}
  add-comment:
    target: "*"
    max: 1
    discussions: false
    footer: false
    hide-older-comments: true
    allowed-reasons: [outdated]
---

# CI Failure Listener

Listen for completed `CI` and `API Smoke` workflow runs and help maintainers react quickly when they fail.

Required behavior:

1. Only act for workflow runs that are tied to a pull request in this repository.
2. If the triggering run concluded with `success`, produce `noop`.
3. If the triggering run concluded with `failure`, `cancelled`, `timed_out`, or `action_required`:
   - inspect the run, jobs, and failing step logs
   - identify the most likely root cause from the logs, not from guesswork
   - summarize only the highest-signal failing job(s)
   - provide one concise next-step fix suggestion grounded in the logs
4. Post exactly one top-level comment on the related pull request with:
   - workflow name
   - run URL
   - failing job name(s)
   - first failing step
   - root-cause summary
   - suggested next fix

Constraints:

- Do not create issues, labels, PRs, commits, or reviews.
- Do not restate green jobs unless they help narrow the failure.
- Do not speculate when logs are incomplete; say that the logs were insufficient.
- Prefer file paths, commands, and exact error strings when present.

Output policy:

- If no PR is associated, output `noop`.
- If the run succeeded, output `noop`.
- If the run failed and you have enough evidence, output one `add-comment` safe output for the related PR.
