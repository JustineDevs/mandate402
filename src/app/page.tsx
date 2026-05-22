import type { Route } from "next";
import Link from "next/link";

import { HeaderHero } from "@/components/header-hero";

const publicSurfaceCards = [
  {
    title: "Policies",
    href: "/policies" as Route,
    body: "Inspect the allowlist, fallback, and blocked-attempt posture without losing the difference between policy truth and operator action.",
  },
  {
    title: "Vendors",
    href: "/vendors" as Route,
    body: "See the vendor registry as a first-class system boundary instead of folding it into treasury or facilitator behavior.",
  },
  {
    title: "Build Diary",
    href: "/build" as Route,
    body: "Read the tracked hardening notes, architecture gates, and release blockers as living repo-native artifacts.",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="page-shell">
      <HeaderHero />
      <section className="content">
        <section
          style={{
            display: "grid",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          <div className="card" id="production-posture">
            <div className="eyebrow">Production Posture</div>
            <div className="section-heading">
              Public surface stays descriptive. Operator controls stay behind
              authenticated routes.
            </div>
            <p className="muted" style={{ lineHeight: 1.7 }}>
              Mandate402 exposes a public product overview here, while mandate
              issuance, spend attempts, system status, fallback governance, and
              worker controls are treated as operator-only runtime surfaces.
            </p>
          </div>

          <div className="cards" id="platform-summary">
            <div className="card">
              <div className="eyebrow">Mandates</div>
              <div className="metric">Governed</div>
              <div className="footer-note">
                Policy, reservation, and revoke flows are enforced server-side.
              </div>
            </div>
            <div className="card">
              <div className="eyebrow">Execution</div>
              <div className="metric">Queued</div>
              <div className="footer-note">
                Dispatch and reconciliation are owned by workers, not by public
                routes.
              </div>
            </div>
            <div className="card">
              <div className="eyebrow">Treasury</div>
              <div className="metric">Morph</div>
              <div className="footer-note">
                Morph anchoring and treasury controls stay separate from the
                vendor and facilitator.
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {publicSurfaceCards.map((card) => (
              <article
                key={card.href}
                className="rounded-[26px] border border-[#d8e6dd] bg-white p-6 shadow-sm"
              >
                <div className="eyebrow">{card.title}</div>
                <p className="mt-4 text-sm leading-7 text-[#475569]">
                  {card.body}
                </p>
                <Link
                  href={card.href}
                  className="mt-6 inline-flex rounded-full bg-[#15803d] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Open {card.title}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
