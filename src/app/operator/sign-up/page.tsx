import { OperatorSignUpWorkspace } from "@/components/operator-sign-up-workspace";

export const dynamic = "force-dynamic";

export default function OperatorSignUpPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:pb-16">
        <OperatorSignUpWorkspace />
      </div>
    </main>
  );
}
