import { LegalPageShell } from "@/components/legal-page-shell";
import { privacyPageContent } from "@/lib/legal-content";

export const metadata = {
  title: "Privacy | Mandate402",
  description:
    "Privacy policy for the Mandate402 public site and related programming-service engagements.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy",
    description:
      "Privacy policy for the Mandate402 public site and related programming-service engagements.",
    url: "/privacy",
  },
  twitter: {
    title: "Privacy",
    description:
      "Privacy policy for the Mandate402 public site and related programming-service engagements.",
  },
};

export default function PrivacyPage() {
  return <LegalPageShell content={privacyPageContent} />;
}
