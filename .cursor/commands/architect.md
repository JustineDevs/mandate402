# Command: architect

## 1. Purpose

Run a **structured architecture pass**: repo understanding, layer map, patterns, phased plan, risks, next inspections.

## 2. When to use

Major refactors, new subsystem design, or executive-style technical review.

## 3. Read first

- `AGENTS.md`
- `docs/README.md`
- `docs/architecture/SYSTEM_DESIGN.md`
- `docs/product/STATUS.md`
- `docs/process/WORKFLOW.md`

## 4. Expected output

Sections: (1) Repo understanding (2) Orchestration map (3) File-to-pattern mapping (4) Target shape (5) Phased plan (6) Leverage wins (7) Anti-patterns (8) Next inspections.

## 5. Guardrails

Prefer extraction over rewrite. Every recommendation ties to a **path**. No generic advice blocks.

## 6. Stop conditions

Stop if critical entrypoints cannot be found; output evidence gap list instead of inventing structure.
