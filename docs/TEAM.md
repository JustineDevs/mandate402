# Team Architecture & Workflow Contract

> Version: `v0.1.0`

This document defines the human team structure for Mandate402 and the anti-silo workflow the repository should follow.

## Core Team Roles

### Justine (`@JustineDevs`) - Full Stack & Project Manager

Scope:

- product direction
- sprint planning
- backend and infra decisions
- release authority
- stakeholder communication
- major and minor scope changes

Core responsibilities:

- define sprint goals, feature scope, and roadmap direction
- review design for product and technical fit
- manage backend, infrastructure, and deployment decisions
- coordinate releases, external communication, and social updates
- approve changes that affect architecture, runtime semantics, or release posture

### Sherwin (`@owenlim225`) - UI/UX Designer

Scope:

- interface design
- user journeys
- layout system
- visual hierarchy

Core responsibilities:

- create wireframes, mockups, and layout intent
- maintain the visual system and interaction language
- hand off clear UI structure and states to frontend engineering
- ensure responsive behavior is considered before implementation starts

### Edward Joseph (`@EJ`) - Frontend Developer

Scope:

- frontend implementation
- client-side behavior
- API-safe UI integration

Core responsibilities:

- clone and audit the repository before implementing UI work
- convert approved wireframes into working frontend code
- preserve runtime, API, and policy semantics while improving UI
- raise structural conflicts early instead of coding around them silently

## Anti-Silo Contract

Mandate402 should not drift into silo mentality.

The team must avoid four failure modes:

- `Silo mentality`: hoarding context, working in isolation, and optimizing only a local agenda
- `Hyper-specialization`: focusing so narrowly on one discipline that product behavior degrades elsewhere
- `Tunnel vision`: shipping only local task output without surfacing dependencies or edge cases
- `Us vs. them mentality`: treating design, frontend, product, and infrastructure as competing camps

The required counter-model is:

- strong ownership
- shared context
- explicit handoffs
- visible assumptions
- upstream and downstream awareness

## Ownership Without Isolation

### Sherwin owns

- wireframes
- information hierarchy
- component layout
- responsive layout intent
- typography, spacing, and visual states

Sherwin does not own:

- product scope in isolation
- backend or API behavior
- release truth

### Edward owns

- translating approved wireframes into working frontend
- semantic HTML and component structure
- responsive behavior
- frontend state and interaction wiring

Edward does not own:

- silent changes to policy/runtime semantics
- silent infra changes
- bypassing product review because a UI is already coded

### Justine owns

- final scope
- roadmap and sprint direction
- infra and backend alignment
- release decisions
- merge and acceptance authority

Justine does not operate as a black box. Product constraints, rationale, and tradeoffs still need to be documented and shared.

## Linear Anti-Silo Workflow

All work should follow this handoff sequence:

`Justine (Scope)` -> `Sherwin (Wireframe)` -> `Justine (Review)` -> `Edward (Clone, Audit, Implement)` -> `Justine (Review & Merge)`

### Phase 1: Scope

Owned by Justine.

Output:

- feature goal
- target user or operator impact
- technical constraints
- acceptance boundaries

### Phase 2: Wireframe

Owned by Sherwin.

Output:

- wireframe or mockup link
- layout notes
- mobile behavior notes
- interaction states
- design-system references

### Phase 3: Design Alignment Review

Owned by Justine.

Output:

- approved or rejected design direction
- product corrections
- technical feasibility notes

### Phase 4: Repo Intake and Implementation

Owned by Edward.

Output:

- repository audit notes
- implementation plan against existing architecture
- working frontend code
- screenshots or recordings for review

## Handoff Requirements

Every handoff must include:

- what changed
- what remains
- known assumptions
- links to the issue, wireframe, or PR
- responsive/mobile notes where relevant
- whether the change affects API behavior, policy behavior, or release posture

## Sherwin Design Task Package

Sherwin's current UI wireframe package for Mandate402 should include the following reference layouts.

### Main Dashboard

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

### Create Mandate Screen

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

### Mandate Detail Page

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

### Agent View

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

### Mobile-Friendly Simplified Layout

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

## Mandate402 Visual Direction

Sherwin's design system should preserve the control-room identity of the product.

Core direction:

- deep control teal and graphite hero surfaces
- bright verification-green primary CTA pill
- stark white documentation, pricing, and dashboard surfaces
- Sora as the main typeface
- IBM Plex Mono for policy logs, receipts, and terminal-style proof surfaces
- pill buttons and `12px` rounded cards

Operational rule:

- design should feel precise, high-trust, and operational
- design should not drift into generic SaaS polish, consumer-fintech softness, or crypto-casino styling

## Edward Implementation Contract

Edward's task is not just to "code the UI." The expected sequence is:

1. clone or sync the latest repository state
2. build and run the project locally
3. audit the existing structure before adding new frontend code
4. map Sherwin's layout to current app patterns
5. implement semantic, responsive frontend components
6. preserve existing runtime and API semantics
7. surface any architectural conflict before opening the PR

Edward must not:

- silently re-interpret the product scope
- silently override design intent
- silently change infra-facing config or runtime semantics

## Justine Coordination Contract

Justine acts as the integration hub across:

- product direction
- sprint management
- infra and backend
- review and release
- public communications

That role exists to remove cross-functional ambiguity, not to centralize information. Justine should keep issue scope, constraints, and review criteria visible in the repository.

## Final Rule

Clear ownership is required.

Silo mentality is forbidden.

The correct model for Mandate402 is:

- clear role boundaries
- shared context
- linear handoff
- explicit review gates
- one shared repository truth
