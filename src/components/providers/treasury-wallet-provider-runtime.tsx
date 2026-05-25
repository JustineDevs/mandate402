"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

type TreasuryWalletProviderRuntimeProps = {
  appId: string;
  clientId?: string;
  children: ReactNode;
};

export function TreasuryWalletProviderRuntime({
  appId,
  clientId,
  children,
}: TreasuryWalletProviderRuntimeProps) {
  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        loginMethods: ["email", "google", "wallet"],
        embeddedWallets: {
          showWalletUIs: false,
          ethereum: {
            createOnLogin: "all-users",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
