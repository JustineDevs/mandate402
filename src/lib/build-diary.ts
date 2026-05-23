export interface BuildDiaryEntry {
  id: string;
  title: string;
  summary: string;
  status: "implemented" | "active" | "pending";
  date: string;
}

const buildDiaryEntries: BuildDiaryEntry[] = [
  {
    id: "entry-01",
    title: "Sherwin ADR restored",
    summary:
      "The full recovered wireframe brief is back in ADR-0002, including landing, missing pages, and shared interaction surfaces.",
    status: "implemented",
    date: "2026-05-23",
  },
  {
    id: "entry-02",
    title: "Missing page alignment pass",
    summary:
      "Build, policies, vendors, transactions, receipts, and settings are being aligned to the restored ASCII layouts instead of left as dead routes.",
    status: "active",
    date: "2026-05-23",
  },
  {
    id: "entry-03",
    title: "Manual UI review checkpoint",
    summary:
      "The branch stays local until the restored frontend surfaces are reviewed against the ADR and approved visually.",
    status: "pending",
    date: "2026-05-23",
  },
];

export async function getBuildDiaryEntries(): Promise<BuildDiaryEntry[]> {
  return buildDiaryEntries;
}
