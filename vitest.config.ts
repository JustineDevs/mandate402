import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  cacheDir: path.join(rootDir, ".tmp", "vitest-cache"),
  test: {
    // Shared module state (e.g. Postgres schema bootstrap flags) must persist across
    // test files when multiple suites hit the same database in one Vitest process.
    isolate: false,
    // Playwright lives under e2e/ with *.spec.ts; do not collect it as Vitest suites.
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.join(rootDir, "src"),
    },
  },
});
