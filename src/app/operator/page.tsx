import { HeaderHero } from "@/components/header-hero";
import { OperatorWorkspace } from "@/components/operator-workspace";

export const dynamic = "force-dynamic";

export default function OperatorPage() {
  return (
    <main className="page-shell">
      <HeaderHero />
      <section className="content">
        <OperatorWorkspace />
      </section>
    </main>
  );
}
