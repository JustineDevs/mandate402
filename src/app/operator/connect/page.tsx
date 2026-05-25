import { OperatorConnectionWorkspaceShell } from "@/components/operator-connection-workspace-shell";

export const dynamic = "force-dynamic";

export default function OperatorConnectPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:pb-16">
        <OperatorConnectionWorkspaceShell />
      </div>
    </main>
  );
}
