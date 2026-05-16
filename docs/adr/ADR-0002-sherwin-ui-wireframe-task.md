# ADR-0002: Sherwin UI Wireframe Task for Mandate402 Operator Surfaces

- Status: Accepted
- Date: 2026-05-16
- Owners: Justine (`@JustineDevs`), Sherwin (`@owenlim225`)

## Context

Mandate402 needs a durable design-task artifact for Sherwin so the UI/UX scope is explicit, reviewable, and reusable by Edward during frontend implementation.

The team already agreed on a linear anti-silo flow:

`Justine (Scope)` -> `Sherwin (Wireframe)` -> `Justine (Review)` -> `Edward (Audit & Implement)` -> `Justine (Review & Merge)`

The missing piece is a tracked task-level ADR that captures:

- what Sherwin is being asked to design
- which screens are in scope
- the visual language and operating constraints
- the exact handoff package Edward should implement from

Without this, the wireframe task can drift into generic UI exploration, incomplete mobile treatment, or ambiguous design intent that Edward has to reinterpret later.

## Decision

Sherwin's current UI/UX task will be documented in this ADR as the official wireframe brief for the Mandate402 operator-facing MVP surfaces.

## Sherwin Task Definition

Sherwin is responsible for producing the wireframe and interaction-intent package for the following surfaces:

1. main dashboard
2. create mandate screen
3. mandate detail page
4. agent view
5. mobile-friendly simplified layout

The task is to turn these product surfaces into a coherent, high-trust control-plane design that Edward can implement without having to invent layout logic or visual hierarchy from scratch.

## Deliverables

Sherwin's expected output includes:

- high-fidelity wireframes or equivalent polished layout mocks
- desktop and mobile intent
- component state intent where relevant
- visual hierarchy and spacing guidance
- button, table, card, and status treatment guidance
- notes for any interaction behavior that is not obvious from static layouts

The output must be implementable by Edward with minimal reinterpretation.

## In-Scope Screens

The following ASCII layouts are the canonical reference layouts for this task.

Rules for use:

- preserve the information hierarchy and relative grouping shown below
- treat each block as a monospace wireframe reference, not prose
- keep Edward's implementation aligned to these structures unless Justine approves a scope change
- if Sherwin improves the presentation, the underlying layout intent should still map back to these blocks

### 1. Main Dashboard

```text
+--------------------------------------------------------------------------------------------------+
| Mandate402                                                   [Search]        [Wallet] [Profile] |
+----------------------+--------------------------------------------------------------------------+
| Sidebar              | Overview                                                                 |
|----------------------|--------------------------------------------------------------------------|
| Dashboard            | +------------------+ +------------------+ +------------------+          |
| Mandates             | | Active Mandates  | | Spend Today      | | Policy Blocks    |          |
| Agents               | | 12               | | $1,248           | | 7                |          |
| Vendors              | +------------------+ +------------------+ +------------------+          |
| Transactions         |                                                                          |
| Policies             | +--------------------------------------------------------------+         |
| Receipts             | | Spend by Agent                                               |         |
| Settings             | | Agent A  ###########  $420                                   |         |
|                      | | Agent B  #######      $260                                   |         |
|                      | | Agent C  ####         $140                                   |         |
|                      | +--------------------------------------------------------------+         |
|                      |                                                                          |
|                      | +----------------------------------+ +--------------------------------+  |
|                      | | Recent Mandates                  | | Recent Transactions            |  |
|                      | |----------------------------------| |--------------------------------|  |
|                      | | Procurement Agent   Active       | | OpenAI API     $12   Success  |  |
|                      | | Research Agent      Expiring     | | Tavily         $4    Success  |  |
|                      | | Ops Agent           Revoked      | | Vendor X       $18   Blocked  |  |
|                      | +----------------------------------+ +--------------------------------+  |
+----------------------+--------------------------------------------------------------------------+
```

### 2. Create Mandate Screen

```text
+--------------------------------------------------------------------------------------------------+
| Create New Mandate                                                                                |
+--------------------------------------------------------------------------------------------------+
| Mandate Name        [ Procurement - Market Research                                           ]  |
| Assigned Agent      [ Agent Alpha v ]                                                             |
| Task / Purpose      [ Find and purchase research/report/API access                              ] |
|                                                                                                  |
| Budget Type         (•) Fixed Cap   ( ) Usage-Based Ceiling                                      |
| Max Spend           [ $50.00 ]                                                                   |
| Expiry              [ 2026-05-20 ] [ 23:59 UTC ]                                                 |
|                                                                                                  |
| Allowed Vendors                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| | [x] OpenAI API     [x] Tavily     [x] Perplexity API     [ ] Any verified x402 vendor      | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Category Rules                                                                                   |
| [x] Data / Research   [x] AI APIs   [ ] Compute   [ ] Content   [ ] Other                      |
|                                                                                                  |
| Receipt + Audit                                                                                  |
| [x] Require receipt                                                                              |
| [x] Attach payment identifier                                                                    |
| [x] Log Reference Key                                                                            |
|                                                                                                  |
| Risk Controls                                                                                    |
| [x] Block out-of-policy payments                                                                 |
| [x] Manual approval if > $20                                                                     |
| [x] Auto-revoke after expiry                                                                     |
|                                                                                                  |
|                                              [Cancel]                     [Create Mandate]       |
+--------------------------------------------------------------------------------------------------+
```

### 3. Mandate Detail Page

```text
+--------------------------------------------------------------------------------------------------+
| Mandate: Procurement - Market Research                                [Pause] [Revoke] [Edit]   |
+--------------------------------------------------------------------------------------------------+
| Status: Active        Agent: Agent Alpha        Budget Used: $18 / $50        Expires: 2 days   |
+--------------------------------------------------------------------------------------------------+
| Rules Summary                                                                                    |
| - Approved vendors: OpenAI API, Tavily, Perplexity API                                           |
| - Categories: Data / Research, AI APIs                                                           |
| - Per-payment soft limit: $20                                                                    |
| - Receipt required: Yes                                                                          |
+--------------------------------------------------------------------------------------------------+
| Activity Timeline                                                                                 |
|--------------------------------------------------------------------------------------------------|
| 10:42 AM   Quote request to Tavily                         $2        Success                      |
| 10:48 AM   Search API purchase from OpenAI API             $12       Success                      |
| 11:02 AM   Vendor X payment attempt                        $18       Blocked - not allowlisted    |
| 11:15 AM   Receipt exported                                --        Complete                     |
+--------------------------------------------------------------------------------------------------+
| Receipts                                                                                         |
| [Receipt #1842] [Receipt #1843] [Export CSV] [Export PDF]                                        |
+--------------------------------------------------------------------------------------------------+
```

### 4. Agent View

```text
+--------------------------------------------------------------------------------------------------+
| Agent Console: Agent Alpha                                                                        |
+--------------------------------------------------------------------------------------------------+
| Task: Find best market data source and purchase access under policy                              |
|                                                                                                  |
| Current Mandate                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| | Budget Remaining: $32                                                                         | |
| | Allowed Vendors: OpenAI API, Tavily, Perplexity API                                           | |
| | Allowed Until: 2026-05-20 23:59 UTC                                                           | |
| | Policy Status: In Good Standing                                                               | |
| +----------------------------------------------------------------------------------------------+ |
|                                                                                                  |
| Proposed Actions                                                                                 |
| 1. Query Tavily for source shortlist                            Cost: $2         [Run]           |
+--------------------------------------------------------------------------------------------------+
```

### 5. Mobile-Friendly Simplified Layout

```text
+--------------------------------------+
| Mandate402                 [Menu]    |
+--------------------------------------+
| Active Mandates: 12                  |
| Spend Today: $1,248                  |
| Policy Blocks: 7                     |
+--------------------------------------+
| Recent Activity                      |
| - OpenAI API      $12   Success      |
| - Vendor X        $18   Blocked      |
| - Tavily          $4    Success      |
+--------------------------------------+
| [Create Mandate]                     |
+--------------------------------------+
```

## Visual Direction Constraints

Sherwin should keep the Mandate402 brand and product posture aligned with a high-trust operational control system.

### Primary visual direction

- deep control-room teal and graphite hero bands
- bright verification-green pill CTA as the main action signal
- stark white product and documentation surfaces below dark hero regions
- terminal / ledger / policy-engine proof surfaces where relevant

### Color palette

Sherwin should use the Mandate402 palette as part of the task handoff, even if the first deliverable is still wireframe-first.

#### Brand and accent

- Mandate Green: primary CTA, approval state, active success signal
- Mandate Green Dark: active link color, pressed state, strong success emphasis
- Mandate Green Mid: supporting green used in softer accents and gradients
- Mandate Mint Soft: pale mint tint for featured states and positive policy surfaces
- Control Teal Deep: dark hero, footer, control-room surfaces, policy surfaces
- Control Teal: mid-tone control accent
- Control Teal Mid: lighter teal for highlighted platform surfaces

#### Category accents

- Governance Purple: governance and permissions tags
- Payment Orange: payments and settlement tags
- Compliance Red: compliance and audit tags
- Agent Blue: agent and orchestration tags

#### Surface colors

- Canvas White: default page background and standard card surface
- Canvas Dark: code panels, receipt logs, policy terminal backgrounds
- Surface: subtle section background
- Surface Soft: quiet section-break background
- Surface Feature: pale mint background for featured states such as highlighted pricing or recommended plans
- Hairline: default border
- Hairline Soft: low-contrast divider
- Hairline Strong: input and stronger structural boundary
- Hairline Dark: border color used on dark surfaces

#### Text colors

- Ink: primary headline and body text
- Charcoal: emphasized body text
- Slate: secondary text
- Steel: tertiary text and captions
- Stone: muted labels
- Muted: disabled and placeholder text
- On Dark: white text on dark surfaces
- On Dark Muted: reduced-contrast white text on dark surfaces

#### Semantic colors

- Success Background: pale green approval surface
- Success Text: approval copy and valid-state text
- Warning Background: pale amber warning surface
- Warning Text: warning-state copy
- Blocked Background: soft red blocked or denied surface
- Blocked Text: denied or revoked text color

### Palette usage rules

- bright green is the main action signal, not a default fill color for large areas
- dark control-teal surfaces should frame trust, policy, and treasury-control areas
- saturated category accents should mostly appear in tags, chips, and encoded labels
- blocked, warning, and success states must be easy to distinguish at a glance
- the palette should support a professional control-plane feel, not a playful or speculative crypto look

### Typography

- `Sora` as the primary UI typeface
- `IBM Plex Mono` for policy, receipt, and transaction-reference surfaces

### Shape and component language

- universal pill buttons
- `12px` rounded cards
- precise, operational spacing
- dark proof surfaces for ledger and policy context

### Category accent guidance

Use saturated accent colors sparingly and mainly for domain tags:

- governance
- payments
- compliance
- agents

### Do

- keep the visual language operational, not playful
- preserve strong contrast and hierarchy
- make the dashboard feel like a treasury control surface, not a generic SaaS board
- ensure mobile collapse is intentional, not just compressed desktop

### Do not

- drift into consumer-neobank styling
- overuse bright green for long text or large fills
- make buttons square
- replace the dark control-band identity with generic all-white marketing layouts

## Functional Design Expectations

Sherwin is designing wireframes, not backend logic, but the wireframes must reflect the real product semantics:

- policy blocks are visible
- mandate status matters
- receipt and audit surfaces are first-class
- agent actions are constrained by mandate boundaries
- blocked vs successful outcomes must be visually distinct

The wireframes should help Edward preserve those product truths during implementation.

## Explicit Non-Goals

This task does not authorize Sherwin to redefine:

- backend or API behavior
- policy logic
- contract semantics
- release policy
- product scope outside the listed surfaces

If the UI exposes a product ambiguity, the correct action is to escalate it back to Justine rather than silently redefining the flow.

## Handoff to Edward

Sherwin's handoff package should include:

- final wireframe link or artifact
- notes on spacing and hierarchy
- responsive/mobile notes
- state notes for badges, buttons, and status treatments
- any interaction notes that affect implementation

Edward's responsibility begins after that handoff:

1. audit the existing repository
2. map the wireframe to current architecture
3. implement the frontend faithfully
4. surface architectural conflicts before widening scope

## Acceptance Criteria

This ADR is satisfied when:

1. Sherwin can produce a complete wireframe package from this brief alone
2. Justine can review the package against product and technical fit
3. Edward can implement from the package without inventing missing layout structure
4. desktop and mobile intent are both covered
5. the design remains consistent with Mandate402's high-trust treasury-control identity

## Consequences

### Positive

- Sherwin has a stable, repo-tracked task brief
- Edward receives a clearer implementation handoff
- Justine's design review is grounded in a durable artifact
- the team reduces silo and tunnel-vision risk during UI work

### Tradeoffs

- the brief is more explicit, so design changes should be reflected here or in linked scope artifacts
- future UI expansion should create new ADRs or scope updates rather than silently stretching this one
