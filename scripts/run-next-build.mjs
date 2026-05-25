import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const defaultDistDir = path.join("tmp", "mandate402-next-build");
const distDir = process.env.MANDATE402_NEXT_DIST_DIR?.trim() || defaultDistDir;
const nextBin = require.resolve("next/dist/bin/next");
const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
const tsconfigSnapshot = readFileSync(tsconfigPath, "utf8");

let result;

try {
  result = spawnSync(process.execPath, [nextBin, "build", "--webpack"], {
    stdio: "inherit",
    env: {
      ...process.env,
      MANDATE402_NEXT_DIST_DIR: distDir,
    },
  });
} finally {
  writeFileSync(tsconfigPath, tsconfigSnapshot);
}

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
