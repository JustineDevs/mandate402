import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contractsDir = path.join(rootDir, "contracts");

function forgeAvailable() {
  const probe = spawnSync("forge", ["--version"], {
    encoding: "utf8",
    shell: true,
  });
  return probe.status === 0;
}

if (!forgeAvailable()) {
  console.warn(
    "[lefthook] skipping contracts pre-commit (forge not on PATH). Install Foundry or run `forge test` in contracts/ before pushing.",
  );
  process.exit(0);
}

const env = {
  ...process.env,
  FOUNDRY_CACHE_PATH: "cache",
  FOUNDRY_OUT: "out",
};

const result = spawnSync("forge", ["test"], {
  cwd: contractsDir,
  env,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
