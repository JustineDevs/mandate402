# Frontend Primitives

This document defines the shared frontend primitives that John and Edward must reuse instead of duplicating.

## Shared Primitive Classes

- cards
- badges
- tables
- pills
- form controls
- layout shells
- status chips
- section headers

## Implemented primitives (v0.1.1)

| Primitive | Path | Use |
|-----------|------|-----|
| `ConsoleCard` | `src/components/console-card.tsx` | Metric tiles and summary cards in console grids |
| `ConsoleCodeSurface` | same | Logs, receipts, runtime JSON — `canvas-dark` only |
| `SectionHeader` | `src/components/section-header.tsx` | In-page section title + description + actions |
| `CategoryAccentChip` / `CategoryLegend` | `src/components/category-accent.tsx` | Governance / payments / compliance / agents lane chips |
| `AppBreadcrumbs` | `src/components/app-breadcrumbs.tsx` | Full-page entity wayfinding (e.g. mandate detail) |
| `GlobalSearchDialog` | `src/components/global-search.tsx` | ⌘K route index; extend with `extraItems` for entities |
| `OverlayModal` / `OverlayDrawer` | `src/components/overlay-primitives.tsx` | Variants, focus trap, Escape, backdrop close |
| `ConsoleShell` | `src/components/console-shell.tsx` | Mobile nav drawer, optional `heroTone`, `searchExtraItems` |
| `TopNav` | `src/components/top-nav.tsx` | Environment strip, page filter, global search, wallet |
| `SidebarNavPanel` | `src/components/sidebar.tsx` | Reused inside mobile drawer |

## Rule

If a new frontend need can be satisfied by extending a shared primitive, do that instead of creating a second local version in another lane.

## Lane Reminder

- John owns transactional UI
- Edward owns observability/presentation UI

But neither lane owns a private duplicate primitive system.

## Escalate When

- a primitive change affects both lanes
- a shared component needs a new state or style variant
- design intent and implementation convenience conflict
