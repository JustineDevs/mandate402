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
  },
  resolve: {
    alias: {
      "@": path.join(rootDir, "src"),
    },
  },
});
