import { OperatorWorkspace } from "@/components/operator-workspace";
import { sanitizeOperatorNextPath } from "@/lib/auth/safe-operator-next-path";

export const dynamic = "force-dynamic";

type OperatorPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

function getOperatorEntryCopy(nextPath?: string) {
  switch (nextPath) {
    case "/settings":
    case "/operator/connect":
      return {
        title: "Sign in to open settings.",
        description:
          "Review account status, link a treasury wallet, and check runtime health.",
      };
    case "/agents":
      return {
        title: "Sign in to review agents.",
        description:
          "Open the protected agent registry to inspect live agents, current mandate coverage, and spend authority.",
      };
    case "/transactions":
      return {
        title: "Sign in to review payment attempts.",
        description:
          "Open the protected attempt ledger to inspect allowed, blocked, and unresolved payment truth.",
      };
    default:
      return {
        title: "Sign in to continue",
        description: "Use your operator account to open the console dashboard.",
      };
  }
}

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
  const entryCopy = getOperatorEntryCopy(postAuthRedirect);

  return (
    <OperatorWorkspace
      postAuthRedirect={postAuthRedirect}
      title={entryCopy.title}
      description={entryCopy.description}
    />
  );
}
