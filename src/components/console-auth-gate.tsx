"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { sanitizeOperatorNextPath } from "@/lib/auth/safe-operator-next-path";
import { getSupabaseBrowserClient } from "@/lib/infrastructure/supabase-browser";

type GateState = "checking" | "allowed";

function readSessionCheckTimeoutMs(): number {
  const raw = process.env.NEXT_PUBLIC_CONSOLE_AUTH_SESSION_CHECK_MS?.trim();
  if (!raw) {
    return 12_000;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 500 || parsed > 120_000) {
    return 12_000;
  }
  return parsed;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error("Session check timed out."));
    }, ms);
    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(id);
        reject(error);
      });
  });
}

function buildOperatorSignInHref(pathname: string): Route {
  const safe = sanitizeOperatorNextPath(pathname);
  const qs = safe ? `?next=${encodeURIComponent(safe)}` : "";
  return `/operator${qs}` as Route;
}

/**
 * Wraps operator console routes: requires a Supabase session (same persistence
 * as `OperatorGate`). Unauthenticated users are sent to `/operator` with a
 * **sanitized** `next` query (no open redirects).
 */
export function ConsoleAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const [state, setState] = useState<GateState>("checking");

  pathnameRef.current = pathname;

  useEffect(() => {
    const client = getSupabaseBrowserClient();

    const sessionTimeoutMs = readSessionCheckTimeoutMs();

    void withTimeout(client.auth.getSession(), sessionTimeoutMs)
      .then(({ data: { session } }) => {
        if (!session) {
          setState("checking");
          router.replace(buildOperatorSignInHref(pathnameRef.current));
          return;
        }
        setState("allowed");
      })
      .catch(() => {
        router.replace(buildOperatorSignInHref(pathnameRef.current));
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setState("checking");
        router.replace(buildOperatorSignInHref(pathnameRef.current));
        return;
      }
      setState("allowed");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (state === "checking") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-surface p-6 text-ink">
        <p className="text-sm font-medium text-charcoal">Checking session</p>
        <p className="max-w-sm text-center text-xs text-steel">
          Sign in on the operator page if you are not already authenticated.
        </p>
      </div>
    );
  }

  return children;
}
