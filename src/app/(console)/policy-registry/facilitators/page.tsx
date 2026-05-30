"use client";

import type { Route } from "next";
import Link from "next/link";

import {
  ConsoleCard,
  ConsoleCodeSurface,
  ConsolePanel,
} from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { consoleSplitSection } from "@/lib/console-layout";

export default function FacilitatorsPage() {
  return (
    <OperatorGate
      title="Sign in to view facilitators"
      description="Facilitator registry is not available in this build."
    >
      {() => (
        <ConsoleShell
          activeTab="Facilitators"
          eyebrow="Facilitators"
          title="Facilitator registry"
          summary="Facilitator list and controls are not wired in this build."
          heroTone="control"
          toolbar={<StatusPill label="Registry not wired" tone="warning" />}
        >
          <section className={consoleSplitSection("narrow")}>
            <ConsolePanel className="border-amber-200 bg-amber-50">
              <SectionHeader
                eyebrow="Operational hold"
                title="Facilitator controls are disabled"
                description="The facilitator registry and slashing workflow need real chain or backend state before this can be presented as an operator action surface."
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <ConsoleCard eyebrow="Facilitators" value="n/a">
                  Registry rows must come from the canonical runtime source.
                </ConsoleCard>
                <ConsoleCard eyebrow="Slash proposals" value="disabled">
                  Penalties must not be simulated in the live console.
                </ConsoleCard>
                <ConsoleCard eyebrow="Registration" value="disabled">
                  New facilitator onboarding requires a real mutation path.
                </ConsoleCard>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-amber-200 pt-6 sm:flex-row">
                <Link href={"/policy-registry" as Route}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Return to policies
                  </Button>
                </Link>
                <Link href={"/policy-registry/facilitators/register" as Route}>
                  <Button disabled className="w-full sm:w-auto">
                    Registration unavailable
                  </Button>
                </Link>
              </div>
            </ConsolePanel>

            <ConsoleCodeSurface
              title="Before facilitators go live"
              summary="Facilitator registration stays disabled until registry, authorization, and review states are backed by persisted runtime data."
              className="min-w-0"
            >
              <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                <p>Canonical facilitator registry source of truth</p>
                <p>Authorization checks for governance operators</p>
                <p>Persisted proposal IDs and slashing evidence records</p>
                <p>Clear success, failure, and pending review states</p>
              </div>
            </ConsoleCodeSurface>
          </section>
        </ConsoleShell>
      )}
    </OperatorGate>
  );
}
