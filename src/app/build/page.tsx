import { ConsoleShell } from "@/components/console-shell";
import { StatusPill } from "@/components/status-pill";
import { getBuildDiaryEntries } from "@/lib/build-diary";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function BuildPage() {
  const entries = await getBuildDiaryEntries();

  return (
    <ConsoleShell
      activeTab="Build"
      eyebrow="Build Diary"
      title="Trace the release-hardening journey."
      summary="Build Diary captures the repository’s implementation gates, evidence reviews, security notes, and release blockers as first-class artifacts instead of ephemeral chat context."
      actions={
        <StatusPill label={`${entries.length} diary entries`} tone="info" />
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-[26px] border border-[#d8e6dd] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
                Chronicle
              </div>
              <h2 className="mt-2 text-2xl font-bold text-[#0f1720]">
                Hardening entries
              </h2>
            </div>
            <StatusPill label="Live repo docs" tone="success" />
          </div>

          <div className="space-y-4">
            {entries.map((entry, index) => (
              <article
                key={entry.id}
                className="grid gap-4 rounded-[22px] border border-[#e4ece9] bg-[#fbfdfc] p-5 md:grid-cols-[auto_1fr]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f2b33] text-sm font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="h-full w-px bg-[#d6e4dc]" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill label={entry.category} tone="neutral" />
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#64748b]">
                      Updated {formatDate(entry.updatedAt)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-[#1f2937]">
                    {entry.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#475569]">
                    {entry.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="rounded-[26px] border border-[#d8e6dd] bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
              Production release posture
            </div>
            <h2 className="mt-3 text-2xl font-bold text-[#0f1720]">
              Main is the release authority.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#475569]">
              Release tags and release notes come from the `main` branch, while
              `development` stays aligned as the integration mirror.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusPill label="semantic-release on main" tone="success" />
              <StatusPill label="sync back to development" tone="info" />
            </div>
          </section>

          <section className="rounded-[26px] border border-[#d8e6dd] bg-[#0f1720] p-6 text-white shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Operator build checklist
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <li>Keep repo-safety green before opening a PR.</li>
              <li>Keep release-readiness green before merging to `main`.</li>
              <li>Record hardening evidence in tracked repo docs.</li>
              <li>Do not hide degraded runtime or unknown execution state.</li>
            </ul>
          </section>
        </aside>
      </div>
    </ConsoleShell>
  );
}
