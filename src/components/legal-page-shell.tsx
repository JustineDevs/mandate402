import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { SubtleDotGrid } from "@/components/landing/subtle-dot-grid";

export interface LegalPageHighlight {
  label: string;
  value: string;
  detail: string;
}

export interface LegalPageSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalPageContent {
  eyebrow: string;
  title: string;
  summary: string;
  updatedAt: string;
  audience: string;
  highlights: LegalPageHighlight[];
  sections: LegalPageSection[];
  crossLink: {
    href: Route;
    label: string;
    description: string;
  };
}

interface LegalPageShellProps {
  content: LegalPageContent;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mandate-green-mid focus-visible:ring-offset-2";

export function LegalPageShell({ content }: LegalPageShellProps) {
  return (
    <main className="min-h-dvh bg-canvas text-charcoal">
      <div className="relative isolate overflow-hidden border-b border-hairline bg-surface-feature/70">
        <SubtleDotGrid className="opacity-[0.16] mix-blend-multiply [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="relative z-[1] mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="flex flex-col gap-6 border border-hairline bg-canvas/88 p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className={`${focusRing} inline-flex rounded-sm`}>
                <Image
                  src="/images/mandate402_nav_header(black).png"
                  alt="Mandate402"
                  width={220}
                  height={56}
                  className="h-11 w-auto object-contain sm:h-12"
                  priority
                />
              </Link>
              <div className="hidden h-8 w-px bg-hairline sm:block" />
              <p className="max-w-md text-sm leading-relaxed text-slate">
                Public service terms and delivery policies for Mandate402
                product and implementation engagements.
              </p>
            </div>

            <nav
              aria-label="Legal pages"
              className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate"
            >
              <Link
                href="/"
                className={`${focusRing} inline-flex rounded-full border border-hairline px-3 py-2 transition-colors hover:border-mandate-green/45 hover:text-mandate-green-dark`}
              >
                Home
              </Link>
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
              <Link
                href="/operator"
                className={`${focusRing} inline-flex rounded-full bg-mandate-green px-3 py-2 text-sm font-semibold text-on-dark transition-colors hover:bg-mandate-green-dark`}
              >
                Operator Access
              </Link>
            </nav>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
            <section className="border border-hairline bg-canvas p-6 shadow-sm sm:p-8">
              <p className="font-mono-reference text-[11px] font-semibold uppercase tracking-[0.16em] text-mandate-green-dark">
                {content.eyebrow}
              </p>
              <h1 className="mt-4 max-w-3xl text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {content.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate sm:text-lg">
                {content.summary}
              </p>
            </section>

            <aside className="border border-hairline bg-canvas-dark p-6 text-on-dark shadow-sm">
              <p className="font-mono-reference text-[11px] font-semibold uppercase tracking-[0.16em] text-mandate-green-mid">
                Agreement context
              </p>
              <dl className="mt-4 space-y-4 text-sm leading-relaxed text-on-dark-muted">
                <div>
                  <dt className="font-semibold text-on-dark">Updated</dt>
                  <dd>{content.updatedAt}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-on-dark">
                    Intended audience
                  </dt>
                  <dd>{content.audience}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-on-dark">
                    Cross reference
                  </dt>
                  <dd>
                    <Link
                      href={content.crossLink.href}
                      className={`${focusRing} text-mandate-green-mid underline underline-offset-4`}
                    >
                      {content.crossLink.label}
                    </Link>
                    <span className="block pt-1">
                      {content.crossLink.description}
                    </span>
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-4 md:grid-cols-3">
          {content.highlights.map((highlight) => (
            <article
              key={highlight.label}
              className="border border-hairline bg-surface-soft p-5 shadow-sm"
            >
              <p className="font-mono-reference text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">
                {highlight.label}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-ink">
                {highlight.value}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {highlight.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6">
          {content.sections.map((section, index) => (
            <article
              key={section.title}
              className="border border-hairline bg-canvas p-6 shadow-sm sm:p-7"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <p className="font-mono-reference text-[11px] font-semibold uppercase tracking-[0.16em] text-mandate-green-dark">
                    Section {index + 1}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {section.title}
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-7 text-slate sm:text-[15px]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc space-y-2 pl-5 marker:text-mandate-green-dark">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
