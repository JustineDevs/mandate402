"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { getPrivyRuntimeConfig } from "@/lib/infrastructure/env";

type TreasuryWalletProviderProps = {
  children: ReactNode;
};

const RuntimePrivyProvider = dynamic(
  () =>
    import("./treasury-wallet-provider-runtime").then(
      (mod) => mod.TreasuryWalletProviderRuntime,
    ),
  {
    ssr: false,
  },
);

export function TreasuryWalletProvider({
  children,
}: TreasuryWalletProviderProps) {
  const privy = getPrivyRuntimeConfig();

  if (!privy.appId) {
    return <>{children}</>;
  }

  return (
    <RuntimePrivyProvider appId={privy.appId} clientId={privy.clientId}>
      {children}
    </RuntimePrivyProvider>
  );
}
