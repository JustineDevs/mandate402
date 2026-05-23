"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { GlobalSearchItem } from "@/components/global-search";
import { Sidebar, SidebarNavPanel } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export type ConsoleHeroTone = "brand" | "control";

interface ConsoleShellProps {
  activeTab: string;
  eyebrow: string;
  title: string;
  summary: string;
  actions?: ReactNode;
  /** Untitled-style filter / secondary row below the hero band (inside the same card). */
  toolbar?: ReactNode;
  children: ReactNode;
  /** Brand green hero vs control-room teal band for policy/system surfaces. */
  heroTone?: ConsoleHeroTone;
  /** Optional mandate / entity shortcuts in global search (v0.1.1 shell). */
  searchExtraItems?: GlobalSearchItem[];
}

export function ConsoleShell({
  activeTab,
  eyebrow,
  title,
  summary,
  actions,
  toolbar,
  children,
  heroTone = "brand",
  searchExtraItems,
}: ConsoleShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const heroBandClass =
    heroTone === "control"
      ? "bg-gradient-to-br from-brand-control-deep to-brand-control"
      : "bg-mandate-green";

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeTab={activeTab} />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          id="mobile-console-nav"
          showCloseButton
          className="z-[60] w-[min(20rem,92vw)] max-w-none border-r border-mandate-green-dark bg-mandate-green p-0 text-on-dark shadow-xl sm:max-w-[min(20rem,92vw)] data-[side=left]:w-[min(20rem,92vw)] [&_[data-slot=sheet-close]]:text-on-dark [&_[data-slot=sheet-close]]:hover:bg-white/10"
        >
          <SheetTitle className="sr-only">Mobile navigation</SheetTitle>
          <div className="flex h-full flex-col pt-14">
            <SidebarNavPanel
              activeTab={activeTab}
              onLinkClick={() => setMobileNavOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col px-3 pb-6 pt-3 sm:px-4 sm:pb-8 sm:pt-4 md:ml-72 md:p-6 lg:p-10">
        <div className="mb-3 flex items-center gap-3 md:hidden">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-hairline bg-canvas text-charcoal shadow-sm"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-console-nav"
            onClick={() => setMobileNavOpen(true)}
          >
            <span className="sr-only">Open navigation</span>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="truncate text-sm font-bold text-charcoal">
            Mandate402
          </span>
        </div>

        <TopNav searchExtraItems={searchExtraItems} />

        <main className="mx-auto w-full max-w-6xl">
          <section className="mb-6 overflow-hidden rounded-lg border border-hairline bg-canvas shadow-sm sm:mb-8">
            <div
              className={`px-5 py-6 text-on-dark sm:px-8 sm:py-8 ${heroBandClass}`}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-on-dark-muted">
                    {eyebrow}
                  </div>
                  <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">
                    {title}
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-on-dark/90 sm:mt-4 md:text-base">
                    {summary}
                  </p>
                </div>

                {actions ? (
                  <div className="flex flex-wrap gap-2">{actions}</div>
                ) : null}
              </div>
            </div>
            {toolbar ? (
              <div className="flex flex-wrap items-center gap-2 border-t border-hairline bg-canvas px-5 py-3 sm:px-8">
                {toolbar}
              </div>
            ) : null}
          </section>

          <section className="grid gap-6 sm:gap-8">{children}</section>
        </main>
      </div>
    </div>
  );
}
