import { OperatorWorkspace } from "@/components/operator-workspace";
import { sanitizeOperatorNextPath } from "@/lib/auth/safe-operator-next-path";

export const dynamic = "force-dynamic";

type OperatorPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

function pickNext(raw: string | string[] | undefined): string | undefined {
  if (raw === undefined) {
    return undefined;
  }
  return typeof raw === "string" ? raw : raw[0];
}

export default async function OperatorPage({
  searchParams,
}: OperatorPageProps) {
  const sp = (await searchParams) ?? {};
  const postAuthRedirect = sanitizeOperatorNextPath(pickNext(sp.next));

  return (
    <main className="min-h-screen bg-surface text-ink">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:pb-16">
        <OperatorWorkspace
          postAuthRedirect={postAuthRedirect ?? "/operator/connect"}
        />
      </div>
    </main>
  );
}
