import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([
  ".git",
  ".next",
  ".omx",
  ".tmp",
  "node_modules",
  "contracts/out",
  "contracts/cache",
  "contracts/broadcast",
  "data",
]);
const ignoredFiles = new Set([
  ".env.local",
  "internal/dont push.txt",
  "mandate402",
]);

const violations = [];

function shouldIgnore(relPath) {
  if (ignoredFiles.has(relPath)) return true;
  const segments = relPath.split("/");
  for (const dir of ignoredDirs) {
    if (!dir.includes("/") && segments.includes(dir)) return true;
    if (relPath === dir || relPath.startsWith(`${dir}/`)) return true;
  }
  return false;
}

function scanFile(relPath) {
  if (shouldIgnore(relPath)) return;
  const text = readFileSync(path.join(root, relPath), "utf8");
  const checks = [
    {
      name: "Morph access key",
      regex: /morph_ak_[a-z0-9]+/i,
    },
    {
      name: "Morph secret key",
      regex: /morph_sk_[a-z0-9]+/i,
    },
    {
      name: "Hardcoded CMC API key",
      regex: /^CMC_API_KEY=(?!replace-me\b|replace_me\b|\.\.\.$).+/m,
    },
    {
      name: "Hardcoded CoinAPI key",
      regex: /^COINAPI_KEY=(?!replace-me\b|replace_me\b|\.\.\.$).+/m,
    },
    {
      name: "Hardcoded private key env",
      regex: /(PRIVATE_KEY|DEPLOYER_PRIVATE_KEY)\s*=\s*0x[a-fA-F0-9]{64}/,
    },
    {
      name: "Local absolute path leak",
      regex: /\/mnt\/c\/users\/justinedevs\/downloads\/morph/i,
    },
  ];

  for (const check of checks) {
    if (check.regex.test(text)) {
      violations.push(`${relPath}: ${check.name}`);
    }
  }
}

function walk(dirRel = ".") {
  const dir = path.join(root, dirRel);
  for (const entry of readdirSync(dir)) {
    const rel = dirRel === "." ? entry : `${dirRel}/${entry}`;
    if (shouldIgnore(rel)) continue;
    const stat = statSync(path.join(root, rel));
    if (stat.isDirectory()) {
      walk(rel);
      continue;
    }
    scanFile(rel);
  }
}

walk();

if (violations.length > 0) {
  console.error("Repository safety check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Repository safety check passed.");
