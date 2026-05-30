"use client";

import type { ReactNode } from "react";

import { TreasuryWalletProvider } from "@/components/providers/treasury-wallet-provider";

export function ConsoleProviders({ children }: { children: ReactNode }) {
  return <TreasuryWalletProvider>{children}</TreasuryWalletProvider>;
}
