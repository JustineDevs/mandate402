import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

const roots = [
  ".next",
  ".next-build",
  ".next-cloudflare",
  ".open-next",
  ".vercel/output",
  "tmp/mandate402-next-build",
  ".tmp/wrangler-cloudflare-dry-run",
  ".tmp/wrangler-dry-run",
];

const RETRIES = 8;
const BASE_DELAY_MS = 120;

function isLockContentionCode(code) {
  return (
    code === "ENOTEMPTY" ||
    code === "EBUSY" ||
    code === "EPERM" ||
    code === "EACCES"
  );
}

/**
 * Windows (and locked files from dev servers / AV) often makes `rmSync` throw
 * ENOTEMPTY / EBUSY / EPERM even with `recursive: true`. Retries give a
 * trustworthy clean before OpenNext / next build.
 */
async function rmTreeWithRetries(absPath, options) {
  const { tolerateFailure = false } = options ?? {};
  if (!existsSync(absPath)) {
    return;
  }

  let lastError;
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    try {
      rmSync(absPath, { recursive: true, force: true });
      return;
    } catch (error) {
      lastError = error;
      const code = /** @type {NodeJS.ErrnoException} */ (error).code;
      if (code === "ENOENT") {
        return;
      }
      if (!isLockContentionCode(code)) {
        throw error;
      }
      await setTimeout(BASE_DELAY_MS * (attempt + 1));
    }
  }

  if (tolerateFailure && lastError) {
    const code = /** @type {NodeJS.ErrnoException} */ (lastError).code;
    if (isLockContentionCode(code)) {
      console.warn(
        `[clean-build-artifacts] Could not remove ${absPath} (${code}). Another process may be using it (e.g. \`next dev\`). \`pnpm build\` uses \`distDir\` \`.next-build\`, so the build can continue.`,
      );
      return;
    }
  }

  throw lastError;
}

for (const root of roots) {
  const abs = path.join(process.cwd(), root);
  const tolerate = root === ".next";
  await rmTreeWithRetries(abs, { tolerateFailure: tolerate });
}
