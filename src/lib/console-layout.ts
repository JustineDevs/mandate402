import { cn } from "@/lib/utils";

/** Standard bordered console content panel — full width, shrink-safe in grids. */
export const consolePanelClass =
  "min-w-0 w-full rounded-lg border border-hairline bg-canvas p-4 shadow-sm sm:p-6";

export type ConsoleSplitVariant =
  | "default"
  | "wide"
  | "balanced"
  | "narrow"
  | "runtime";

const splitCols: Record<ConsoleSplitVariant, string> = {
  default: "xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]",
  wide: "xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]",
  balanced: "xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
  narrow: "xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
  runtime: "xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]",
};

/** Two-column console layout: stacks on small screens, splits at xl with minmax(0,…) overflow safety. */
export function consoleSplitSection(
  variant: ConsoleSplitVariant = "default",
  className?: string,
) {
  return cn(
    "grid min-w-0 w-full grid-cols-1 items-start gap-4 sm:gap-6",
    splitCols[variant],
    className,
  );
}

/** Three-up metric / summary cards. */
export function consoleStatGrid3(className?: string) {
  return cn(
    "grid min-w-0 w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3",
    className,
  );
}

/** Four-up metric / summary cards. */
export function consoleStatGrid4(className?: string) {
  return cn(
    "grid min-w-0 w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4",
    className,
  );
}
