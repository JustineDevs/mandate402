import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger second column (seconds), passed as CSS delay. */
  delay?: number;
};

/**
 * Gentle fade-up on first paint. Implemented with CSS (`landing-reveal` in globals.css)
 * so server HTML matches the client — avoids `motion` + `useReducedMotion()` hydration
 * mismatches when the OS prefers reduced motion. That preference is still honored via the
 * global `prefers-reduced-motion` rules in globals.css.
 */
export function LandingReveal({
  children,
  className,
  delay = 0,
}: LandingRevealProps) {
  const style = {
    "--landing-reveal-delay": `${delay}s`,
  } as CSSProperties;

  return (
    <div className={cn("landing-reveal", className)} style={style}>
      {children}
    </div>
  );
}
