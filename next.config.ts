import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

/** Absolute repo root (where `package.json` + `node_modules/next` live). Turbopack can otherwise infer `src/app` on Windows and break route compilation (404s while `/` still works). */
const turbopackRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
);
const isVercelBuild = process.env.VERCEL === "1";
const proofDistDir = process.env.MANDATE402_NEXT_DIST_DIR?.trim();
const farcasterSolanaShim = path.join(
  turbopackRoot,
  "src/lib/shims/farcaster-mini-app-solana.ts",
);

const nextConfig: NextConfig = {
  typedRoutes: true,
  distDir: proofDistDir || undefined,
  /** Align tracing root with Turbopack root so resolution stays consistent. */
  outputFileTracingRoot: turbopackRoot,
  outputFileTracingIncludes: isVercelBuild
    ? undefined
    : {
        "/*": ["./node_modules/pg-cloudflare/dist/**/*"],
      },
  turbopack: {
    root: turbopackRoot,
  },
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias["@farcaster/mini-app-solana"] = farcasterSolanaShim;
    return config;
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  void import("@opennextjs/cloudflare")
    .then((m) => m.initOpenNextCloudflareForDev())
    .catch((error) => {
      console.warn(
        "OpenNext Cloudflare dev init failed:",
        error instanceof Error ? error.message : String(error),
      );
    });
}
