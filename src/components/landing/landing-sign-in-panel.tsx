"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AccessMethod = "email_operator" | "wallet_session";

type LandingSignInPanelProps = {
  operatorHref: Route;
  focusRingClass: string;
};

/**
 * Landing sign-in: opens a dialog to pick an access path, then routes to the operator workspace.
 * Wallet and credential UI stay in-console per ADR — this control only records the user's choice.
 */
export function LandingSignInPanel({
  operatorHref,
  focusRingClass,
}: LandingSignInPanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<AccessMethod>("email_operator");
  const legendId = useId();
  const radioGroupName = `signin-method-${useId().replace(/:/g, "")}`;

  function continueToWorkspace() {
    const entry = method === "wallet_session" ? "wallet" : "email";
    router.push(`${operatorHref}?entry=${entry}`);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex min-h-11 w-full max-w-xs items-center justify-center bg-mandate-green px-6 py-3 text-base font-semibold text-canvas transition-colors hover:bg-mandate-green-dark sm:min-h-12 sm:max-w-sm",
          focusRingClass,
          "rounded-sm",
        )}
      >
        Sign in
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[calc(100%-2rem)] gap-5 sm:max-w-md"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-lg">
              Choose how you sign in
            </DialogTitle>
            <DialogDescription className="text-pretty text-left">
              Select an access path. Email, operator ID, password, and wallet
              flows all run inside the operator workspace — this step only tells
              Mandate402 which entry lane you intend to use.
            </DialogDescription>
          </DialogHeader>

          <fieldset className="m-0 min-w-0 grid gap-3 border-0 p-0">
            <legend id={legendId} className="sr-only">
              Access method
            </legend>

            <label
              className={cn(
                "block cursor-pointer rounded-lg border p-4 text-left transition-colors outline-none focus-within:ring-2 focus-within:ring-mandate-green-mid focus-within:ring-offset-2",
                method === "email_operator"
                  ? "border-mandate-green bg-surface-feature ring-2 ring-mandate-green-mid/35"
                  : "border-hairline bg-canvas hover:bg-surface-soft",
              )}
            >
              <input
                type="radio"
                name={radioGroupName}
                value="email_operator"
                checked={method === "email_operator"}
                onChange={() => setMethod("email_operator")}
                className="sr-only"
              />
              <div className="font-mono-reference text-[11px] font-semibold uppercase tracking-wider text-steel">
                Email / operator ID
              </div>
              <p className="mt-2 text-sm leading-snug text-charcoal">
                Password or SSO-style session in the workspace. Use this when
                humans operate the console with named credentials.
              </p>
            </label>

            <label
              className={cn(
                "block cursor-pointer rounded-lg border p-4 text-left transition-colors outline-none focus-within:ring-2 focus-within:ring-mandate-green-mid focus-within:ring-offset-2",
                method === "wallet_session"
                  ? "border-mandate-green bg-surface-feature ring-2 ring-mandate-green-mid/35"
                  : "border-hairline bg-canvas hover:bg-surface-soft",
              )}
            >
              <input
                type="radio"
                name={radioGroupName}
                value="wallet_session"
                checked={method === "wallet_session"}
                onChange={() => setMethod("wallet_session")}
                className="sr-only"
              />
              <div className="font-mono-reference text-[11px] font-semibold uppercase tracking-wider text-steel">
                Password / wallet / session
              </div>
              <p className="mt-2 text-sm leading-snug text-charcoal">
                Wallet pairing and delegated session UX stay in the workspace.
                Pick this if you plan to connect a signer or treasury-facing
                session there.
              </p>
            </label>
          </fieldset>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={continueToWorkspace}>
              Continue to workspace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
