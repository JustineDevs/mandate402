"use client";

import {
  usePrivy,
  useSign7702Authorization,
  useWallets,
} from "@privy-io/react-auth";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
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
import { ShieldCheck, Sparkles, Wallet } from "lucide-react";

type AccessPayload = {
  operator: {
    operatorId: string;
    role: "operator" | "platform_admin";
  };
  access: {
    profile: {
      auth_user_id: string;
      role: string;
      status: string;
      primary_auth_provider: string | null;
      email: string | null;
      full_name: string | null;
      wallet_address: string | null;
      onboarding_state: string;
      preferred_treasury_mode: string | null;
      preferred_wallet_provider: string | null;
      last_sign_in_at: string | null;
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
  eyebrow: string;
  description: string;
  verificationSource: "manual" | "browser_wallet" | "provider_session";
}> = [
  {
    provider: "privy",
    mode: "embedded_7702",
    title: "In-app wallet",
    eyebrow: "Recommended",
    description:
      "Use a Privy embedded wallet, sign the provider-session authorization, and link the verified embedded address to this operator.",
    verificationSource: "provider_session",
  },
  {
    provider: "external",
    mode: "external_fusion",
    title: "Browser wallet",
    eyebrow: "Alternative",
    description:
      "Read the live address and chain from MetaMask, Rabby, or another browser wallet. This is the concrete verification path available today.",
    verificationSource: "browser_wallet",
  },
  {
    provider: "turnkey",
    mode: "managed_signer",
    title: "Managed signer",
    eyebrow: "Advanced",
    description:
      "Record the managed signer lane and keep its first link explicit. This path stays manual until the custody runtime is integrated.",
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
    connectOrCreateWallet,
    linkWallet,
    ready: privyReady,
    user: privyUser,
  } = usePrivy();
  const { signAuthorization } = useSign7702Authorization();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy",
  );
  const [isWalletPending, startWalletTransition] = useTransition();

  const beginPrivyWalletSession = () =>
    startWalletTransition(async () => {
      if (!privyReady) {
        onStatus("Privy is still starting. Try again in a moment.");
        return;
      }
      if (embeddedWallet) {
        onWalletConnected(embeddedWallet.address);
        onStatus(
          "In-app wallet connected. Prepare the provider-session verification next.",
        );
        return;
      }
      if (privyAuthenticated) {
        linkWallet({
          description:
            "Link or create the embedded wallet that Mandate402 will use for treasury actions.",
        });
        onStatus("Complete the Privy wallet prompt to attach the wallet.");
        return;
      }

      connectOrCreateWallet();
      onStatus("Complete the Privy wallet prompt to create the in-app wallet.");
    });

  const preparePrivyWallet = () =>
    startWalletTransition(async () => {
      if (!embeddedWallet) {
        onStatus(
          "No Privy embedded wallet is connected yet. Open the in-app wallet first.",
        );
        return;
      }

      try {
        onStatus("Preparing the embedded wallet verification…");
        const prepared = await preparePrivyEmbeddedWalletBinding({
          chainId,
          providerUserId: privyUser?.id ?? null,
          wallet: embeddedWallet,
          signAuthorization,
        });
        onPrepared(prepared);
        onStatus("In-app wallet verified and ready to link.");
      } catch (error) {
        onStatus(
          error instanceof Error
            ? error.message
            : "Unable to prepare the in-app wallet path.",
        );
      }
    });

  return (
    <div className="grid gap-3 rounded-xl border border-hairline bg-surface-soft p-4">
      <div className="flex flex-wrap gap-2">
        <StatusPill
          label={privyReady ? "SDK ready" : "SDK loading"}
          tone={privyReady ? "success" : "warning"}
        />
        <StatusPill
          label={
            embeddedWallet
              ? "Embedded wallet connected"
              : privyAuthenticated
                ? "Privy session active"
                : "No in-app wallet yet"
          }
          tone={embeddedWallet || privyAuthenticated ? "success" : "neutral"}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isWalletPending}
          onClick={beginPrivyWalletSession}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {embeddedWallet ? "Reuse in-app wallet" : "Open in-app wallet"}
        </Button>
        <Button
          type="button"
          disabled={disabled || isWalletPending || !embeddedWallet}
          onClick={preparePrivyWallet}
        >
          Prepare embedded wallet
        </Button>
      </div>
    </div>
  );
}

export function OperatorConnectionWorkspace() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const privyConfig = getPrivyRuntimeConfig();

  const [session, setSession] = useState<Session | null>(null);
  const [payload, setPayload] = useState<AccessPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] =
    useState<TreasuryConnectionMode>("embedded_7702");
  const [selectedProvider, setSelectedProvider] =
    useState<TreasuryWalletProvider>("privy");
  const [label, setLabel] = useState("Primary treasury lane");
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("2818");
  const [message, setMessage] = useState(
    "Choose how this operator should connect to treasury actions.",
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
      setLabel(wallet.label ?? "Primary treasury lane");
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
      setMessage("Treasury connection already linked.");
      setLoadError(null);
    },
    [],
  );

  const redirectToOperatorSignIn = useCallback(async () => {
    setPayload(null);
    setSession(null);
    setLoadError(null);
    await supabase.auth.signOut().catch(() => undefined);
    router.replace("/operator");
  }, [router, supabase]);

  const loadAccessState = useCallback(
    async (accessToken: string) => {
      const response = await fetch("/api/operator/access", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        await redirectToOperatorSignIn();
        throw new Error("Your session is no longer authorized. Sign in again.");
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Access load failed with ${response.status}`);
      }

      const json = (await response.json()) as { data: AccessPayload };
      setPayload(json.data);
      const primary = json.data.access.walletAccounts.find(
        (account) => account.is_primary,
      );
      applyPrimaryWallet(primary);
    },
    [applyPrimaryWallet, redirectToOperatorSignIn],
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
                : "Unable to load access state.",
            );
            setMessage(
              error instanceof Error
                ? error.message
                : "Unable to load access state.",
            );
          });
      } else {
        router.replace("/operator");
      }
    });
  }, [loadAccessState, router, supabase]);

  const readBrowserWallet = () =>
    startTransition(async () => {
      try {
        setMessage("Reading browser wallet…");
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
            : "Unable to read browser wallet.",
        );
      }
    });

  if (!session || !payload) {
    return (
      <div className="card mx-auto my-8 max-w-2xl">
        <div className="eyebrow">Loading</div>
        <p className="muted">
          Preparing treasury connection setup for the current operator…
        </p>
        {loadError ? <p className="muted mt-3">{loadError}</p> : null}
      </div>
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
        setMessage("This connection path is not ready to link yet.");
        return;
      }

      setMessage("Linking treasury connection…");
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
        setMessage(text || `Link failed with ${response.status}`);
        return;
      }

      await loadAccessState(session.access_token);
      setMessage("Treasury connection linked.");
    });

  return (
    <ConsoleShell
      activeTab="Settings"
      eyebrow="Treasury Connection"
      title="Connect Treasury Access"
      summary="Finish the treasury connection setup once, then continue to the Mandate402 operator console with a verified address, chain, and provider state."
      heroTone="control"
      toolbar={
        <>
          <StatusPill label="1. Sign in" tone="success" />
          <StatusPill
            label="2. Treasury path"
            tone={
              payload.access.profile?.onboarding_state === "complete"
                ? "success"
                : "warning"
            }
          />
        </>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-mandate-green-dark" />
                Step 1. Identity
              </CardTitle>
              <CardDescription>
                Signed in as {payload.operator.operatorId}. Supabase already
                established access; this step is complete.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Step 2. Choose treasury connection</CardTitle>
              <CardDescription>
                Pick the wallet path this operator will use for treasury-facing
                actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {treasuryModes.map((entry) => {
                const selected =
                  entry.mode === selectedMode &&
                  entry.provider === selectedProvider;

                return (
                  <button
                    key={`${entry.provider}-${entry.mode}`}
                    type="button"
                    className={cn(
                      "rounded-xl border border-border p-4 text-left transition-colors",
                      selected
                        ? "bg-surface-feature ring-2 ring-mandate-green-mid/35"
                        : "bg-background hover:bg-muted/50",
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
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-steel">
                          {entry.eyebrow}
                        </div>
                        <div className="mt-1 text-lg font-semibold text-charcoal">
                          {entry.title}
                        </div>
                      </div>
                      <StatusPill
                        label={
                          entry.provider === "privy"
                            ? "Privy + Biconomy"
                            : entry.provider === "external"
                              ? "Browser wallet"
                              : "Managed signer"
                        }
                        tone={selected ? "success" : "neutral"}
                      />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate">
                      {entry.description}
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Step 3. Verify address and chain</CardTitle>
              <CardDescription>
                Confirm the live address and chain the selected connection will
                use for treasury actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="wallet-label">Connection label</Label>
                <Input
                  id="wallet-label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Primary treasury lane"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wallet-address">Wallet address</Label>
                <Input
                  id="wallet-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wallet-chain">Chain</Label>
                <select
                  id="wallet-chain"
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
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

              {selectedProvider === "privy" ? (
                privyConfig.enabled ? (
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
                ) : (
                  <div className="rounded-xl border border-hairline bg-surface-soft p-4 text-sm leading-6 text-slate">
                    NEXT_PUBLIC_PRIVY_APP_ID is not set in this environment, so
                    the in-app wallet path cannot open yet. The code path is in
                    place; add the public Privy app settings to use it.
                  </div>
                )
              ) : null}

              {selectedProvider === "external" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={readBrowserWallet}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Read from browser wallet
                </Button>
              ) : null}

              {selectedProvider === "turnkey" ? (
                <p className="text-sm leading-6 text-slate">
                  This path records the managed signer metadata and marks the
                  connection for manual review. No browser or embedded wallet
                  session is required in this screen.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Step 4. Link to operator profile</CardTitle>
              <CardDescription>
                Save this treasury connection as the primary path for the
                current operator profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-steel">
                  Summary
                </div>
                <div className="mt-3 space-y-2 text-sm text-charcoal">
                  <div>provider: {selectedProvider}</div>
                  <div>mode: {selectedMode}</div>
                  <div>address: {address || "not set yet"}</div>
                  <div>chain: {chainId || "not set yet"}</div>
                  <div>
                    orchestration:{" "}
                    {computedBinding?.orchestratorAddress ?? "not prepared yet"}
                  </div>
                  <div>
                    status: {computedBinding?.status ?? "not linked yet"}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={isPending || !readyToLink}
                onClick={completeLink}
              >
                Link to operator profile
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Step 5. Continue</CardTitle>
              <CardDescription>
                Once the connection is linked, continue to the mandates console.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {payload.access.walletAccounts.map((account) => (
                  <CategoryAccentChip
                    key={account.id}
                    lane={account.is_primary ? "payments" : "governance"}
                    label={`${account.provider}:${account.chain_id}`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={
                  payload.access.profile?.onboarding_state !== "complete"
                }
                onClick={() => router.replace("/operator")}
              >
                Continue to mandates console
              </Button>
              <p className="text-sm text-steel">{message}</p>
            </CardContent>
          </Card>

          <ConsoleCodeSurface title="Linked provider contract">
            <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
              <p>identity stays on Supabase</p>
              <p>
                recommended wallet path: Privy embedded wallet with
                provider-session verification
              </p>
              <p>fallback wallet path: browser wallet verification</p>
              <p>
                stored linkage: provider ids, wallet client type, orchestration
                address, delegation contract
              </p>
            </div>
          </ConsoleCodeSurface>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Current connection state</CardTitle>
              <CardDescription>
                Review the live linkage fields before you save them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate">
              <div className="flex flex-wrap gap-2">
                <StatusPill
                  label={
                    computedBinding?.status ?? selectedConfig.verificationSource
                  }
                  tone={statusTone(computedBinding?.status)}
                />
                {computedBinding?.walletClientType ? (
                  <StatusPill
                    label={computedBinding.walletClientType}
                    tone="neutral"
                  />
                ) : null}
              </div>
              <div>
                provider user: {computedBinding?.providerUserId ?? "n/a"}
              </div>
              <div>
                provider wallet: {computedBinding?.providerWalletId ?? "n/a"}
              </div>
              <div>
                orchestration address:{" "}
                {computedBinding?.orchestratorAddress ?? "not prepared yet"}
              </div>
              <div>
                delegation contract:{" "}
                {computedBinding?.delegationContractAddress ?? "n/a"}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </ConsoleShell>
  );
}
