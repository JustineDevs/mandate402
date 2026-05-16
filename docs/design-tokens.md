# Mandate402 Design Tokens

This document is for Sherwin and Edward. It turns the visual system into an implementation-friendly token reference instead of leaving it only as descriptive prose.

## Usage Notes

- These values are the `v0.1.0` reference token set for wireframes and frontend implementation.
- The names are the canonical source; the hex values are the initial implementation reference.
- If values change later, update this file and the implementation together.

## Color Tokens

### Brand and accent

| Token | Value | Use |
|---|---|---|
| `brand-green` | `#22C55E` | Primary CTA, approval state, active success signal |
| `brand-green-dark` | `#15803D` | Pressed CTA state, active links, stronger approval emphasis |
| `brand-green-mid` | `#34D399` | Supporting accents and lighter green transitions |
| `brand-green-soft` | `#ECFDF3` | Pale mint featured surfaces and positive soft states |
| `brand-control-deep` | `#062B33` | Control-room hero bands, dark trust surfaces |
| `brand-control` | `#0F5B6B` | Mid-tone control accent |
| `brand-control-mid` | `#178099` | Highlighted platform and showcase surfaces |

### Category accent

| Token | Value | Use |
|---|---|---|
| `accent-governance` | `#6D5BD0` | Governance and permissions tags |
| `accent-payments` | `#F59E0B` | Payments and settlement tags |
| `accent-compliance` | `#D64545` | Compliance and audit tags |
| `accent-agents` | `#2F7FF7` | Agent and orchestration tags |

### Surface

| Token | Value | Use |
|---|---|---|
| `canvas` | `#FFFFFF` | Primary page background and standard card surface |
| `canvas-dark` | `#0B1620` | Code panels, policy logs, receipt surfaces |
| `surface` | `#F7FAF9` | Subtle section background |
| `surface-soft` | `#F2F6F5` | Quiet section-break background |
| `surface-feature` | `#ECFDF3` | Featured pricing or highlighted positive sections |
| `hairline` | `#E4ECE9` | Default border |
| `hairline-soft` | `#EDF3F1` | Low-contrast divider |
| `hairline-strong` | `#C7D5D0` | Stronger boundaries and inputs |
| `hairline-dark` | `#26434A` | Borders on dark surfaces |

### Text

| Token | Value | Use |
|---|---|---|
| `ink` | `#0F1720` | Primary headline and body text |
| `charcoal` | `#1F2937` | Emphasized body text |
| `slate` | `#475569` | Secondary text |
| `steel` | `#64748B` | Tertiary text and captions |
| `stone` | `#94A3B8` | Muted labels |
| `muted` | `#A8B3BD` | Disabled and placeholder text |
| `on-dark` | `#F8FAFC` | White text on dark surfaces |
| `on-dark-muted` | `#C9D6DC` | Muted text on dark surfaces |

### Semantic

| Token | Value | Use |
|---|---|---|
| `semantic-success-bg` | `#ECFDF3` | Positive surface |
| `semantic-success-text` | `#166534` | Positive text |
| `semantic-warning-bg` | `#FFF7E6` | Warning surface |
| `semantic-warning-text` | `#B45309` | Warning text |
| `semantic-blocked-bg` | `#FEF2F2` | Blocked or denied surface |
| `semantic-blocked-text` | `#B42318` | Blocked or denied text |

## Typography Tokens

### Font families

| Token | Value | Use |
|---|---|---|
| `font-primary` | `Sora, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Main UI typography |
| `font-mono` | `"IBM Plex Mono", "SF Mono", Menlo, Consolas, monospace` | Policy logs, receipts, references |

### Type scale

| Token | Value | Use |
|---|---|---|
| `hero-display` | `72px / 600 / 1.08 / -1.6px` | Hero headline |
| `display-lg` | `56px / 600 / 1.12 / -1px` | Major section opener |
| `heading-1` | `48px / 600 / 1.18 / -0.5px` | Page-level headline |
| `heading-2` | `36px / 600 / 1.22 / -0.4px` | Section headline |
| `heading-3` | `28px / 600 / 1.28 / 0` | Card title |
| `heading-4` | `22px / 600 / 1.34 / 0` | Feature tile title |
| `heading-5` | `18px / 600 / 1.40 / 0` | Small card title |
| `subtitle` | `18px / 400 / 1.55 / 0` | Lead copy |
| `body-md` | `16px / 400 / 1.58 / 0` | Standard body text |
| `body-sm` | `14px / 400 / 1.52 / 0` | Secondary body text |
| `body-sm-medium` | `14px / 500 / 1.50 / 0` | Buttons, nav, emphasis |
| `caption-bold` | `13px / 600 / 1.40 / 0` | Labels and badges |
| `micro-uppercase` | `11px / 700 / 1.40 / 1px` | Eyebrows and tags |
| `button-md` | `14px / 600 / 1.30 / 0` | Button label |
| `code-md` | `14px / 400 / 1.55 / 0` | Ledger or terminal copy |

## Radius Tokens

| Token | Value | Use |
|---|---|---|
| `rounded-xs` | `4px` | Micro tags |
| `rounded-sm` | `6px` | Chips and small badges |
| `rounded-md` | `8px` | Inputs and code blocks |
| `rounded-lg` | `12px` | Cards and default panels |
| `rounded-xl` | `16px` | Large feature panels |
| `rounded-xxl` | `24px` | Showcase panels |
| `rounded-full` | `9999px` | Buttons and pills |

## Spacing Tokens

| Token | Value | Use |
|---|---|---|
| `space-xxs` | `4px` | Fine spacing |
| `space-xs` | `8px` | Tight UI spacing |
| `space-sm` | `12px` | Small gaps |
| `space-md` | `16px` | Standard component padding |
| `space-lg` | `24px` | Card padding |
| `space-xl` | `32px` | Section-internal spacing |
| `space-xxl` | `48px` | Large content spacing |
| `space-section` | `64px` | Standard section gap |
| `space-section-lg` | `96px` | Marketing-section gap |
| `space-hero` | `120px` | Hero spacing |

## Component Defaults

| Token | Value | Use |
|---|---|---|
| `button-primary-bg` | `brand-green` | Primary CTA |
| `button-primary-radius` | `rounded-full` | Primary CTA shape |
| `button-secondary-border` | `hairline-strong` | Secondary action border |
| `card-default-bg` | `canvas` | Standard card |
| `card-default-radius` | `rounded-lg` | Standard card shape |
| `code-surface-bg` | `canvas-dark` | Policy and ledger surfaces |

## Implementation Rule

- Sherwin should design against these names and values.
- Edward should prefer implementing the token names as CSS variables or equivalent shared constants instead of scattering raw values.
