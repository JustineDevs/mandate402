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
5. **Then:** Proceed with your reply or implementation using those resources.

**Enforcement:** Your first actions in the conversation must be steps 1–4 when the user asks you to do something (implement, create, fix, plan). Do not run unrelated tools or write code before completing this check. If the task is trivial (e.g. "what is 2+2"), you may skip; for any coding, planning, or project task, do the check first.

This rule works together with `AGENTS.md`; together they require that repository guidance and Mandate402 skill/docs surfaces are consulted before action.
