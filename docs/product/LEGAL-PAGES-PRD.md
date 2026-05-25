# PRD: Public Policies and Terms Pages

## 1. Document purpose

This PRD defines the public `/policies` and `/terms` pages for Mandate402.

The immediate business goal is to provide professional, understandable legal-facing content that can support client discussions, programming service agreements, and public trust review without sounding like generic SaaS filler.

## 2. Product context

Mandate402 is a treasury-control and governance layer for x402 machine commerce on Morph.

It sits between:

- operator intent
- paid vendor endpoints
- payment facilitator infrastructure
- treasury controls and audit expectations

Because the product deals with payment policy, operator approvals, vendor restrictions, and ambiguous payment outcomes, the public legal pages must sound operational, specific, and aligned with the actual runtime boundary.

## 3. Problem statement

The application is missing public legal pages that explain:

- the service policies behind Mandate402 programming work
- the baseline terms for custom programming and implementation services

At the same time, the existing `/policies` route is currently used by the protected operator console for policy-registry UX, which makes the public legal route unavailable.

## 4. Objective

Create clear public pages at:

- `/policies`
- `/terms`

These pages must be useful for:

- client review
- internal sales or delivery conversations
- service agreement alignment
- public trust and diligence review

## 5. Primary audience

- prospective clients
- operators and platform leads
- treasury or finance approvers
- security and compliance reviewers
- technical stakeholders evaluating implementation scope

## 6. Industry framing

The pages are tailored to a custom software engagement in:

- agentic commerce
- fintech-style infrastructure
- treasury-control and payment-governance software
- blockchain-adjacent integration environments

The copy must acknowledge external systems such as vendor APIs, hosted infrastructure, and Morph/x402 dependencies without pretending those systems are controlled by the provider.

## 7. In scope

- a public `/policies` page
- a public `/terms` page
- route restructuring required to free `/policies` for public use
- copy grounded in existing Mandate402 product and architecture documents
- layout aligned with the current landing-page visual language
- simple professional wording that non-lawyers can understand

## 8. Out of scope

- custom jurisdiction-specific legal review
- privacy-policy drafting for regulated data programs
- negotiated enterprise procurement clauses
- warranty, indemnity, or governing-law changes that require counsel
- changes to runtime semantics, operator auth, or treasury logic

## 9. Source alignment requirements

The page content must align with these repo truths:

- Mandate402 sells control over machine spend, not payment facilitation itself
- operator authority, vendor allowlists, receipts, and reconciliation matter
- external dependencies such as vendor APIs, Morph, x402 tooling, and hosted services are real delivery constraints
- protected operator policy-registry UX is separate from public legal copy

Primary source documents:

- `docs/architecture/SYSTEM_DESIGN.md`
- `docs/product/BM.md`
- `docs/brand/brandkit.md`
- `docs/process/UI-SYSTEM.md`

## 10. Page requirements

### 10.1 `/policies`

Purpose:

- explain how programming work is scoped, secured, delivered, and supported

Required sections:

- scope and change control
- access and credentials
- data handling and retention
- delivery, verification, and acceptance
- support and incident communication
- third-party and blockchain dependency handling

Tone:

- operational
- professional
- direct
- no legal theater

### 10.2 `/terms`

Purpose:

- state the basic contract language for custom programming services in plain English

Required sections:

- services and deliverables
- client responsibilities
- fees and payment
- intellectual property and reuse
- confidentiality and security
- third-party services and warranty limits
- term, termination, and final handoff

Tone:

- plain-language contract
- understandable by founders, operators, and non-lawyers
- specific enough to be useful as a base agreement

## 11. UX requirements

- pages must be public and require no auth
- content must be readable on desktop and mobile
- design must match the Mandate402 control-plane identity rather than a generic docs template
- navigation between legal pages and home should be visible
- operator policy-registry functionality must remain available under a protected route

## 12. Functional requirements

- move the protected policy-registry screen off `/policies`
- update internal console links and safe redirect allowlists
- add the new public routes
- keep the operator policy screen protected by existing auth behavior

## 13. Success criteria

The work is successful when:

- `/policies` loads publicly with service-policy content
- `/terms` loads publicly with service-terms content
- the protected operator policy screen still works from its new route
- internal navigation and redirect safety are updated
- copy is aligned with current product boundaries
- verification passes for the changed frontend and auth-path code

## 14. Acceptance criteria

- a reviewer can read either page and understand the offering without extra explanation
- the text avoids inflated claims and generic legal filler
- the terms clearly separate custom deliverables from provider-owned reusable assets
- the policies clearly state change-control, verification, and third-party dependency rules
- no route collision remains between public legal copy and protected operator UX
