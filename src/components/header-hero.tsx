import Image from "next/image";

export function HeaderHero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="topbar">
          <div className="brand-lockup">
            <Image
              src="/images/Mandate402_logo.svg"
              alt="Mandate402 logo"
              width={42}
              height={42}
              className="brand-logo"
              priority
            />
            <div className="brand-copy">
              <div className="brand">MANDATE402</div>
              <div className="brand-tagline">
                Treasury Command for x402 Agentic Commerce
              </div>
            </div>
          </div>
          <nav className="topnav" aria-label="Top navigation">
            <span>Overview</span>
            <span>Mandates</span>
            <span>Vendors</span>
            <span>Receipts</span>
            <span>Fallback Gate</span>
          </nav>
        </div>
        <div className="hero-grid">
          <div className="headline">
            <div className="eyebrow">
              Controlled Spend for Autonomous Agents
            </div>
            <h1>Let AI spend money safely on Morph.</h1>
            <p>
              Mandate402 gives every agent a governed spend mandate with
              approval policy, reservation controls, receipt evidence, and a
              Morph-native revoke path.
            </p>
            <div className="hero-chips" aria-label="Platform summary">
              <span className="hero-chip">Morph-native</span>
              <span className="hero-chip">x402 Guardrails</span>
              <span className="hero-chip">Pyth Budget Limits</span>
            </div>
            <div className="cta-row">
              <a className="pill pill-primary" href="#mandate-form">
                Issue Mandate
              </a>
              <a className="pill pill-secondary" href="#transactions">
                Review Audit Trail
              </a>
            </div>
          </div>
          <div className="panel terminal">
            <div className="terminal-title">Live Treasury Trace</div>
            <pre>{`> issueMandate("Research Agent")
mandate_id: mdt_demo_001
anchor_chain: Morph
budget_cap: $50.00
approved_vendors: ["morph-market-data", "morph-research-net"]
receipt_gate: required

> runAttempt("morph-market-data", $12.00)
auth: ok
policy: approved
reservation: held
execution: charge_succeeded
receipt: received_valid

> runAttempt("rogue-vendor", $18.00)
auth: ok
policy: denied
reason: vendor_not_allowlisted
dispatch: prevented`}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}
