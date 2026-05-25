# UI system (Mandate402)

This document records the **implemented** UI stack after the shadcn UI rollout. MCP catalogs (Cult UI, Kokonut UI, React Bits, UI Layouts, Untitled UI) remain **reference sources** for future components; only the items below are vendored into the repo.

## What is installed

| Layer | Role |
|-------|------|
| **shadcn (base-nova preset)** | `components.json` + `@/components/ui/*` built on **Base UI** + **CVA** + **tw-animate-css** + `shadcn/tailwind.css`. |
| **Design tokens** | Mandate402 greens / surfaces in `src/app/globals.css`; shadcn semantic variables (`--primary`, `--ring`, …) are **mapped** to those tokens in `:root`. |
| **Landing entrance** | **CSS** `landing-reveal` in `globals.css` — `LandingReveal` is a plain `div` (no `motion` SSR/CSR drift). Global `prefers-reduced-motion` shortens animations. **Operator access** on the home column is a single CTA to `/operator` (no logo in `LandingSignInPanel`); Supabase sign-in uses the shadcn **login-01**-aligned `OperatorLoginForm` inside `OperatorGate`, with the official **`mandate402_nav_header(black).png`** mark centered above the fields. **Registration** lives at **`/operator/sign-up`** (`OperatorSignUpWorkspace` + `OperatorSignUpForm`). |
| **lucide-react** | Icons for shadcn primitives (`^0.468.x` line). |
| **Landing ambient** | `SubtleDotGrid` — CSS radial-gradient “dot field” (React Bits DotGrid–style) without WebGL or extra shader deps. |
| **KPI depth (Tier A motion)** | `.spotlight-surface` in `globals.css` — lightweight hover sheen on `KpiCard` (no GSAP / ogl). Disabled under `prefers-reduced-motion`. |

## Primitives added (`pnpm dlx shadcn add …`)

`button`, `input`, `label`, `card`, `badge`, `separator`, `skeleton`, `tabs`, `dialog`, `sheet`, `dropdown-menu`, `tooltip`, `table`, `accordion`.

## Where it is wired

- **Root** — `TooltipProvider` wraps `#main-content` in `src/app/layout.tsx`.
- **Landing** — `src/app/page.tsx` uses `SubtleDotGrid` + `LandingReveal` per column.
- **Console shell** — mobile nav uses **Sheet** (`src/components/console-shell.tsx`) instead of a bespoke overlay. Optional **`toolbar`** row below the hero (Untitled-style pilot). **Auth** — routes under `src/app/(console)/` use **`ConsoleAuthGate`** (Supabase session); unauthenticated visits redirect to `/operator` with a **sanitized** `next` query (`src/lib/auth/safe-operator-next-path.ts`).
- **Vendors** — `toolbar` with filter/export chips; **`SubtleDotGrid`** ambient behind main content (`src/app/vendors/page.tsx`); registry grid uses **Card** + **Table**.
- **Transactions / Policies / Receipts** — same **Card** + **Table** shell as dashboard; **toolbar** row for status/export chips (transactions, receipts) or rule actions (policies). **Policies** adds **Accordion** for operator-reference copy below the ledger.
- **Mandate detail** — **Tabs** (`Snapshot` / `Activity`) in `src/components/mandate-detail-view.tsx` so the hero card and timeline are not stacked in one scroll lane.
- **Dashboard** — dense operator view uses **Card**, **Table**, **Input**, **Label** (`src/components/dashboard.tsx`). Morph anchors table **guards** missing mandate (fixes empty-state crash).
- **Section headers** — `SectionHeader` supports optional **`eyebrow`** and **`meta`** for Untitled-style dense page sections (wired on console table pages above).
- **Create mandate** — `src/components/create-mandate-view.tsx` uses **Card** (with `CardHeader` / `CardDescription`), **Input**, **Label**, **Separator**, native **select** / **textarea** with token-aligned `cn()` field classes, and **Button** for cancel/submit.
- **Agent view** — `src/components/agent-view.tsx` uses **Card** nesting for the mandate panel, **Label** for metadata rows, **Separator** between regions, **Button** on proposed actions, and `divide-y` in the footer tray.

## TypeScript + Base UI

`@base-ui/react` publishes **conditional** `exports` (`import` vs `require`). If `tsc` cannot resolve `@base-ui/react/button` etc., `tsconfig.json` sets `"customConditions": ["require"]` so TypeScript follows the `require` types path. Remove only if upstream fixes the dual-package layout.

## Follow-ups (status)

| Item | Status |
|------|--------|
| **Untitled UI** — page header + toolbar density | **Pilot:** `ConsoleShell` `toolbar` on vendors, transactions, receipts, policies; table pages use **eyebrow** + **meta** on `SectionHeader` where it clarifies the lane. |
| **Kokonut / React Bits / Cult** — one light pattern per surface | **Pilot:** same dot ambient on **Vendors** as landing (CSS only). |
| **UI Layouts** | Reference-only (no extra runtime). |

## Tooltips

- **TopNav** — environment pill, sync label, chain label, wallet, profile (honest placeholder copy).
- **Global search trigger** — route jump + local filter caveat.
- **KPI tiles** — `(i)` uses `Tooltip` when `tooltipText` is set.

## Verification

After `pnpm install` (with build scripts allowed if your org requires them for native bins), run:

`pnpm run ci:all`

On Windows, if `.bin` shims fail, use `pnpm exec` / `node node_modules/<pkg>/...` per your IT policy.
