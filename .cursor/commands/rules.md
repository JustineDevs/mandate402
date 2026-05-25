# /rules

Mandatory Rules followed guide for operation and development

# Mandatory Pre-Action (No Exceptions)

**Treat this as mandatory. No task is too small to skip it.**

Before running any other tool or writing any code or answer that implements a user request:

1. **First:** Check `AGENTS.md` and any deeper scoped `AGENTS.md` files relevant to the task so your actions align with project standards.
2. **Second:** Check `docs/README.md` and the relevant repo docs under `docs/architecture/`, `docs/product/`, `docs/process/`, `docs/community/`, and `docs/reference/`.
3. **Third:** Review `.agents/skills/` and identify mandatory Mandate402 skill docs that apply. Read the relevant `SKILL.md` and supporting references.
4. **Fourth:** Check `docs/adr/` and `.omx/plans/` when the task depends on tracked design decisions, workflow boundaries, or approved implementation plans.
   - If the task asks about release expectations, version bumps, roadmap staging, or when work qualifies for `v1.0.0`, use `.omx/plans/release-ladder.md` as the local canonical version ladder instead of restating that ladder across multiple plan files.
5. **Fifth:** Check `.cursor/commands/*` and identify which command lenses are applicable to the task. Treat them as mandatory execution checklists, not optional prose.
6. **Then:** Proceed with your reply or implementation using those resources.

## Mandatory Post-Change / Pre-PR Enforcement

After making any meaningful change (bug fix, feature, hot-fix, refactor, hardening, release-prep), the agent must execute every applicable command surface under `.cursor/commands/*`, plus the matching `.agents/skills/*` guidance, before calling the work complete or preparing a PR.

At minimum:

- `ZSPS.md`
  - always
- `trace.md`
  - for changed pages, routes, workers, or data-flow surfaces
- `stress.md`
  - for runtime, auth, store, vendor, worker, or deployment-shape changes
- `security.md`
  - for auth, tokens, secrets, internal routes, logging, path handling, or release safety
- `sadpath.md`
  - for failure-path validation and non-happy-path behavior
- `engineer.md`
  - for broad app/system hardening or pre-push audits

If a command file is not applicable, the agent must say why rather than silently skipping it.

The same rule applies to `.agents/skills/*`:

- choose the lane skill before edits
- apply the relevant overlay skills before verification

Before PR or push readiness, the agent must verify that all changed:

- routes
- pages
- components

are real, wired, production-truthful, and not fake / stubbed / partial.

If a surface cannot be fully real, it must be removed from the live route tree or explicitly downgraded so it cannot be mistaken for production functionality.

**Enforcement:** Your first actions in the conversation must be steps 1–5 when the user asks you to do something (implement, create, fix, plan). Do not run unrelated tools or write code before completing this check. If the task is trivial (e.g. "what is 2+2"), you may skip; for any coding, planning, or project task, do the check first.

This rule works together with `AGENTS.md`; together they require that repository guidance and Mandate402 skill/docs surfaces are consulted before action.
