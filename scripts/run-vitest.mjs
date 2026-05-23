import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const tempDir = path.join(rootDir, ".tmp", "vitest-tmp");

mkdirSync(tempDir, { recursive: true });

const env = {
  ...process.env,
  TEMP: tempDir,
  TMP: tempDir,
  TMPDIR: tempDir,
};

const vitestEntry = path.join(rootDir, "node_modules", "vitest", "vitest.mjs");
const args = [vitestEntry, "run", ...process.argv.slice(2)];
const child = spawn(process.execPath, args, {
  cwd: rootDir,
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
