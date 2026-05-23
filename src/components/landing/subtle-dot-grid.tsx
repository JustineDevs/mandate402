import { cn } from "@/lib/utils";

/** CSS-only dot field (React Bits DotGrid–style) — no WebGL, negligible bundle. */
export function SubtleDotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-[0.22]",
        "[background-image:radial-gradient(circle_at_center,rgb(100_116_139/0.35)_1px,transparent_1px)]",
        "[background-size:20px_20px]",
        className,
      )}
    />
  );
}
