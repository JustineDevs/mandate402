import type { Metadata } from "next";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { LandingReveal } from "@/components/landing/landing-reveal";
import { LandingSessionRedirect } from "@/components/landing/landing-session-redirect";
import { LandingSignInPanel } from "@/components/landing/landing-sign-in-panel";
import { LandingSocialRow } from "@/components/landing/landing-social-row";
import { SubtleDotGrid } from "@/components/landing/subtle-dot-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Treasury Command for x402 Agentic Commerce",
  description:
    "Let AI spend money safely on Morph with governed mandates, approved vendors, explicit treasury policy, and operator-visible auditability.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Treasury Command for x402 Agentic Commerce",
    description:
      "Let AI spend money safely on Morph with governed mandates, approved vendors, explicit treasury policy, and operator-visible auditability.",
    url: "/",
  },
  twitter: {
    title: "Treasury Command for x402 Agentic Commerce",
    description:
      "Govern AI agent spend on Morph with explicit mandates, policy controls, and audit visibility.",
  },
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mandate-green-mid focus-visible:ring-offset-2";

/**
 * Landing — ADR-0002 §1 hero split. Columns vertically center their content blocks
 * (avoids top-heavy layout when content is shorter than the viewport).
 * @see docs/adr/ADR-0002-sherwin-ui-wireframe-task.md (lines 73–93)
 */
export default async function HomePage() {
  const operatorHref = "/operator" as Route;
  const vendorsHref = "/vendors" as Route;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mandate402",
    url: "https://mandate402.vercel.app",
    logo: "https://mandate402.vercel.app/images/Mandate402_Logo.png",
    description:
      "Mandate402 is a treasury-control and governance layer for x402 machine commerce on Morph.",
    sameAs: [
      "https://x.com/mandate402",
      "https://github.com/JustineDevs/mandate402",
      "https://github.com/coinbase/x402",
      "https://www.morphl2.io/",
    ],
  };
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Mandate402",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: "https://mandate402.vercel.app",
    description:
      "Treasury command for x402 agentic commerce on Morph with policy enforcement and operator-visible auditability.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const colPadX = "px-4 sm:px-5 lg:px-6 xl:px-7";
  const colPadY =
    "pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]";

  return (
    <main
      translate="no"
      className="touch-manipulation m-0 box-border flex min-h-dvh flex-col bg-transparent p-0 text-charcoal"
    >
      <LandingSessionRedirect />
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>
      <div className="grid min-h-dvh w-full min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-0 lg:grid-cols-5 lg:grid-rows-1 lg:items-stretch">
        <div className="flex min-h-0 min-w-0 flex-col lg:col-span-3">
          <div
            className={`relative flex min-h-0 h-full min-w-0 flex-1 flex-col overflow-y-auto border-b border-r border-hairline border-l-4 border-l-mandate-green bg-canvas lg:border-b-0 ${colPadX} ${colPadY}`}
          >
            <SubtleDotGrid className="opacity-[0.18] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <LandingReveal
              delay={0}
              className="relative z-[1] flex min-h-full w-full flex-1 flex-col items-center justify-center py-6 sm:py-8"
            >
              <div className="flex w-full max-w-xl flex-col items-center gap-5 sm:max-w-2xl sm:gap-6">
                <LandingSocialRow />

                <div className="w-full max-w-lg border border-hairline bg-surface-soft sm:max-w-xl">
                  <p className="border-b border-hairline px-4 py-3 text-center font-mono-reference text-[11px] font-semibold uppercase tracking-wider text-steel sm:px-6 sm:py-3.5 sm:text-xs">
                    Operator console access
                  </p>
                  <div className="divide-y divide-hairline">
                    <div className="px-4 py-3.5 text-center sm:px-6 sm:py-4">
                      <p className="text-sm leading-relaxed font-semibold text-slate sm:text-base">
                        Mandate402 gives teams a controlled way to let AI agents
                        pay approved vendors with explicit limits, visible audit
                        trails, and a clear path for blocking or reconciling
                        risky payment activity.
                      </p>
                    </div>
                    <div className="px-4 py-2 text-center sm:px-6">
                      <p className="text-xs leading-relaxed text-steel sm:text-sm">
                        Use{" "}
                        <span className="font-semibold text-slate">
                          Continue to operator console
                        </span>{" "}
                        to review the protected control surface.
                      </p>
                    </div>
                    <div className="flex justify-center px-4 py-4 sm:px-6 sm:py-5">
                      <LandingSignInPanel
                        operatorHref={operatorHref}
                        focusRingClass={focusRing}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full min-w-0 text-center">
                  <p className="font-mono-reference text-[11px] font-semibold uppercase tracking-[0.14em] text-steel sm:text-xs">
                    Platform Assurance
                  </p>
                  <ul className="mt-3 list-none space-y-2 text-sm leading-relaxed text-charcoal sm:mt-4 sm:text-base">
                    <li>Operator oversight enabled</li>
                    <li>Chain-backed control path</li>
                    <li>Policy and audit enforcement</li>
                  </ul>
                </div>
              </div>
            </LandingReveal>
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col lg:col-span-2">
          <div
            className={`relative flex min-h-0 h-full min-w-0 flex-1 flex-col overflow-y-auto bg-surface-feature/90 ${colPadX} ${colPadY}`}
          >
            <SubtleDotGrid className="opacity-[0.12] mix-blend-multiply [mask-image:radial-gradient(ellipse_at_30%_0%,black,transparent_72%)]" />
            <LandingReveal
              delay={0.08}
              className="relative z-[1] flex min-h-full w-full flex-1 flex-col items-center justify-center py-6 sm:py-8"
            >
              <div className="flex w-full max-w-xl flex-col items-start gap-4 text-left sm:gap-5 lg:max-w-lg">
                <div className="flex min-w-0 flex-wrap items-center justify-start gap-2.5 sm:gap-3">
                  <Image
                    src="/images/mandate402_nav_header(black).png"
                    alt="Mandate402"
                    width={260}
                    height={64}
                    className="h-12 w-auto shrink-0 object-contain sm:h-14 lg:h-16"
                    priority
                  />
                </div>

                <h1 className="w-full text-pretty text-left text-lg font-bold leading-snug tracking-tight text-ink sm:text-xl lg:text-2xl">
                  Treasury Command for x402 Agentic Commerce
                </h1>
                <p className="w-full text-left text-sm leading-snug text-slate sm:text-base sm:leading-relaxed">
                  Let AI spend money safely on Morph with governed mandates,
                  explicit treasury policy, and operator-visible auditability.
                </p>

                <div className="w-full min-w-0">
                  <p className="text-left font-mono-reference text-[10px] font-semibold uppercase tracking-[0.12em] text-mandate-green-dark sm:text-[11px]">
                    Ecosystem / Partnerships
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-start gap-4 sm:mt-4 sm:gap-5 lg:gap-6">
                    <a
                      href="https://www.morphl2.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex shrink-0 items-center ${focusRing} rounded-sm`}
                      aria-label="Morph (opens in new tab)"
                    >
                      <Image
                        src="/images/Lime-Black Primary Horizontal Lockup.png"
                        alt="Morph"
                        width={180}
                        height={48}
                        className="h-9 w-auto object-contain object-left sm:h-10 lg:h-11"
                      />
                    </a>
                    <a
                      href="https://github.com/coinbase/x402"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-mono-reference text-2xl font-bold tracking-tight text-mandate-green-dark transition-opacity hover:opacity-90 sm:text-3xl lg:text-[2rem] ${focusRing} rounded-sm px-1 py-0.5`}
                      aria-label="x402 (opens in new tab)"
                    >
                      x402
                    </a>
                    <a
                      href="https://pyth.network/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex shrink-0 items-center ${focusRing} rounded-sm`}
                      aria-label="Pyth Network (opens in new tab)"
                    >
                      <Image
                        src="/images/Pyth_Network_crypto-logo-pyth-png_3.png"
                        alt="Pyth Network"
                        width={56}
                        height={56}
                        className="h-12 w-12 object-contain sm:h-14 sm:w-14 lg:h-16 lg:w-16"
                      />
                    </a>
                    <Link
                      href={vendorsHref}
                      className={`inline-flex shrink-0 items-center border border-dashed border-mandate-green/35 bg-transparent px-3 py-2 text-xs font-semibold text-slate transition-colors hover:border-mandate-green/50 hover:text-mandate-green-dark sm:px-3.5 sm:py-2 sm:text-sm ${focusRing}`}
                    >
                      Partner / Vendor slot
                    </Link>
                  </div>
                </div>

                <div className="w-full min-w-0 border-t border-hairline pt-4">
                  <p className="text-left font-mono-reference text-[10px] font-semibold uppercase tracking-[0.12em] text-steel sm:text-[11px]">
                    Service documents
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm text-slate">
                    <Link
                      href="/policies"
                      className={`${focusRing} inline-flex rounded-full border border-hairline px-3 py-2 transition-colors hover:border-mandate-green/45 hover:text-mandate-green-dark`}
                    >
                      Policies
                    </Link>
                    <Link
                      href="/terms"
                      className={`${focusRing} inline-flex rounded-full border border-hairline px-3 py-2 transition-colors hover:border-mandate-green/45 hover:text-mandate-green-dark`}
                    >
                      Terms
                    </Link>
                    <Link
                      href="/privacy"
                      className={`${focusRing} inline-flex rounded-full border border-hairline px-3 py-2 transition-colors hover:border-mandate-green/45 hover:text-mandate-green-dark`}
                    >
                      Privacy
                    </Link>
                  </div>
                </div>
              </div>
            </LandingReveal>
          </div>
        </div>
      </div>
    </main>
  );
}
