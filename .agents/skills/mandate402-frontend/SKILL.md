---
name: mandate402-frontend
description: Load when changing Mandate402 frontend pages, components, visual states, responsive behavior, landing layout, or UI polish and you need strict project-specific implementation rules for stack, tokens, page scope, accessibility, performance, and lane ownership.
---

# Mandate402 Frontend

## Compatibility

Compatible with the current Mandate402 frontend stack:

- Next.js 15 App Router
- React 19
- TypeScript
- repo-local component surfaces under `src/components`
- design rules from `docs/design-tokens.md`
- wireframe contract from `docs/adr/ADR-0002-sherwin-ui-wireframe-task.md`

## Load Strategy

This skill is the default frontend execution surface for Mandate402.

Load it when the task involves:

- landing page layout
- dashboard layout
- forms or operator flows
- page responsiveness
- modal / drawer / popover behavior
- trust-critical UI states
- frontend polish, cleanup, or implementation

If the task is mostly visual interpretation or scope clarification, also read Sherwin’s ADR and stop to align before editing.

## Progressive Disclosure

Read only what the task needs:

- `references/tokens-and-layout.md`
  Use for palette, spacing, typography, landing-page split rules, and component language.
- `references/surfaces-and-states.md`
  Use for page inventory, modal/popover scope, responsive behavior, and trust-critical state coverage.
- `TESTS.md`
  Use as the golden query set to validate whether the skill actually covers the expected frontend work.

## Workflow

### 1. Plan

Before editing:

- identify the surface: landing, dashboard, mandate, policy, system health, vendor, receipt, or modal/popover
- identify the owner lane: Sherwin, Edward, John, or Justine review boundary
- identify whether the task is:
  - layout
  - state behavior
  - responsiveness
  - visual polish
  - component extraction
- list the trust-critical states the UI must represent honestly

### 2. Validate Against Project Rules

Check the plan against these constraints:

- do not widen runtime semantics
- do not invent backend truth in the UI
- do not fork shared primitives by lane
- do not hide blocked, degraded, or unknown states
- do not introduce random colors, fonts, or component systems

### 3. Execute

Implement in this order:

1. page or component structure
2. state rendering
3. responsive behavior
4. visual polish
5. accessibility cleanup

### 4. Verify

At minimum run:

- `pnpm exec biome check <changed-files>`
- `pnpm exec eslint <changed-files>`
- `pnpm typecheck`
- relevant `vitest` tests if behavior changed
- `pnpm build` for larger composition changes

Also verify manually or visually:

- desktop layout
- mobile layout
- destructive flows
- degraded or blocked states
- empty and loading states

## Frontend Rules

### Layout

- landing hero uses an asymmetric two-column split
- right column holds logo, CTA, tagline, ecosystem row
- left column holds auth / operator-entry UX
- use generous gutter and whitespace
- use alternating content blocks below the hero to avoid monotony

### Visual Language

- treat Mandate402 as a treasury control plane, not a consumer dashboard
- use green for action and approval, not broad decorative fill
- keep dark control bands for trust and proof surfaces
- keep cards, badges, pills, tables, and timeline patterns consistent

### Behavioral Truth

- `execution_unknown` must remain visible and unresolved
- blocked reasons must remain inspectable
- receipt evidence must stay separate from financial outcome
- chain truth and projected truth must not be silently conflated
- worker backlog and degraded runtime states must be explainable

## Gotchas

Common frontend failure modes in this repo:

- turning blocked or degraded states into generic neutral UI
- designing a generic SaaS landing page instead of a treasury control surface
- duplicating card systems or table shells across lanes
- adding frontend-only fake data to runtime views
- compressing dense operator surfaces too aggressively on tablet/mobile
- making destructive flows implicit instead of explicit

## Negative Examples

Bad:

- “show success styling because the attempt probably succeeded”
- “hide the unknown state until the worker finishes”
- “add a new visual badge system just for the policy page”
- “use default system font and random purple accent because it looks modern”

Good:

- surface `execution_unknown` clearly with next-step affordance
- reuse the shared badge or card pattern
- keep layout intent aligned to the Sherwin ADR
- show degraded or missing runtime dependencies honestly

## Human Escalation

Escalate instead of inventing behavior when:

- the wireframe contract is missing a trust-critical state
- a layout change would cross Edward/John lane boundaries
- the UI implies a new backend or chain semantic
- a modal, drawer, or popover decision changes product behavior

## Completion Bar

A frontend task is complete only when:

- it matches the approved surface or a documented extension
- responsive behavior is intentional
- accessibility basics hold
- trust-critical states are visible and honest
- lane ownership is preserved
- required checks pass
