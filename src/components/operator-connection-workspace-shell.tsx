"use client";

import nextDynamic from "next/dynamic";

const OperatorConnectionWorkspace = nextDynamic(
  () =>
    import("@/components/operator-connection-workspace").then(
      (mod) => mod.OperatorConnectionWorkspace,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="card mx-auto my-8 max-w-2xl">
        <div className="eyebrow">Loading</div>
        <p className="muted">
          Preparing treasury connection setup for the current operator…
        </p>
      </div>
    ),
  },
);

export function OperatorConnectionWorkspaceShell() {
  return <OperatorConnectionWorkspace />;
}
