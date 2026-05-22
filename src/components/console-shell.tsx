import type { ReactNode } from "react";

import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";

type ConsoleShellProps = {
  activeTab: string;
  eyebrow: string;
  title: string;
  summary: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function ConsoleShell({
  activeTab,
  eyebrow,
  title,
  summary,
  actions,
  children,
}: ConsoleShellProps) {
  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <Sidebar activeTab={activeTab} />

      <div className="md:ml-72 min-h-screen px-4 py-4 md:px-10 md:py-8">
        <TopNav />

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <header className="overflow-hidden rounded-[28px] border border-[#d9e8de] bg-gradient-to-br from-[#0f2b33] via-[#12454d] to-[#15803d] px-6 py-8 text-white shadow-[0_24px_80px_rgba(6,43,51,0.18)] md:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                  {eyebrow}
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-100 md:text-base">
                  {summary}
                </p>
              </div>

              {actions ? (
                <div className="flex flex-wrap items-center gap-3">
                  {actions}
                </div>
              ) : null}
            </div>
          </header>

          <section className="grid gap-6">{children}</section>
        </main>
      </div>
    </div>
  );
}
