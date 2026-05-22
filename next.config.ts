import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
