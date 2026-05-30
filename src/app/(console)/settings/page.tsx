import { Suspense } from "react";

import SettingsPageClient from "./settings-page-client";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-slate">
          Loading settings…
        </div>
      }
    >
      <SettingsPageClient />
    </Suspense>
  );
}
