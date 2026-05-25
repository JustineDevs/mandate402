import { LegalPageShell } from "@/components/legal-page-shell";
import { termsPageContent } from "@/lib/legal-content";

export const metadata = {
  title: "Terms | Mandate402",
  description:
    "Simple programming service terms for Mandate402 custom application and integration work.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms",
    description:
      "Simple programming service terms for Mandate402 custom application and integration work.",
    url: "/terms",
  },
  twitter: {
    title: "Terms",
    description:
      "Simple programming service terms for Mandate402 custom application and integration work.",
  },
};

export default function TermsPage() {
  return <LegalPageShell content={termsPageContent} />;
}
