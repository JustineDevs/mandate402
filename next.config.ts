import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
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
