import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono, Sora } from "next/font/google";

import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mandate402",
  description: "Controlled spend for autonomous agents on Morph.",
  icons: {
    icon: "/images/Mandate402_logo.svg",
    shortcut: "/images/Mandate402_logo.svg",
    apple: "/images/Mandate402_logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        sora.variable,
        ibmPlexMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className={`${sora.className} antialiased`}>
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
