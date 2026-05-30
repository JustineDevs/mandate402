"use client";

import { ConsoleDisclosure } from "@/components/console-disclosure";
import { StatusPill } from "@/components/status-pill";
import type { ProductionReadiness } from "@/lib/infrastructure/production-readiness";
import {
  formatAgentsPostureLabel,
  formatReadinessCheckLabel,
  formatReadinessReasonDetail,
  formatReadinessReasonHeadline,
  formatReadinessStatusLabel,
  formatSeverityLabel,
  formatTreasuryEnforcementLabel,
  formatWorkerRuntimeSummary,
  summarizeReadiness,
} from "@/lib/readiness-display-labels";
import { cn } from "@/lib/utils";

type ProductionReadinessPanelProps = {
  readiness: ProductionReadiness;
  className?: string;
};

function readinessTone(ready: boolean) {
  return ready ? "success" : "warning";
}

function CheckTile({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-hairline bg-surface-soft px-3 py-2.5">
      <span className="truncate text-sm font-medium text-charcoal">
        {label}
      </span>
      <StatusPill
        label={ready ? "Pass" : "Needs work"}
        humanize={false}
        tone={readinessTone(ready)}
      />
    </div>
  );
}

export function ProductionReadinessPanel({
  readiness,
  className,
}: ProductionReadinessPanelProps) {
  const { checks, passingCount, totalCount, headline, subline } =
    summarizeReadiness(readiness);
  const attentionReasons = readiness.degradedReasons.filter(
    (reason) => reason.severity === "critical",
  );
  const advisoryReasons = readiness.degradedReasons.filter(
    (reason) => reason.severity !== "critical",
  );
  const showTechnical =
    readiness.degradedReasons.length > 0 ||
    !readiness.worker.dlqConfigured ||
    readiness.worker.queuedDispatchTasks > 0 ||
    readiness.worker.queuedReconciliationTasks > 0;

  return (
    <section
      className={cn(
        "min-w-0 space-y-4 rounded-lg border border-hairline bg-canvas p-4 shadow-sm sm:p-6",
        className,
      )}
      aria-labelledby="production-readiness-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div
            id="production-readiness-heading"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel"
          >
            Runtime health
          </div>
          <h2 className="mt-2 text-lg font-bold text-charcoal sm:text-xl">
            {headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate">{subline}</p>
          <p className="mt-2 text-xs leading-relaxed text-steel">
            {formatAgentsPostureLabel(readiness.agents)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusPill
            label={formatReadinessStatusLabel(readiness.status)}
            humanize={false}
            tone={readiness.status === "ok" ? "success" : "warning"}
          />
          <span className="text-xs font-medium text-steel">
            {passingCount}/{totalCount} checks
          </span>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <CheckTile
            key={check.key}
            label={formatReadinessCheckLabel(check.key)}
            ready={check.ready}
          />
        ))}
      </div>

      <div className="rounded-md border border-hairline bg-surface-soft px-4 py-3">
        <div className="text-sm font-semibold text-charcoal">
          Treasury enforcement
        </div>
        <p className="mt-1 text-sm text-slate">
          {formatTreasuryEnforcementLabel(readiness.treasuryEnforcementMode)}
        </p>
      </div>

      {attentionReasons.length > 0 ? (
        <ConsoleDisclosure
          title="What needs attention"
          summary={`${attentionReasons.length} item${attentionReasons.length === 1 ? "" : "s"} blocking a healthy runtime`}
          defaultOpen
        >
          <ul className="space-y-3">
            {attentionReasons.map((reason) => (
              <li key={`${reason.code}-${reason.message}`}>
                <div className="font-medium text-charcoal">
                  {formatReadinessReasonHeadline(reason)}
                </div>
                <p className="mt-1 text-slate">
                  {formatReadinessReasonDetail(reason)}
                </p>
              </li>
            ))}
          </ul>
        </ConsoleDisclosure>
      ) : null}

      {advisoryReasons.length > 0 ? (
        <ConsoleDisclosure
          title="Advisory items"
          summary={`${advisoryReasons.length} non-blocking note${advisoryReasons.length === 1 ? "" : "s"}`}
        >
          <ul className="space-y-3">
            {advisoryReasons.map((reason) => (
              <li key={`${reason.code}-${reason.message}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-charcoal">
                    {formatReadinessReasonHeadline(reason)}
                  </span>
                  <StatusPill
                    label={formatSeverityLabel(reason.severity)}
                    humanize={false}
                    tone="warning"
                  />
                </div>
                <p className="mt-1 text-slate">
                  {formatReadinessReasonDetail(reason)}
                </p>
              </li>
            ))}
          </ul>
        </ConsoleDisclosure>
      ) : null}

      {showTechnical ? (
        <ConsoleDisclosure
          title="Worker and queue details"
          summary="Retry policy, queue depth, and failed-job handling"
        >
          <p>{formatWorkerRuntimeSummary(readiness.worker)}</p>
          <dl className="mt-3 grid gap-2 text-xs text-steel sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-charcoal">Retry attempts</dt>
              <dd>{readiness.worker.maxRetries}</dd>
            </div>
            <div>
              <dt className="font-semibold text-charcoal">Retry delay</dt>
              <dd>{readiness.worker.retryDelaySeconds}s</dd>
            </div>
            <div>
              <dt className="font-semibold text-charcoal">Dispatch queue</dt>
              <dd>{readiness.worker.queuedDispatchTasks}</dd>
            </div>
            <div>
              <dt className="font-semibold text-charcoal">Reconcile queue</dt>
              <dd>{readiness.worker.queuedReconciliationTasks}</dd>
            </div>
          </dl>
        </ConsoleDisclosure>
      ) : null}

      {readiness.degradedReasons.length > 0 ? (
        <ConsoleDisclosure
          title="Diagnostic codes"
          summary="For engineering review only"
        >
          <ul className="space-y-2 font-mono-reference text-xs text-steel">
            {readiness.degradedReasons.map((reason) => (
              <li key={`diag-${reason.code}`}>
                <span className="text-charcoal">{reason.code}</span>
                <span className="text-stone"> · </span>
                <span>{reason.message}</span>
              </li>
            ))}
          </ul>
        </ConsoleDisclosure>
      ) : null}
    </section>
  );
}
