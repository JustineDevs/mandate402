"use client";

import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

type LandingSignInPanelProps = {
  operatorHref: Route;
  focusRingClass: string;
};

/**
 * Landing access: single CTA to the operator console (sign-in completes there via Supabase).
 * No logo here (brand mark lives on the operator sign-in card); no method picker on marketing.
 */
export function LandingSignInPanel({
  operatorHref,
  focusRingClass,
}: LandingSignInPanelProps) {
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4 sm:max-w-sm">
      <Link
        href={operatorHref}
        className={cn(
          "inline-flex min-h-11 w-full items-center justify-center bg-mandate-green px-6 py-3 text-base font-semibold text-canvas transition-colors hover:bg-mandate-green-dark sm:min-h-12",
          focusRingClass,
          "rounded-sm",
        )}
      >
        Continue to operator console
      </Link>
      <p className="text-center text-xs leading-relaxed text-steel sm:text-sm">
        Email, Google, or wallet sign-in runs on the operator workspace after
        you continue.
      </p>
    </div>
  );
}
