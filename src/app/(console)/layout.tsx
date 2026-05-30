import type { Metadata } from "next";

import { ConsoleAuthGate } from "@/components/console-auth-gate";
import { ConsoleProviders } from "@/components/console-providers";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function ConsoleRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConsoleAuthGate>
      <ConsoleProviders>{children}</ConsoleProviders>
    </ConsoleAuthGate>
  );
}
