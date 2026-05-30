"use client";

import type { Session } from "@supabase/supabase-js";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { OperatorLoginForm } from "@/components/auth/operator-login-form";
import type { DashboardData } from "@/lib/dashboard-data";
import { getSupabaseAuthUiConfig } from "@/lib/infrastructure/env";
import {
  ensureOperatorProfileFromSession,
  formatOperatorAuthErrorMessage,
  getSupabaseBrowserClient,
  signInOperatorWithEmailPassword,
  signInOperatorWithGoogle,
  signInOperatorWithWeb3,
} from "@/lib/infrastructure/supabase-browser";

export type DashboardPayload = {
  operator: {
    operatorId: string;
    role: "operator" | "platform_admin";
    onboardingState?: string;
    preferredWalletProvider?: string | null;
    preferredTreasuryMode?: string | null;
  };
  dashboard: DashboardData;
};

type OperatorGateRenderProps = {
  accessToken: string;
  session: Session;
  data: DashboardPayload;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  message: string;
  isPending: boolean;
};

type OperatorGateProps = {
  title: string;
  description: string;
  /** After dashboard is ready, send the user here once (must be pre-sanitized). */
  postAuthRedirect?: string;
  children: (props: OperatorGateRenderProps) => React.ReactNode;
};

export function OperatorGate({
  title,
  description,
  postAuthRedirect,
  children,
}: OperatorGateProps) {
  const router = useRouter();
  const didRedirect = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState(
    "Use your operator account to open this page.",
  );
  const [isPending, startTransition] = useTransition();

  const supabase = getSupabaseBrowserClient();
  const authUi = getSupabaseAuthUiConfig();

  const redirectToSignIn = useCallback(async () => {
    setDashboard(null);
    setSession(null);
    await supabase.auth.signOut().catch(() => undefined);
    router.replace("/operator");
  }, [router, supabase]);

  const loadDashboard = useCallback(
    async (accessToken: string) => {
      const response = await fetch("/api/operator/dashboard", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        await redirectToSignIn();
        throw new Error("Your session is no longer authorized. Sign in again.");
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          text || `Dashboard load failed with ${response.status}`,
        );
      }

      const json = (await response.json()) as {
        data: DashboardPayload;
      };
      setDashboard(json.data);
      setLoadError(null);
    },
    [redirectToSignIn],
  );

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.access_token) {
        void ensureOperatorProfileFromSession(data.session)
          .then(() => loadDashboard(data.session.access_token))
          .catch((error) => {
            setLoadError(
              error instanceof Error
                ? error.message
                : "Unable to load operator data.",
            );
            setMessage(
              error instanceof Error
                ? error.message
                : "Unable to load operator data.",
            );
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession?.access_token) {
        setDashboard(null);
        setLoadError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadDashboard, supabase]);

  useEffect(() => {
    if (
      !postAuthRedirect ||
      didRedirect.current ||
      !session?.access_token ||
      !dashboard ||
      dashboard.operator.onboardingState === "complete"
    ) {
      return;
    }
    didRedirect.current = true;
    router.replace(postAuthRedirect as Route);
  }, [dashboard, postAuthRedirect, router, session?.access_token]);

  if (!session) {
    return (
      <div className="mx-auto my-8 flex w-full max-w-md justify-center px-4">
        <OperatorLoginForm
          className="w-full"
          title={title}
          description={description}
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          createAccountHref={"/operator/sign-up" as Route}
          authUi={authUi}
          isPending={isPending}
          message={message}
          onSubmitEmailPassword={() =>
            startTransition(async () => {
              setMessage("Opening workspace...");
              const { data, error } = await signInOperatorWithEmailPassword({
                email,
                password,
              });

              if (error || !data.session?.access_token) {
                setMessage(formatOperatorAuthErrorMessage(error, "sign_in"));
                return;
              }

              await ensureOperatorProfileFromSession(data.session);
              await loadDashboard(data.session.access_token);
              setMessage("Workspace ready.");
            })
          }
          onGoogleSignIn={() =>
            startTransition(async () => {
              setMessage("Redirecting...");
              const { error } = await signInOperatorWithGoogle();
              if (error) {
                setMessage(error.message);
              }
            })
          }
          onWeb3SignIn={() =>
            startTransition(async () => {
              setMessage("Waiting for signature...");
              const { data, error } = await signInOperatorWithWeb3();
              if (error) {
                setMessage(error.message);
                return;
              }

              if (data.session?.access_token) {
                await ensureOperatorProfileFromSession(data.session);
                await loadDashboard(data.session.access_token);
                setMessage("Workspace ready.");
                return;
              }

              setMessage(
                "Complete the wallet flow and refresh if the session does not return immediately.",
              );
            })
          }
        />
      </div>
    );
  }

  const refresh = async () => {
    setMessage("Refreshing workspace...");
    await loadDashboard(session.access_token);
    setMessage("Workspace refreshed.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMessage("Signed out.");
  };

  if (!dashboard) {
    return (
      <div className="card">
        <div className="eyebrow">Loading</div>
        <p className="muted">Fetching protected operator data...</p>
        {loadError ? <p className="muted mt-3">{loadError}</p> : null}
      </div>
    );
  }

  return children({
    accessToken: session.access_token,
    session,
    data: dashboard,
    refresh,
    signOut,
    message,
    isPending,
  });
}
