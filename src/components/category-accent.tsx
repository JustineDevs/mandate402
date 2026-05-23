import type { ReactNode } from "react";

import type { CategoryLane } from "@/lib/types";

const laneClassMap: Record<CategoryLane, string> = {
  governance:
    "border-accent-governance/40 bg-accent-governance/10 text-accent-governance",
  payments:
    "border-accent-payments/40 bg-accent-payments/10 text-accent-payments",
  compliance:
    "border-accent-compliance/40 bg-accent-compliance/10 text-accent-compliance",
  agents: "border-accent-agents/40 bg-accent-agents/10 text-accent-agents",
};

const laneLabelMap: Record<CategoryLane, string> = {
  governance: "Governance",
  payments: "Payments",
  compliance: "Compliance",
  agents: "Agents",
};

interface CategoryAccentChipProps {
  lane: CategoryLane;
  label?: string;
  className?: string;
}

/** Accent chip aligned to design tokens — use in tables and lists for lane visibility. */
export function CategoryAccentChip({
  lane,
  label,
  className = "",
}: CategoryAccentChipProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${laneClassMap[lane]} ${className}`}
    >
      {label ?? laneLabelMap[lane]}
    </span>
  );
}

interface CategoryLegendProps {
  className?: string;
  children?: ReactNode;
}

/** Compact legend for filters or column headers. */
export function CategoryLegend({
  className = "",
  children,
}: CategoryLegendProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {(Object.keys(laneLabelMap) as CategoryLane[]).map((lane) => (
        <CategoryAccentChip key={lane} lane={lane} />
      ))}
      {children}
    </div>
  );
}
