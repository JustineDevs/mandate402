import { Dashboard } from "@/components/dashboard";
import { HeaderHero } from "@/components/header-hero";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <main className="page-shell">
      <HeaderHero />
      <section className="content">
        <Dashboard data={data} />
      </section>
    </main>
  );
}
