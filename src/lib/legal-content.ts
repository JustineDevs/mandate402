import type { LegalPageContent } from "@/components/legal-page-shell";

export const policiesPageContent: LegalPageContent = {
  eyebrow: "Programming Service Policy",
  title: "Service Policies for Mandate402 Delivery and Support",
  summary:
    "These policies explain how Mandate402 programming work is scoped, delivered, secured, reviewed, and supported. They are written to support implementation engagements in agentic commerce, treasury-control, and fintech-style integration environments where policy, auditability, and money movement must stay explicit.",
  updatedAt: "May 24, 2026",
  audience:
    "Prospective clients, operators, engineering leads, treasury owners, and compliance reviewers",
  highlights: [
    {
      label: "Scope policy",
      value: "Written scope first",
      detail:
        "Feature work, integrations, and production changes are tied to approved scope so runtime, treasury, and vendor boundaries do not drift without review.",
    },
    {
      label: "Security policy",
      value: "Least privilege and no secret sharing",
      detail:
        "Client credentials stay in approved environment variables or managed secret stores. Real keys and facilitator credentials are never accepted through source-controlled files.",
    },
    {
      label: "Delivery policy",
      value: "Verified before handoff",
      detail:
        "Work is not presented as complete until the changed routes, code paths, and required checks have been run or any exact gap has been stated in writing.",
    },
  ],
  crossLink: {
    href: "/terms",
    label: "Programming Service Terms",
    description:
      "Read the matching contract language that sets payment, ownership, acceptance, and termination expectations.",
  },
  sections: [
    {
      title: "Service scope and change control",
      paragraphs: [
        "Mandate402 programming work starts from a written scope that defines the business problem, the goal, the responsible owner, the acceptance criteria, and what is out of scope. This matters because the product sits between operator intent, paid vendors, and treasury controls, so unclear requests create real delivery and trust risk.",
        "If the client asks for work outside the approved scope, the request is treated as a change request. The provider may pause the new work until the change is written down with its expected impact on schedule, price, dependencies, and verification.",
      ],
      bullets: [
        "Scope changes must identify whether they affect frontend, APIs, contracts, vendor integrations, worker logic, or release posture.",
        "Emergency fixes may be handled faster, but they still need a written summary before release closure.",
        "A design or legal page request does not silently authorize backend or chain behavior changes.",
      ],
    },
    {
      title: "Access, credentials, and environment policy",
      paragraphs: [
        "Client access should follow the minimum level needed to complete the engagement. Demo data, test credentials, and staging environments are preferred until production access is necessary.",
        "The provider may refuse to work from unsafe credential delivery methods, shared personal accounts, or environments that mix demo and production values without clear separation.",
      ],
      bullets: [
        "Secrets belong in environment variables or an approved secret manager.",
        "Production keys, private wallets, and x402 facilitator credentials must be rotated if they are exposed in the wrong place.",
        "Unsafe redirect targets, open public admin routes, and mis-scoped operator roles are treated as security issues, not minor UI defects.",
      ],
    },
    {
      title: "Data handling and retention policy",
      paragraphs: [
        "The provider only needs enough client data to perform the agreed programming work. Sensitive operational information should be limited to what is required for debugging, testing, migration, or validation.",
        "Logs, exports, and copied datasets should avoid real secrets and should not be kept longer than necessary for the engagement or for documented audit reasons.",
      ],
      bullets: [
        "Payment truth, receipt evidence, and operator audit history should remain distinguishable in any data export or dashboard copy.",
        "Client approval is required before using real production records in demos, screenshots, or public case studies.",
        "If regulated or confidential data handling rules apply, those rules override any default workflow convenience.",
      ],
    },
    {
      title: "Delivery, verification, and acceptance policy",
      paragraphs: [
        "Work is delivered in small, reviewable slices whenever possible. Each slice should identify what changed, how it was verified, and what remains blocked or intentionally deferred.",
        "A delivery is considered review-ready when the provider has completed the agreed implementation, run the relevant checks, and described any known verification gaps in plain language.",
      ],
      bullets: [
        "Typical verification includes linting, type checks, route tests, integration tests, and targeted manual review for the affected surfaces.",
        "Money-moving, auth, policy, worker, and release changes carry a higher verification bar than copy-only updates.",
        "Client acceptance should be given within the agreed review window or the delivery is treated as accepted except for written defects tied to the approved scope.",
      ],
    },
    {
      title: "Support, incident, and communication policy",
      paragraphs: [
        "The provider will communicate material blockers, production risks, and missing dependencies as soon as they are known. Clear status updates are part of the service because silence creates delivery risk.",
        "Support after launch should follow the support window or maintenance agreement defined in the applicable order, proposal, or statement of work.",
      ],
      bullets: [
        "A blocker must identify the exact route, service, environment, or approval that is missing.",
        "Incident response priorities may be raised when the issue affects operator access, treasury controls, payment correlation, or production release safety.",
        "Requests that depend on third-party downtime, vendor API failures, or chain outages may need adjusted timelines.",
      ],
    },
    {
      title: "Third-party, blockchain, and dependency policy",
      paragraphs: [
        "Mandate402 may depend on third-party services such as hosted auth, database infrastructure, vendor APIs, x402 tooling, blockchain RPC providers, and oracle feeds. The provider can implement against those systems, but cannot guarantee their uptime or pricing.",
        "When the solution touches Morph, x402 vendors, or other external infrastructure, the engagement should state which parts are under direct provider control and which parts are external dependencies.",
      ],
      bullets: [
        "Third-party outages, network congestion, or breaking API changes may affect delivery dates or production behavior.",
        "The provider may recommend fallback plans, but fallback execution should never be presented as the default path if the product treats it as gated behavior.",
        "License, subscription, and infrastructure fees from third-party providers remain the client's responsibility unless the agreement says otherwise.",
      ],
    },
  ],
};

export const termsPageContent: LegalPageContent = {
  eyebrow: "Programming Service Terms",
  title: "Simple Terms for Custom Programming Services",
  summary:
    "These terms set the basic contract rules for custom programming work related to Mandate402 and similar control-plane software. They are written for practical understanding: who does the work, what the client must provide, how payment works, who owns the code, and what happens if either side ends the engagement.",
  updatedAt: "May 24, 2026",
  audience:
    "Clients purchasing implementation work, software leads, project sponsors, and review stakeholders",
  highlights: [
    {
      label: "Contract rule",
      value: "Written deliverables control",
      detail:
        "The agreed proposal, issue scope, PRD, or statement of work defines what will be built. Chat requests alone do not expand the contract.",
    },
    {
      label: "Payment rule",
      value: "Invoices follow milestones or time",
      detail:
        "The provider can bill by milestone, retainer, or approved time basis, depending on the signed commercial document for the engagement.",
    },
    {
      label: "Ownership rule",
      value: "Client owns paid custom deliverables",
      detail:
        "After full payment, the client receives ownership of the custom work product, while the provider keeps ownership of pre-existing tools, templates, and general know-how.",
    },
  ],
  crossLink: {
    href: "/policies",
    label: "Service Policies",
    description:
      "Read the operating policies that explain delivery, support, security, and change-control expectations behind these terms.",
  },
  sections: [
    {
      title: "Services and deliverables",
      paragraphs: [
        "The provider will deliver the programming services described in the applicable proposal, statement of work, issue scope, or written project brief. Deliverables may include product requirements documents, UI pages, application features, backend routes, integrations, tests, deployment support, and related technical documentation.",
        "Anything not clearly listed in the approved scope is not included by default. If the client requests extra work, both sides should confirm the added scope, price, and timeline in writing before the provider is required to perform it.",
      ],
    },
    {
      title: "Client responsibilities",
      paragraphs: [
        "The client must provide timely access to the people, systems, brand assets, and decisions needed to complete the work. This includes approvals, technical contacts, credentials, environment details, and feedback within the agreed review window.",
        "If the client delays approvals or fails to provide required access, the provider may move delivery dates by the amount of the delay and may pause work until the missing dependency is resolved.",
      ],
      bullets: [
        "The client is responsible for the legality and accuracy of the content, data, and instructions it provides.",
        "The client must not give the provider credentials it does not have the right to share.",
      ],
    },
    {
      title: "Fees and payment",
      paragraphs: [
        "The client agrees to pay the fees stated in the approved commercial document. Fees may be fixed-price, milestone-based, retainer-based, or time-and-materials, depending on what was agreed for the project.",
        "Invoices are due on the schedule stated in the contract or invoice. Late payments may delay further work, releases, support, or handoff until the overdue amount is paid.",
      ],
      bullets: [
        "Third-party software, hosting, RPC, vendor, or infrastructure charges are billed separately unless the contract says they are included.",
        "Change requests may be quoted separately and do not need to be started before approval.",
      ],
    },
    {
      title: "Intellectual property and reuse",
      paragraphs: [
        "After the client pays all amounts due, the client owns the final custom deliverables created specifically for the client under the engagement. This includes project-specific code, documentation, and design work identified as paid deliverables.",
        "The provider keeps ownership of its pre-existing materials, reusable utilities, general templates, methods, libraries, and know-how. The client receives a license to use those embedded materials only as needed to use the deliverables.",
      ],
    },
    {
      title: "Confidentiality and security",
      paragraphs: [
        "Each side must protect the other side's confidential information and use it only for the engagement. Confidential information includes non-public business plans, credentials, private technical details, and customer data shared for the work.",
        "The provider will use reasonable care to protect credentials and sensitive project access, but the client remains responsible for rotating access when the engagement ends or if exposure is suspected.",
      ],
      bullets: [
        "Real secrets should not be stored in source-controlled files.",
        "The provider may refuse unsafe instructions that would weaken auth, treasury controls, auditability, or release safety.",
      ],
    },
    {
      title: "Third-party services, warranties, and limits",
      paragraphs: [
        "The provider does not control third-party platforms such as hosting providers, authentication services, blockchain networks, oracle feeds, wallet software, payment facilitators, or external vendor APIs. Because of that, the provider cannot promise uninterrupted operation of those outside services.",
        "The provider promises to perform the services in a professional manner, but does not guarantee that software will be completely error-free or that external systems will always behave as expected.",
      ],
      bullets: [
        "The client should test important workflows before production launch.",
        "Except where the law does not allow it, the provider is not liable for indirect, special, or consequential losses such as lost profits, lost token value, or missed market opportunities.",
      ],
    },
    {
      title: "Term, termination, and final handoff",
      paragraphs: [
        "Either side may end the engagement if the other side materially breaches the agreement and does not fix the problem within the written cure period, or if the applicable commercial document allows termination for convenience.",
        "When the engagement ends, the client must pay for all approved work completed up to the end date. After payment, the provider will hand over the completed deliverables and any agreed project materials that belong to the client.",
      ],
      bullets: [
        "Sections about payment, confidentiality, intellectual property, liability limits, and dispute handling survive termination.",
        "If the parties need a governing law, venue, or dispute-resolution clause, that should be added in the signed commercial document.",
      ],
    },
  ],
};

export const privacyPageContent: LegalPageContent = {
  eyebrow: "Privacy Policy",
  title:
    "Privacy Policy for Mandate402 Public Site and Programming Engagements",
  summary:
    "This privacy policy explains what information Mandate402 may collect through its public website and related programming-service conversations, why that information is used, and how it is protected. It is written to be clear and usable for technical buyers, operators, and general visitors.",
  updatedAt: "May 24, 2026",
  audience:
    "Site visitors, prospective clients, operator contacts, and implementation stakeholders",
  highlights: [
    {
      label: "Collection rule",
      value: "Only necessary data",
      detail:
        "The site and service process should only collect information needed for communication, service delivery, security, analytics, or legal obligations.",
    },
    {
      label: "Usage rule",
      value: "Purpose-limited handling",
      detail:
        "Information is used to operate the site, respond to inquiries, support implementation work, secure the platform, and improve product delivery.",
    },
    {
      label: "Sharing rule",
      value: "No casual disclosure",
      detail:
        "Information is only shared with service providers, infrastructure partners, or legal authorities when there is a valid operational or legal reason.",
    },
  ],
  crossLink: {
    href: "/terms",
    label: "Programming Service Terms",
    description:
      "Read the matching terms that define service delivery, payment, ownership, and termination rules.",
  },
  sections: [
    {
      title: "What information may be collected",
      paragraphs: [
        "Mandate402 may collect information that visitors provide directly, such as names, email addresses, company details, project requirements, and other information submitted through contact or service discussions.",
        "The site may also collect technical information automatically, such as browser type, device information, page visits, referral sources, and general usage analytics needed to operate, secure, and improve the service.",
      ],
      bullets: [
        "Directly submitted information may include inquiry details, implementation requirements, and support context.",
        "Technical information may include IP-derived location signals, session behavior, and page interaction data.",
        "Sensitive secrets, wallet keys, and production credentials should not be submitted through public website forms unless a secure delivery method has been explicitly approved.",
      ],
    },
    {
      title: "How information is used",
      paragraphs: [
        "Collected information may be used to respond to inquiries, evaluate programming-service requests, deliver implementation work, maintain product security, and support internal operational analysis.",
        "Information may also be used to monitor site performance, understand which public pages are useful, and improve the quality of product messaging, legal documents, and technical onboarding surfaces.",
      ],
      bullets: [
        "Use is limited to business, operational, security, and legal purposes connected to the site or service relationship.",
        "Information should not be reused for unrelated purposes without a valid basis or additional notice.",
      ],
    },
    {
      title: "Cookies, analytics, and similar technologies",
      paragraphs: [
        "The site may use analytics or similar tools to understand traffic, measure engagement, and diagnose technical issues. These tools help identify which public pages are useful and whether the site is functioning correctly.",
        "If third-party analytics or hosting providers are used, those providers may process technical request data according to their own infrastructure and privacy terms.",
      ],
      bullets: [
        "Analytics should be limited to legitimate measurement, troubleshooting, and service improvement needs.",
        "Visitors can restrict some browser-based tracking through their browser settings or privacy tools.",
      ],
    },
    {
      title: "How information is shared",
      paragraphs: [
        "Information may be shared with trusted service providers that support hosting, analytics, authentication, deployment, communications, or security operations, but only to the extent needed for those services.",
        "Information may also be disclosed when required by law, to respond to valid legal process, or to protect the rights, safety, systems, or property of Mandate402, its users, or third parties.",
      ],
      bullets: [
        "Infrastructure and software vendors may process limited data as part of providing their services.",
        "Mandate402 does not treat confidential project information as public marketing material without permission.",
      ],
    },
    {
      title: "Data retention and security",
      paragraphs: [
        "Information should be retained only as long as needed for business, contractual, security, compliance, or recordkeeping purposes. Different categories of information may be retained for different periods depending on their purpose.",
        "Reasonable technical and organizational safeguards should be used to protect information, but no online system can guarantee absolute security.",
      ],
      bullets: [
        "Access to sensitive implementation information should follow least-privilege principles.",
        "If credentials or confidential information are exposed incorrectly, they should be rotated or remediated promptly.",
      ],
    },
    {
      title: "Your choices and contact rights",
      paragraphs: [
        "Visitors and clients may request reasonable corrections, updates, or deletion of information, subject to legal, contractual, security, or recordkeeping limits.",
        "Questions about privacy handling, data requests, or policy interpretation should be directed through the official Mandate402 contact channel used for the website or service engagement.",
      ],
      bullets: [
        "Some information may need to be retained to complete transactions, enforce agreements, investigate incidents, or comply with legal obligations.",
        "If a stricter regional privacy regime applies, those legal requirements may add extra rights or obligations beyond this baseline policy.",
      ],
    },
  ],
};
