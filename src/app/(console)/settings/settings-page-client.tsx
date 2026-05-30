"use client";

import { useSearchParams } from "next/navigation";

import { OperatorGate } from "@/components/operator-gate";
import { OperatorSettingsWorkspace } from "@/components/operator-settings-workspace";

export default function SettingsPageClient() {
  const searchParams = useSearchParams();
  const focusTreasury =
    searchParams.get("treasury") === "1" ||
    searchParams.get("section") === "treasury";

  return (
    <OperatorGate
      title="Sign in to open settings"
      description="Review account status, link a treasury wallet, and check runtime health."
    >
      {({ data, message, refresh }) => (
        <OperatorSettingsWorkspace
          data={data}
          message={message}
          focusTreasury={focusTreasury}
          onTreasuryLinked={() => {
            void refresh();
          }}
        />
      )}
    </OperatorGate>
  );
}
