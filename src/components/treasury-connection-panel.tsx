"use client";

import {
  usePrivy,
  useSign7702Authorization,
  useWallets,
} from "@privy-io/react-auth";
import type { Session } from "@supabase/supabase-js";
import { Wallet } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { CategoryAccentChip } from "@/components/category-accent";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPrivyRuntimeConfig } from "@/lib/infrastructure/env";
import { treasuryWalletLoginOptions } from "@/lib/infrastructure/privy-config";
import {
  ensureOperatorProfileFromSession,
  getSupabaseBrowserClient,
  readBrowserEthereumWalletSnapshot,
} from "@/lib/infrastructure/supabase-browser";
import type {
  TreasuryConnectionMode,
  TreasuryWalletAccountRecord,
  TreasuryWalletProvider,
} from "@/lib/operator-access";
import {
  type PreparedOperatorWalletBinding,
  createBrowserWalletBinding,
  createManagedSignerBinding,
  preparePrivyEmbeddedWalletBinding,
} from "@/lib/operator-wallet-sdk";
import { cn } from "@/lib/utils";

type AccessPayload = {
  operator: {
    operatorId: string;
    role: "operator" | "platform_admin";
  };
  access: {
    profile: {
      onboarding_state: string;
    } | null;
    walletAccounts: TreasuryWalletAccountRecord[];
  };
};

const chainOptions = [
  { id: 2818, label: "Morph Mainnet (2818)" },
  { id: 2910, label: "Morph Hoodi (2910)" },
];

const treasuryModes: Array<{
  provider: TreasuryWalletProvider;
  mode: TreasuryConnectionMode;
  title: string;
  description: string;
  verificationSource: "manual" | "browser_wallet" | "provider_session";
}> = [
  {
    provider: "external",
    mode: "external_fusion",
    title: "External wallet",
    description:
      "Connect MetaMask, Rabby, or another browser wallet. Address and chain are read from the wallet extension.",
    verificationSource: "browser_wallet",
  },
  {
    provider: "privy",
    mode: "embedded_7702",
    title: "Provider wallet",
    description:
      "Connect through Privy with provider-session verification for embedded orchestration.",
    verificationSource: "provider_session",
  },
  {
    provider: "turnkey",
    mode: "managed_signer",
    title: "Managed signer",
    description:
      "Record a managed signer address for manual review. No browser session is required.",
    verificationSource: "manual",
  },
];

function statusTone(status: string | null | undefined) {
  if (status === "verified") {
    return "success" as const;
  }
  if (status) {
    return "warning" as const;
  }
  return "neutral" as const;
}

type PrivyTreasuryControlsProps = {
  chainId: number;
  disabled: boolean;
  onWalletConnected: (address: string) => void;
  onPrepared: (payload: {
    address: string;
    chainId: number;
    binding: PreparedOperatorWalletBinding;
  }) => void;
  onStatus: (message: string) => void;
};

function PrivyTreasuryControls({
  chainId,
  disabled,
  onWalletConnected,
  onPrepared,
  onStatus,
}: PrivyTreasuryControlsProps) {
  const {
    authenticated: privyAuthenticated,
    login,
    linkWallet,
    ready: privyReady,
    user: privyUser,
  } = usePrivy();
  const { signAuthorization } = useSign7702Authorization();
  const { wallets } = useWallets();
  const externalWallet = wallets.find(
    (wallet) => wallet.walletClientType !== "privy",
  );
  const [isWalletPending, startWalletTransition] = useTransition();

  const beginExternalWalletSession = () =>
    startWalletTransition(async () => {
      if (!privyReady) {
        onStatus("Wallet provider is still loading. Try again shortly.");
        return;
      }
      if (externalWallet) {
        onWalletConnected(externalWallet.address);
        onStatus("External wallet connected. Review the address below.");
        return;
      }
      if (privyAuthenticated) {
        await linkWallet({
          ...treasuryWalletLoginOptions,
          description: "Connect an external wallet for treasury actions.",
        });
        onStatus("Complete the wallet prompt to continue.");
        return;
      }
      await login(treasuryWalletLoginOptions);
      onStatus("Complete the wallet prompt to continue.");
    });

  const preparePrivyWallet = () =>
    startWalletTransition(async () => {
      const embeddedWallet = wallets.find(
        (wallet) => wallet.walletClientType === "privy",
      );
      if (!embeddedWallet) {
        onStatus("No provider wallet is connected yet.");
        return;
      }
      try {
        onStatus("Preparing provider wallet verification…");
        const prepared = await preparePrivyEmbeddedWalletBinding({
          chainId,
          providerUserId: privyUser?.id ?? null,
          wallet: embeddedWallet,
          signAuthorization,
        });
        onPrepared(prepared);
        onStatus("Provider wallet verified.");
      } catch (error) {
        onStatus(
          error instanceof Error
            ? error.message
            : "Unable to prepare the provider wallet.",
        );
      }
    });

  return (
    <div className="grid gap-3 rounded-xl border border-hairline bg-surface-soft p-4">
      <div className="flex flex-wrap gap-2">
        <StatusPill
          label={privyReady ? "Provider ready" : "Provider loading"}
          tone={privyReady ? "success" : "warning"}
        />
        <StatusPill
          label={
            externalWallet
              ? "External wallet connected"
              : privyAuthenticated
                ? "Session active"
                : "No wallet connected"
          }
          tone={externalWallet || privyAuthenticated ? "success" : "neutral"}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isWalletPending}
          onClick={beginExternalWalletSession}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {externalWallet ? "Use connected wallet" : "Connect external wallet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={
            disabled ||
            isWalletPending ||
            !wallets.some((wallet) => wallet.walletClientType === "privy")
          }
          onClick={preparePrivyWallet}
        >
          Verify provider wallet
        </Button>
      </div>
    </div>
  );
}

export type TreasuryConnectionPanelProps = {
  onLinked?: () => void;
  focusOnMount?: boolean;
};

export function TreasuryConnectionPanel({
  onLinked,
  focusOnMount = false,
}: TreasuryConnectionPanelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const supabase = getSupabaseBrowserClient();
  const privyConfig = getPrivyRuntimeConfig();

  const [session, setSession] = useState<Session | null>(null);
  const [payload, setPayload] = useState<AccessPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] =
    useState<TreasuryConnectionMode>("external_fusion");
  const [selectedProvider, setSelectedProvider] =
    useState<TreasuryWalletProvider>("external");
  const [label, setLabel] = useState("Primary treasury");
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("2818");
  const [message, setMessage] = useState(
    "Select a connection type and confirm the wallet address.",
  );
  const [draftBinding, setDraftBinding] =
    useState<PreparedOperatorWalletBinding | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedConfig =
    treasuryModes.find(
      (entry) =>
        entry.mode === selectedMode && entry.provider === selectedProvider,
    ) ?? treasuryModes[0];

  const applyPrimaryWallet = useCallback(
    (wallet: TreasuryWalletAccountRecord | undefined) => {
      if (!wallet) {
        return;
      }
      setSelectedMode(wallet.mode);
      setSelectedProvider(wallet.provider);
      setLabel(wallet.label ?? "Primary treasury");
      setAddress(wallet.address);
      setChainId(String(wallet.chain_id));
      setDraftBinding({
        providerUserId: wallet.provider_user_id,
        providerWalletId: wallet.provider_wallet_id,
        walletClientType: wallet.wallet_client_type,
        orchestratorAddress: wallet.orchestrator_address ?? wallet.address,
        orchestratorKind:
          (wallet.orchestrator_kind as
            | "biconomy_nexus_7702"
            | "browser_wallet"
            | "managed_signer"
            | null) ?? "managed_signer",
        delegationContractAddress: wallet.delegation_contract_address,
        status:
          wallet.status === "verified" ? "verified" : "linked_manual_review",
        verificationSource:
          wallet.verification_source === "provider_session" ||
          wallet.verification_source === "browser_wallet"
            ? wallet.verification_source
            : "manual",
        lastSyncError: wallet.last_sync_error,
      });
      setMessage("A treasury wallet is already linked to this profile.");
      setLoadError(null);
    },
    [],
  );

  const loadAccessState = useCallback(
    async (accessToken: string) => {
      const response = await fetch("/api/operator/access", {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          text || `Unable to load wallet state (${response.status}).`,
        );
      }
      const json = (await response.json()) as { data: AccessPayload };
      setPayload(json.data);
      applyPrimaryWallet(
        json.data.access.walletAccounts.find((account) => account.is_primary),
      );
    },
    [applyPrimaryWallet],
  );

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.access_token) {
        void ensureOperatorProfileFromSession(data.session)
          .then(() => loadAccessState(data.session.access_token))
          .catch((error) => {
            setLoadError(
              error instanceof Error
                ? error.message
                : "Unable to load wallet state.",
            );
          });
      }
    });
  }, [loadAccessState, supabase]);

  useEffect(() => {
    if (!focusOnMount || !sectionRef.current) {
      return;
    }
    sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusOnMount]);

  const readBrowserWallet = () =>
    startTransition(async () => {
      try {
        setMessage("Reading wallet from the browser extension…");
        const snapshot = await readBrowserEthereumWalletSnapshot();
        const prepared = createBrowserWalletBinding(snapshot);
        setAddress(prepared.address);
        setChainId(String(prepared.chainId));
        setDraftBinding(prepared.binding);
        setMessage("Address and chain loaded from the browser wallet.");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to read the browser wallet.",
        );
      }
    });

  if (!session || !payload) {
    return (
      <section className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-slate">
          Loading treasury wallet settings…
        </p>
        {loadError ? (
          <p className="mt-2 text-sm text-accent-payments">{loadError}</p>
        ) : null}
      </section>
    );
  }

  const computedBinding =
    selectedProvider === "turnkey"
      ? createManagedSignerBinding(address.trim()).binding
      : draftBinding;

  const readyToLink =
    /^0x[a-fA-F0-9]{40}$/.test(address.trim()) &&
    Number.isInteger(Number(chainId)) &&
    Number(chainId) > 0 &&
    (selectedProvider === "turnkey" ||
      (selectedProvider === "privy" &&
        computedBinding?.orchestratorKind === "biconomy_nexus_7702") ||
      (selectedProvider === "external" &&
        computedBinding?.orchestratorKind === "browser_wallet"));

  const completeLink = () =>
    startTransition(async () => {
      const resolvedBinding =
        selectedProvider === "turnkey"
          ? createManagedSignerBinding(address.trim()).binding
          : computedBinding;

      if (!resolvedBinding) {
        setMessage("Complete verification before saving.");
        return;
      }

      setMessage("Saving wallet link…");
      const response = await fetch("/api/operator/access", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          provider: selectedProvider,
          mode: selectedMode,
          status: resolvedBinding.status,
          label,
          address,
          chainId: Number(chainId),
          verificationSource: resolvedBinding.verificationSource,
          providerUserId: resolvedBinding.providerUserId ?? undefined,
          providerWalletId: resolvedBinding.providerWalletId ?? undefined,
          walletClientType: resolvedBinding.walletClientType ?? undefined,
          orchestratorAddress: resolvedBinding.orchestratorAddress,
          orchestratorKind: resolvedBinding.orchestratorKind,
          delegationContractAddress:
            resolvedBinding.delegationContractAddress ?? undefined,
          lastSyncError: resolvedBinding.lastSyncError ?? undefined,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        setMessage(text || `Save failed (${response.status}).`);
        return;
      }

      await loadAccessState(session.access_token);
      setMessage("Treasury wallet saved to your profile.");
      onLinked?.();
    });

  const onboardingComplete =
    payload.access.profile?.onboarding_state === "complete";

  return (
    <section
      ref={sectionRef}
      id="treasury-wallet"
      className="scroll-mt-24 space-y-6"
      aria-labelledby="treasury-wallet-heading"
    >
      <SectionHeader
        eyebrow="Treasury"
        title="Wallet connection"
        description="Link the wallet used for treasury actions. Saved to your operator profile."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Connection type</CardTitle>
              <CardDescription>
                Signed in as {payload.operator.operatorId.slice(0, 8)}…
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {treasuryModes.map((entry) => {
                const selected =
                  entry.mode === selectedMode &&
                  entry.provider === selectedProvider;

                return (
                  <button
                    key={`${entry.provider}-${entry.mode}`}
                    type="button"
                    className={cn(
                      "min-h-11 rounded-xl border border-hairline p-4 text-left transition-colors",
                      selected
                        ? "border-mandate-green-mid/40 bg-surface-feature ring-1 ring-mandate-green-mid/25"
                        : "bg-canvas hover:bg-surface-soft",
                    )}
                    onClick={() => {
                      setSelectedMode(entry.mode);
                      setSelectedProvider(entry.provider);
                      setDraftBinding(
                        entry.provider === selectedProvider
                          ? draftBinding
                          : null,
                      );
                    }}
                  >
                    <div className="text-sm font-semibold text-charcoal">
                      {entry.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate">
                      {entry.description}
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Address and chain</CardTitle>
              <CardDescription>
                Confirm the address and network for this connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="wallet-label">Label</Label>
                <Input
                  id="wallet-label"
                  className="min-h-11"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Primary treasury"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wallet-address">Wallet address</Label>
                <Input
                  id="wallet-address"
                  className="min-h-11 font-mono-reference text-sm"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="0x…"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wallet-chain">Chain</Label>
                <select
                  id="wallet-chain"
                  className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-ink"
                  value={chainId}
                  onChange={(event) => setChainId(event.target.value)}
                >
                  {chainOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProvider === "privy" && privyConfig.enabled ? (
                <PrivyTreasuryControls
                  chainId={Number(chainId)}
                  disabled={isPending}
                  onWalletConnected={(nextAddress) => {
                    setAddress(nextAddress);
                    setDraftBinding(null);
                  }}
                  onPrepared={(prepared) => {
                    setAddress(prepared.address);
                    setChainId(String(prepared.chainId));
                    setDraftBinding(prepared.binding);
                  }}
                  onStatus={setMessage}
                />
              ) : null}

              {selectedProvider === "privy" && !privyConfig.enabled ? (
                <p className="rounded-xl border border-hairline bg-surface-soft p-4 text-sm leading-6 text-slate">
                  Provider wallet is not configured in this environment.
                </p>
              ) : null}

              {selectedProvider === "external" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={isPending}
                  onClick={readBrowserWallet}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Read from browser wallet
                </Button>
              ) : null}

              {selectedProvider === "turnkey" ? (
                <p className="text-sm leading-6 text-slate">
                  Enter the managed signer address above. The link is stored for
                  manual review.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Save to profile</CardTitle>
              <CardDescription>
                Store this wallet as the primary treasury connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-hairline bg-surface-soft p-4 text-sm text-charcoal">
                <dl className="grid gap-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-steel">Provider</dt>
                    <dd className="font-medium">{selectedProvider}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-steel">Mode</dt>
                    <dd className="font-medium">{selectedMode}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-steel">Address</dt>
                    <dd className="truncate font-mono-reference text-xs">
                      {address || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-steel">Chain</dt>
                    <dd className="font-medium">{chainId || "Not set"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-steel">Status</dt>
                    <dd>
                      <StatusPill
                        label={computedBinding?.status ?? "Not linked"}
                        tone={statusTone(computedBinding?.status)}
                      />
                    </dd>
                  </div>
                </dl>
              </div>
              <Button
                type="button"
                className="min-h-11 w-full"
                disabled={isPending || !readyToLink}
                onClick={completeLink}
              >
                Save wallet link
              </Button>
              <output className="block text-sm text-steel">{message}</output>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Linked wallets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {payload.access.walletAccounts.length === 0 ? (
                  <p className="text-sm text-slate">No wallets linked yet.</p>
                ) : (
                  payload.access.walletAccounts.map((account) => (
                    <CategoryAccentChip
                      key={account.id}
                      lane={account.is_primary ? "payments" : "governance"}
                      label={`${account.provider} · ${account.chain_id}`}
                    />
                  ))
                )}
              </div>
              {onboardingComplete ? (
                <Link
                  href={"/operator" as Route}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-hairline bg-canvas px-4 text-sm font-semibold text-charcoal transition-colors hover:bg-surface-soft"
                >
                  Open dashboard
                </Link>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
