import type { MetadataRoute } from "next";

const baseUrl = "https://mandate402.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/policies", "/terms", "/privacy"],
        disallow: [
          "/api/",
          "/operator",
          "/operator/",
          "/agents",
          "/audit",
          "/treasury",
          "/mandates",
          "/policy-registry",
          "/receipts",
          "/settings",
          "/transactions",
          "/vendors",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
