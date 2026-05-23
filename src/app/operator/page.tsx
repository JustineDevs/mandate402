import { OperatorWorkspace } from "@/components/operator-workspace";

export const dynamic = "force-dynamic";

export default function OperatorPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:pb-16">
        <OperatorWorkspace />
      </div>
    </main>
  );
}
