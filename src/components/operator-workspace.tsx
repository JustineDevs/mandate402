"use client";

import { Dashboard } from "@/components/dashboard";
import { OperatorGate } from "@/components/operator-gate";

export function OperatorWorkspace({
  postAuthRedirect,
}: {
  postAuthRedirect?: string;
}) {
  return (
    <OperatorGate
      title="Sign in to continue."
      description="Access the protected workspace where your team can review activity, manage approvals, and keep payment decisions visible and controlled."
      postAuthRedirect={postAuthRedirect}
    >
      {({ accessToken, data, refresh, signOut, message, isPending }) => (
        <div className="grid gap-6">
          <div className="card">
            <div className="eyebrow">Operator Session</div>
            <div className="section-heading">
              Role: {data.operator.role} | Operator: {data.operator.operatorId}
            </div>
            <div className="actions mt-5">
              <button
                className="pill pill-secondary"
                disabled={isPending}
                type="button"
                onClick={() => void refresh()}
              >
                Refresh
              </button>
              <button
                className="pill pill-secondary"
                disabled={isPending}
                type="button"
                onClick={() => void signOut()}
              >
                Sign Out
              </button>
            </div>
            <p className="muted mt-5">{message}</p>
          </div>

          <Dashboard
            accessToken={accessToken}
            data={data.dashboard}
            onChanged={refresh}
          />
        </div>
      )}
    </OperatorGate>
  );
}
