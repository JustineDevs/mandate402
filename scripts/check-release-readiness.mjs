import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "CHANGELOG.md",
  "README.md",
  "LICENSE",
  ".changeset/config.json",
  ".github/workflows/ci.yml",
  ".github/workflows/release.yml",
  ".github/workflows/verify-contract.yml",
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error("Release readiness failed. Missing files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const changelog = readFileSync("CHANGELOG.md", "utf8").trim();
if (!changelog) {
  console.error("Release readiness failed: CHANGELOG.md is empty.");
  process.exit(1);
}

console.log("Release readiness check passed.");
