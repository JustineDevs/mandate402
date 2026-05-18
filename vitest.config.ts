import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    cacheDir: path.join(rootDir, ".tmp", "vitest-cache"),
  },
  resolve: {
    alias: {
      "@": path.join(rootDir, "src"),
    },
  },
});
