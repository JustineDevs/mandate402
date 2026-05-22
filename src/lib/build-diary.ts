import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

export type BuildDiaryEntry = {
  id: string;
  title: string;
  summary: string;
  category: string;
  updatedAt: string;
};

function toCategory(fileName: string) {
  return fileName
    .replace("PRODUCTION-HARDENING-", "")
    .replace(".md", "")
    .toLowerCase()
    .replace(/-/g, " ");
}

function extractSummary(markdown: string) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const summaryLine = lines.find(
    (line) =>
      !line.startsWith("#") && !line.startsWith("-") && !line.startsWith("|"),
  );

  return summaryLine ?? "No summary recorded yet.";
}

export async function getBuildDiaryEntries(): Promise<BuildDiaryEntry[]> {
  const diaryDir = path.join(process.cwd(), "docs", "plan");
  const files = (await readdir(diaryDir)).filter((file) =>
    file.endsWith(".md"),
  );

  const entries = await Promise.all(
    files.map(async (fileName) => {
      const fullPath = path.join(diaryDir, fileName);
      const [markdown, fileStat] = await Promise.all([
        readFile(fullPath, "utf8"),
        stat(fullPath),
      ]);
      const title =
        markdown
          .split("\n")
          .find((line) => line.startsWith("# "))
          ?.replace(/^# /, "")
          .trim() ?? fileName.replace(".md", "");

      return {
        id: fileName,
        title,
        summary: extractSummary(markdown),
        category: toCategory(fileName),
        updatedAt: fileStat.mtime.toISOString(),
      };
    }),
  );

  return entries.sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
  );
}
