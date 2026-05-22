"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useEffectEvent, useState, useTransition } from "react";

import { Dashboard } from "@/components/dashboard";
import type { DashboardData } from "@/lib/dashboard-data";
import { getSupabaseBrowserClient } from "@/lib/infrastructure/supabase-browser";

type DashboardPayload = {
  operator: {
    operatorId: string;
    role: "operator" | "platform_admin";
  };
  dashboard: DashboardData;
};

export function OperatorWorkspace() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [message, setMessage] = useState(
    "Sign in to open the operator workspace.",
  );
  const [isPending, startTransition] = useTransition();

  const supabase = getSupabaseBrowserClient();

  const loadDashboard = useEffectEvent(async (accessToken: string) => {
    const response = await fetch("/api/operator/dashboard", {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Dashboard load failed with ${response.status}`);
    }

    const json = (await response.json()) as {
      data: DashboardPayload;
    };
    setDashboard(json.data);
  });

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.access_token) {
        void loadDashboard(data.session.access_token).catch((error) => {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load operator workspace.",
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
      }
    });

    return () => subscription.unsubscribe();
  }, [loadDashboard, supabase]);

  if (!session) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "24px auto" }}>
        <div className="eyebrow">Protected Operator Workspace</div>
        <div className="section-heading">
          Sign in with your Supabase operator account.
        </div>
        <div className="form-grid" style={{ marginTop: 18 }}>
          <div className="field">
            <label htmlFor="operator-email">Email</label>
            <input
              id="operator-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="operator-password">Password</label>
            <input
              id="operator-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>
        <div className="actions" style={{ marginTop: 18 }}>
          <button
            className="pill pill-primary"
            disabled={isPending}
            type="button"
            onClick={() =>
              startTransition(async () => {
                setMessage("Signing in...");
                const { data, error } = await supabase.auth.signInWithPassword({
                  email,
                  password,
                });

                if (error || !data.session?.access_token) {
                  setMessage(error?.message ?? "Sign-in failed.");
                  return;
                }

                await loadDashboard(data.session.access_token);
                setMessage("Operator workspace ready.");
              })
            }
          >
            Sign In
          </button>
        </div>
        <p className="muted" style={{ marginTop: 18 }}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="card">
        <div className="eyebrow">Operator Session</div>
        <div className="section-heading">
          Role: {dashboard?.operator.role ?? "loading"} | Operator:{" "}
          {dashboard?.operator.operatorId ?? "loading"}
        </div>
        <div className="actions" style={{ marginTop: 18 }}>
          <button
            className="pill pill-secondary"
            disabled={isPending}
            type="button"
            onClick={() =>
              startTransition(async () => {
                setMessage("Refreshing workspace...");
                await loadDashboard(session.access_token);
                setMessage("Workspace refreshed.");
              })
            }
          >
            Refresh
          </button>
          <button
            className="pill pill-secondary"
            disabled={isPending}
            type="button"
            onClick={() =>
              startTransition(async () => {
                await supabase.auth.signOut();
                setMessage("Signed out.");
              })
            }
          >
            Sign Out
          </button>
        </div>
        <p className="muted" style={{ marginTop: 18 }}>
          {message}
        </p>
      </div>

      {dashboard ? (
        <Dashboard
          accessToken={session.access_token}
          data={dashboard.dashboard}
          onChanged={() => loadDashboard(session.access_token)}
        />
      ) : (
        <div className="card">
          <div className="eyebrow">Loading</div>
          <p className="muted">Fetching protected operator data...</p>
        </div>
      )}
    </div>
  );
}
