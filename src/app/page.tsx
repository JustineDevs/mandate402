import { HeaderHero } from "@/components/header-hero";

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
        </section>
      </section>
    </main>
  );
}
