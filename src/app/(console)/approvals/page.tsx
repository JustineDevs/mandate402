"use client";

import {
  ConsoleCard,
  ConsoleCodeSurface,
  ConsolePanel,
} from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { consoleSplitSection } from "@/lib/console-layout";

export default function ApprovalsPage() {
  return (
    <OperatorGate
      title="Sign in to view approvals"
      description="Approvals are not available in this build."
    >
      {() => (
        <ConsoleShell
          activeTab="Approvals"
          eyebrow="Approvals"
          title="Approval queue"
          summary="Waiting on live approval data from the consensus runtime."
          heroTone="control"
          toolbar={<StatusPill label="Runtime not wired" tone="warning" />}
        >
          <section className={consoleSplitSection("narrow")}>
            <ConsolePanel className="border-amber-200 bg-amber-50">
              <SectionHeader
                eyebrow="Operational hold"
                title="Approvals are not executable from this build"
                description="Approval rows and action buttons are hidden until the backend consensus queue exists, so the console does not imply that governed actions can be signed or executed from this build."
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <ConsoleCard eyebrow="Pending approvals" value="n/a">
                  Waiting for the real consensus queue API.
                </ConsoleCard>
                <ConsoleCard eyebrow="Ready to execute" value="n/a">
                  Execution status must come from persisted approval state.
                </ConsoleCard>
                <ConsoleCard eyebrow="Operator tasks" value="n/a">
                  Operator-specific signing tasks are unavailable until wired.
                </ConsoleCard>
              </div>
            </ConsolePanel>

            <ConsoleCodeSurface
              title="Release boundary"
              summary="Approvals are not wired yet. This page is a safe placeholder — no sign or execute actions appear here."
              className="min-w-0"
            >
              <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                <p>Placeholder approval rows are not shown on the console.</p>
                <p>
                  Sign and execute controls only appear once a real runtime
                  mutation path exists.
                </p>
                <p>
                  Treat this route as layout review only, not an operational
                  approval queue.
                </p>
              </div>
            </ConsoleCodeSurface>
          </section>
        </ConsoleShell>
      )}
    </OperatorGate>
  );
}
