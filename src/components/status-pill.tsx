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
  label: string;
  tone?: StatusTone;
}

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${toneClassMap[tone]}`}
    >
      {label}
    </span>
  );
}
