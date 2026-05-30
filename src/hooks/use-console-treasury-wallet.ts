"use client";

import {
  type ConnectedWallet,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { DEFAULT_MORPH_MAINNET_CHAIN_ID } from "@/lib/infrastructure/env";
import { treasuryWalletLoginOptions } from "@/lib/infrastructure/privy-config";
import {
  ensureOperatorProfileFromSession,
  getSupabaseBrowserClient,
} from "@/lib/infrastructure/supabase-browser";
import type { TreasuryWalletAccountRecord } from "@/lib/operator-access";
import { createPrivyExternalWalletBinding } from "@/lib/operator-wallet-sdk";

function pickExternalWallet(wallets: ConnectedWallet[]) {
  return wallets.find((wallet) => wallet.walletClientType !== "privy");
}

export function useConsoleTreasuryWallet() {
  const supabase = getSupabaseBrowserClient();
  const { authenticated, login, linkWallet, ready, user } = usePrivy();
  const { wallets } = useWallets();
  const [primaryWallet, setPrimaryWallet] =
    useState<TreasuryWalletAccountRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [isWalletPending, startWalletTransition] = useTransition();
  const linkRequestedRef = useRef(false);

  const loadPrimaryWallet = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return;
    }

    await ensureOperatorProfileFromSession(session).catch(() => undefined);

    const response = await fetch("/api/operator/access", {
      headers: {
        authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      setLoadError("Unable to load treasury wallet state.");
      return;
    }

    const json = (await response.json()) as {
      data?: {
        access?: { walletAccounts?: TreasuryWalletAccountRecord[] };
      };
    };
    const primary =
      json.data?.access?.walletAccounts?.find(
        (account) => account.is_primary,
      ) ?? null;
    setPrimaryWallet(primary);
    setLoadError(null);
  }, [supabase]);

  useEffect(() => {
    void loadPrimaryWallet();
  }, [loadPrimaryWallet]);

  const linkExternalWalletToProfile = useCallback(
    async (wallet: ConnectedWallet) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Sign in before linking a treasury wallet.");
      }

      const prepared = createPrivyExternalWalletBinding({
        wallet,
        providerUserId: user?.id ?? null,
        chainId: DEFAULT_MORPH_MAINNET_CHAIN_ID,
      });

      const response = await fetch("/api/operator/access", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          provider: "external",
          mode: "external_fusion",
          status: prepared.binding.status,
          label: "Primary treasury lane",
          address: prepared.address,
          chainId: prepared.chainId,
          verificationSource: prepared.binding.verificationSource,
          providerUserId: prepared.binding.providerUserId ?? undefined,
          providerWalletId: prepared.binding.providerWalletId ?? undefined,
          walletClientType: prepared.binding.walletClientType ?? undefined,
          orchestratorAddress: prepared.binding.orchestratorAddress,
          orchestratorKind: prepared.binding.orchestratorKind,
          delegationContractAddress:
            prepared.binding.delegationContractAddress ?? undefined,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Treasury link failed.");
      }

      await loadPrimaryWallet();
    },
    [loadPrimaryWallet, supabase, user?.id],
  );

  const externalWallet = pickExternalWallet(wallets);

  useEffect(() => {
    if (
      !linkRequestedRef.current ||
      !externalWallet ||
      primaryWallet ||
      isLinking ||
      !ready
    ) {
      return;
    }

    setIsLinking(true);
    void linkExternalWalletToProfile(externalWallet)
      .then(() => {
        linkRequestedRef.current = false;
      })
      .catch((error) => {
        setLoadError(
          error instanceof Error ? error.message : "Treasury link failed.",
        );
      })
      .finally(() => {
        setIsLinking(false);
      });
  }, [
    externalWallet,
    isLinking,
    linkExternalWalletToProfile,
    primaryWallet,
    ready,
  ]);

  const connectExternalWallet = useCallback(() => {
    startWalletTransition(async () => {
      if (!ready) {
        return;
      }

      setLoadError(null);
      linkRequestedRef.current = true;

      if (authenticated) {
        await linkWallet({
          ...treasuryWalletLoginOptions,
          description:
            "Connect an external wallet for Mandate402 treasury actions.",
        });
        return;
      }

      await login(treasuryWalletLoginOptions);
    });
  }, [authenticated, linkWallet, login, ready]);

  const displayAddress = primaryWallet?.address ?? externalWallet?.address;

  return {
    displayAddress,
    primaryWallet,
    externalWallet,
    isWalletPending: isWalletPending || isLinking,
    loadError,
    connectExternalWallet,
    reload: loadPrimaryWallet,
  };
}
