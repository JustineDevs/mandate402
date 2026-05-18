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

const args = ["vitest", "run", ...process.argv.slice(2)];
const child = spawn("pnpm", args, {
  cwd: rootDir,
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
