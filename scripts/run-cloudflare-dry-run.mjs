import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const wranglerPkgPath = require.resolve("wrangler/package.json");
const wranglerPkg = require(wranglerPkgPath);
const wranglerBin = path.resolve(
  path.dirname(wranglerPkgPath),
  wranglerPkg.bin.wrangler,
);

const result = spawnSync(
  process.execPath,
  [
    wranglerBin,
    "deploy",
    "--config",
    "wrangler.jsonc",
    "--dry-run",
    "--outdir",
    ".tmp/wrangler-cloudflare-dry-run",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      XDG_CONFIG_HOME: ".tmp/wrangler-config",
      HOME: ".tmp/wrangler-home",
    },
  },
);

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
