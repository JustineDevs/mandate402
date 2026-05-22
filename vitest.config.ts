import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  cacheDir: path.join(rootDir, ".tmp", "vitest-cache"),
  test: {},
  resolve: {
    alias: {
      "@": path.join(rootDir, "src"),
    },
  },
});
