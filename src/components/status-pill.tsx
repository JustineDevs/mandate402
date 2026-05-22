type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClassMap: Record<StatusTone, string> = {
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-900 border-amber-200",
  danger: "bg-rose-100 text-rose-800 border-rose-200",
  info: "bg-sky-100 text-sky-900 border-sky-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
};

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${toneClassMap[tone]}`}
    >
      {label}
    </span>
  );
}
