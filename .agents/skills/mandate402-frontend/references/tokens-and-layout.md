# Tokens and Layout Reference

Use this file only when the task needs concrete frontend design values.

## Core Visual Identity

Mandate402 should feel like:

- a treasury command center
- an operator control plane
- a policy and audit surface
- a chain-aware runtime console

Avoid:

- consumer neobank styling
- playful crypto aesthetics
- generic startup gradients

## Palette Anchors

Primary tokens from `docs/design-tokens.md`:

- `brand-control-deep`
- `brand-control`
- `brand-control-mid`
- `brand-green`
- `brand-green-dark`
- `semantic-success-*`
- `semantic-warning-*`
- `semantic-blocked-*`

Rules:

- green is the main action signal
- dark control surfaces frame trust and proof
- blocked/warning/success must be clearly distinct

## Typography

- `font-primary` for general UI
- `font-mono` for proof, ledger, references, runtime traces

## Spacing

Use the documented spacing scale:

- `space-md`
- `space-lg`
- `space-xl`
- `space-section`
- `space-section-lg`

Do not over-compress control-plane surfaces.

## Landing Layout Rules

Hero split:

- `60/40` or `70/30`
- right column: logo, CTA, tagline, ecosystem row
- left column: auth / operator-entry UX
- gutter: `16px` to `32px`
- large whitespace and padding

Below hero:

- alternate text/visual blocks
- maintain scan flow
- keep CTAs near the core value proposition

## Component Shape

Prefer:

- pill CTAs
- `rounded-lg` cards
- `rounded-full` action buttons
- controlled tables
- explicit timeline blocks

Avoid:

- square low-intent controls
- one-off component families
