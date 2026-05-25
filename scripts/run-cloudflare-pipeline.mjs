import { spawnSync } from "node:child_process";
import path from "node:path";

function runNodeScript(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    env: process.env,
  });

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }

  if (typeof result.status !== "number") {
    process.exit(1);
  }
}

runNodeScript(path.join(process.cwd(), "scripts/clean-build-artifacts.mjs"));
runNodeScript(path.join(process.cwd(), "scripts/run-cloudflare-build.mjs"));
runNodeScript(path.join(process.cwd(), "scripts/run-cloudflare-dry-run.mjs"));
