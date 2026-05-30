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

export default function RegisterFacilitatorPage() {
  return (
    <OperatorGate
      title="Sign in to register facilitator"
      description="Facilitator registration is not available in this build."
    >
      {() => (
        <ConsoleShell
          activeTab="Facilitators"
          eyebrow="Facilitators"
          title="Register facilitator"
          summary="Registration is not available in this build."
          heroTone="control"
          toolbar={<StatusPill label="Registration disabled" tone="warning" />}
        >
          <section className={consoleSplitSection("narrow")}>
            <ConsolePanel className="space-y-6 border-amber-200 bg-amber-50 sm:p-8">
              <SectionHeader
                eyebrow="Operational hold"
                title="Registration cannot be submitted yet"
                description="The registration form is hidden until the registration API and governance record are implemented."
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <ConsoleCard eyebrow="Form submission" value="disabled">
                  No browser-only success is shown.
                </ConsoleCard>
                <ConsoleCard eyebrow="Stake handling" value="not wired">
                  Stake lock semantics need real treasury integration.
                </ConsoleCard>
                <ConsoleCard eyebrow="Audit trail" value="pending">
                  Registration must create a persisted operator event.
                </ConsoleCard>
              </div>

              <div className="flex flex-col gap-3 border-t border-amber-200 pt-6 sm:flex-row">
                <Link href={"/policy-registry/facilitators" as Route}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Return to facilitator registry
                  </Button>
                </Link>
                <Button disabled className="w-full sm:w-auto">
                  Submit unavailable
                </Button>
              </div>
            </ConsolePanel>

            <ConsoleCodeSurface
              title="Before registration goes live"
              summary="Submit stays disabled until server registration, address validation, and audit events are wired with clear failure recovery."
              className="min-w-0"
            >
              <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                <p>Server-side registration endpoint with authorization</p>
                <p>Canonical facilitator address validation</p>
                <p>Stake-lock or governance proposal semantics</p>
                <p>Operator-visible audit event and failure recovery</p>
              </div>
            </ConsoleCodeSurface>
          </section>
        </ConsoleShell>
      )}
    </OperatorGate>
  );
}
