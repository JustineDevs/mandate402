import { formatOperatorToken } from "@/lib/operator-display-labels";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClassMap: Record<StatusTone, string> = {
  success:
    "border-mandate-green/25 bg-semantic-success-bg text-semantic-success-text",
  warning:
    "border-accent-payments/35 bg-semantic-warning-bg text-semantic-warning-text",
  danger:
    "border-accent-compliance/35 bg-semantic-blocked-bg text-semantic-blocked-text",
  info: "border-hairline bg-surface-soft text-brand-control",
  neutral: "border-hairline bg-surface text-slate",
};

interface StatusPillProps {
  /** Raw token from API/store, or already formatted text. */
  label: string;
  tone?: StatusTone;
  /** When false, show label verbatim (e.g. counts). Default true. */
  humanize?: boolean;
}

export function StatusPill({
  label,
  tone = "neutral",
  humanize = true,
}: StatusPillProps) {
  const display = humanize ? formatOperatorToken(label) : label;

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-snug normal-case sm:px-3 sm:text-[11px] ${toneClassMap[tone]}`}
      title={display}
    >
      <span className="truncate">{display}</span>
    </span>
  );
}
