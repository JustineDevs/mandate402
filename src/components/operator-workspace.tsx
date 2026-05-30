"use client";

import { Dashboard } from "@/components/dashboard";
import { OperatorGate } from "@/components/operator-gate";

export function OperatorWorkspace({
  postAuthRedirect,
  title = "Sign in to continue",
  description = "Use your operator account to open the console dashboard.",
}: {
  postAuthRedirect?: string;
  title?: string;
  description?: string;
}) {
  return (
    <OperatorGate
      title={title}
      description={description}
      postAuthRedirect={postAuthRedirect}
    >
      {({ accessToken, data, refresh, signOut, message, isPending }) => (
        <Dashboard
          accessToken={accessToken}
          data={data.dashboard}
          operator={data.operator}
          onRefresh={refresh}
          onChanged={refresh}
          onSignOut={signOut}
          message={message}
          isPending={isPending}
        />
      )}
    </OperatorGate>
  );
}
