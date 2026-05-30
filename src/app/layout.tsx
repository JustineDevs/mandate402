import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";

import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const baseUrl = "https://mandate402.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Mandate402",
    template: "%s | Mandate402",
  },
  description:
    "Treasury command for x402 agentic commerce on Morph. Govern AI agent spend with explicit mandates, approved vendors, and operator-visible auditability.",
  applicationName: "Mandate402",
  keywords: [
    "Mandate402",
    "x402",
    "Morph",
    "AI agent payments",
    "machine commerce governance",
    "treasury controls",
    "autonomous agent spend",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: baseUrl,
    title: "Mandate402",
    siteName: "Mandate402",
    description:
      "Govern AI agent spend with treasury controls, policy enforcement, and operator-visible auditability on Morph.",
    images: [
      {
        url: "/images/Mandate402_Logo.png",
        width: 1200,
        height: 630,
        alt: "Mandate402",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mandate402",
    description:
      "Controlled spend for autonomous agents on Morph with explicit mandates and auditability.",
    images: ["/images/Mandate402_Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/images/Mandate402_Logo.png",
    shortcut: "/images/Mandate402_Logo.png",
    apple: "/images/Mandate402_Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only z-[300] rounded-md bg-canvas px-4 py-2 text-sm font-semibold text-ink shadow focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-brand-control focus:ring-offset-2 focus:ring-offset-mandate-green-dark"
        >
          Skip to content
        </a>
        <TooltipProvider delay={200}>
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
