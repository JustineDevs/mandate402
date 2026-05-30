"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import type { GlobalSearchItem } from "@/components/global-search";
import { TopNav } from "@/components/top-nav";
import { useConsoleRuntimeChrome } from "@/hooks/use-console-runtime-chrome";
import { useConsoleTreasuryWallet } from "@/hooks/use-console-treasury-wallet";
import { getPrivyRuntimeConfig } from "@/lib/infrastructure/env";

function formatWalletLabel(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

type ConsoleTopNavProps = {
  searchExtraItems?: GlobalSearchItem[];
};

export function ConsoleTopNav({ searchExtraItems }: ConsoleTopNavProps) {
  const router = useRouter();
  const runtimeChrome = useConsoleRuntimeChrome();
  const privyConfigured = Boolean(getPrivyRuntimeConfig().appId);
  const {
    displayAddress,
    primaryWallet,
    isWalletPending,
    connectExternalWallet,
  } = useConsoleTreasuryWallet();

  const onProfileClick = () => {
    router.push("/settings" as Route);
  };

  const onWalletClick = () => {
    if (primaryWallet?.address) {
      router.push("/settings?treasury=1" as Route);
      return;
    }

    if (!privyConfigured) {
      router.push("/settings?treasury=1" as Route);
      return;
    }

    connectExternalWallet();
  };

  return (
    <TopNav
      userAddress={
        displayAddress ? formatWalletLabel(displayAddress) : undefined
      }
      onProfileClick={onProfileClick}
      onWalletClick={onWalletClick}
      walletPending={isWalletPending}
      environment={runtimeChrome.environment}
      environmentLabel={runtimeChrome.environmentLabel}
      lastSyncLabel={runtimeChrome.lastSyncLabel}
      chainLabel={runtimeChrome.chainLabel}
      runtimeStatus={runtimeChrome.status}
      runtimeApiOrigin={runtimeChrome.apiOrigin}
      runtimeLastBlock={runtimeChrome.lastBlock}
      runtimeRpcReachable={runtimeChrome.rpcReachable}
      runtimeError={runtimeChrome.error}
      searchExtraItems={searchExtraItems}
    />
  );
}
