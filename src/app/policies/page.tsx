import { LegalPageShell } from "@/components/legal-page-shell";
import { policiesPageContent } from "@/lib/legal-content";

export const metadata = {
  title: "Policies | Mandate402",
  description:
    "Service policies for Mandate402 programming, delivery, support, and security work.",
  alternates: {
    canonical: "/policies",
  },
  openGraph: {
    title: "Policies",
    description:
      "Service policies for Mandate402 programming, delivery, support, and security work.",
    url: "/policies",
  },
  twitter: {
    title: "Policies",
    description:
      "Service policies for Mandate402 programming, delivery, support, and security work.",
  },
};

export default function PoliciesPage() {
  return <LegalPageShell content={policiesPageContent} />;
}
