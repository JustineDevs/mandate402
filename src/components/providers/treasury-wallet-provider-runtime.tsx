"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

import { getTreasuryPrivyProviderConfig } from "@/lib/infrastructure/privy-config";

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
      config={getTreasuryPrivyProviderConfig()}
    >
      {children}
    </PrivyProvider>
  );
}
