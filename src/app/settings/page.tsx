"use client";

import { useState } from "react";

import { ConsoleCard, ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { InlinePopover } from "@/components/overlay-primitives";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";

const runtimeCards = [
  {
    title: "Auth & Access",
    body: "Operator roles and worker tokens stay visible because trust posture should be inspectable, not assumed.",
    tone: "info" as const,
  },
  {
    title: "Chain & Treasury",
    body: "Morph RPC, registry, and treasury readiness should be operator-readable before a route feels trustworthy.",
    tone: "success" as const,
  },
  {
    title: "Worker Runtime",
    body: "Dispatch and reconcile queues must stay visible instead of silently disappearing into background state.",
    tone: "warning" as const,
  },
];

const warnings = [
  "Treasury settlement token decimals missing",
  "One agent mapping not yet configured",
];

export default function SettingsPage() {
  const [showRuntimeNote, setShowRuntimeNote] = useState(false);

  return (
    <ConsoleShell
      activeTab="Settings"
      eyebrow="System Health"
      title="Settings & System Health"
      summary="Runtime posture, chain readiness, and configuration warnings stay visible enough for operators to trust or challenge the system."
      heroTone="control"
      actions={
        <>
          <StatusPill label="Refresh" tone="neutral" />
          <StatusPill label="Chain Guard: Degraded" tone="warning" />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {runtimeCards.map((card) => (
          <ConsoleCard
            key={card.title}
            prepend={<StatusPill label={card.title} tone={card.tone} />}
          >
            {card.body}
          </ConsoleCard>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-hairline bg-canvas p-5 shadow-sm sm:p-8">
          <SectionHeader
            title="Configuration warnings"
            description="Degraded conditions stay visible until they are actually resolved."
            actions={
              <button
                type="button"
                onClick={() => setShowRuntimeNote((current) => !current)}
                className="rounded-full border border-hairline-strong px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal"
              >
                Runtime Detail
              </button>
            }
          />

          <div className="space-y-3">
            {warnings.map((warning) => (
              <div
                key={warning}
                className="rounded-lg border border-semantic-warning-text/25 bg-semantic-warning-bg px-4 py-3 text-sm text-semantic-warning-text"
              >
                {warning}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {showRuntimeNote ? (
            <InlinePopover
              title="Degraded Runtime"
              body="Queue pressure, signer readiness, and fallback posture must remain operator-readable instead of being hidden behind a generic healthy state."
            />
          ) : null}

          <ConsoleCodeSurface title="Runtime configuration">
            <pre className="whitespace-pre-wrap text-xs leading-6 text-on-dark-muted">{`Supabase: connected
Morph RPC: reachable
Registry: configured
Dispatch queue: 2
Reconcile queue: 1
Leased tasks: 0`}</pre>
          </ConsoleCodeSurface>
        </div>
      </section>
    </ConsoleShell>
  );
}
