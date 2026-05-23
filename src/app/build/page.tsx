import { ConsoleShell } from "@/components/console-shell";
import { StatusPill } from "@/components/status-pill";
import { getBuildDiaryEntries } from "@/lib/build-diary";

export default async function BuildPage() {
  const entries = await getBuildDiaryEntries();

  return (
    <ConsoleShell
      activeTab="Build"
      eyebrow="Build Diary"
      title="Build Diary"
      summary="Build Diary keeps implementation and review notes visible as part of the product surface instead of scattering them across private context."
      actions={<StatusPill label={`${entries.length} entries`} tone="info" />}
    >
      <section className="rounded-lg border border-hairline bg-canvas p-8 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-charcoal">Recent Entries</h2>
            <p className="mt-2 text-sm text-steel">
              Repo-native build notes for the current frontend alignment pass.
            </p>
          </div>
          <StatusPill label="Local diary" tone="success" />
        </div>

        <div className="space-y-4">
          {entries.map((entry, index) => (
            <article
              key={entry.id}
              className="grid gap-4 rounded-lg border border-hairline bg-surface-soft p-5 md:grid-cols-[auto_1fr]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas-dark text-sm font-bold text-on-dark">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="w-px self-stretch bg-hairline" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill label={entry.status} tone="neutral" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                    {entry.date}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold text-charcoal">
                  {entry.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate">
                  {entry.summary}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </ConsoleShell>
  );
}
