import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
