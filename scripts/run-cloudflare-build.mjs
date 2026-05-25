import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const distDir = process.env.MANDATE402_NEXT_DIST_DIR?.trim();
const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
const tsconfigSnapshot = readFileSync(tsconfigPath, "utf8");
const pnpmPackageDir = readdirSync(
  path.join(process.cwd(), "node_modules/.pnpm"),
).find((entry) => entry.startsWith("@opennextjs+cloudflare@"));

if (!pnpmPackageDir) {
  throw new Error(
    "Unable to locate @opennextjs/cloudflare in node_modules/.pnpm.",
  );
}

const openNextBin = path.join(
  process.cwd(),
  "node_modules/.pnpm",
  pnpmPackageDir,
  "node_modules/@opennextjs/cloudflare/dist/cli/index.js",
);

let result;

try {
  result = spawnSync(process.execPath, [openNextBin, "build"], {
    stdio: "inherit",
    env: distDir
      ? {
          ...process.env,
          MANDATE402_NEXT_DIST_DIR: distDir,
        }
      : process.env,
  });
} finally {
  writeFileSync(tsconfigPath, tsconfigSnapshot);
}

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
