import {
  type OperatorProfileRecord,
  createSupabaseRequestClient,
} from "@/lib/infrastructure/supabase-server";

export type TreasuryConnectionMode =
  | "embedded_7702"
  | "external_fusion"
  | "managed_signer";

export type TreasuryWalletProvider = "privy" | "external" | "turnkey";

export type TreasuryWalletAccountRecord = {
  id: string;
  operator_id: string;
  provider: TreasuryWalletProvider;
  mode: TreasuryConnectionMode;
  label: string | null;
  provider_user_id: string | null;
  provider_wallet_id: string | null;
  wallet_client_type: string | null;
  address: string;
  chain_namespace: string;
  chain_id: number;
  orchestrator_address: string | null;
  orchestrator_kind: string | null;
  delegation_contract_address: string | null;
  status: string;
  verification_source: string;
  last_sync_error: string | null;
  is_primary: boolean;
  last_verified_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OperatorAccessProfile = OperatorProfileRecord & {
  onboarding_state: string;
  preferred_treasury_mode: string | null;
  preferred_wallet_provider: string | null;
};

export async function getOperatorAccessState(
  accessToken: string,
  userId: string,
) {
  const client = createSupabaseRequestClient(accessToken);
  const [
    { data: profile, error: profileError },
    { data: wallets, error: walletsError },
  ] = await Promise.all([
    client
      .from("operator_profiles")
      .select(
        "auth_user_id, role, status, primary_auth_provider, email, full_name, wallet_address, onboarding_state, preferred_treasury_mode, preferred_wallet_provider, last_sign_in_at",
      )
      .eq("auth_user_id", userId)
      .maybeSingle<OperatorAccessProfile>(),
    client
      .from("operator_treasury_wallet_accounts")
      .select(
        "id, operator_id, provider, mode, label, provider_user_id, provider_wallet_id, wallet_client_type, address, chain_namespace, chain_id, orchestrator_address, orchestrator_kind, delegation_contract_address, status, verification_source, last_sync_error, is_primary, last_verified_at, last_seen_at, created_at, updated_at",
      )
      .eq("operator_id", userId)
      .order("is_primary", { ascending: false })
      .order("updated_at", { ascending: false })
      .returns<TreasuryWalletAccountRecord[]>(),
  ]);

  if (profileError) {
    throw profileError;
  }
  if (walletsError) {
    throw walletsError;
  }

  return {
    profile,
    walletAccounts: wallets ?? [],
  };
}

export async function linkTreasuryWalletAccount(input: {
  accessToken: string;
  userId: string;
  provider: TreasuryWalletProvider;
  mode: TreasuryConnectionMode;
  address: string;
  chainId: number;
  label?: string | null;
  verificationSource: "manual" | "browser_wallet" | "provider_session";
  status?: "verified" | "linked_manual_review" | "sync_failed";
  providerUserId?: string | null;
  providerWalletId?: string | null;
  walletClientType?: string | null;
  orchestratorAddress?: string | null;
  orchestratorKind?:
    | "biconomy_nexus_7702"
    | "browser_wallet"
    | "managed_signer"
    | null;
  delegationContractAddress?: string | null;
  lastSyncError?: string | null;
}) {
  const client = createSupabaseRequestClient(input.accessToken);
  const now = new Date().toISOString();
  const normalizedAddress = input.address.trim();
  const normalizedOrchestratorAddress =
    input.orchestratorAddress?.trim() || normalizedAddress;

  await client
    .from("operator_treasury_wallet_accounts")
    .update({ is_primary: false, updated_at: now })
    .eq("operator_id", input.userId);

  const { data: wallet, error: walletError } = await client
    .from("operator_treasury_wallet_accounts")
    .upsert(
      {
        operator_id: input.userId,
        provider: input.provider,
        mode: input.mode,
        label: input.label ?? null,
        provider_user_id: input.providerUserId ?? null,
        provider_wallet_id: input.providerWalletId ?? null,
        wallet_client_type: input.walletClientType ?? null,
        address: normalizedAddress,
        chain_namespace: "eip155",
        chain_id: input.chainId,
        orchestrator_address: normalizedOrchestratorAddress,
        orchestrator_kind: input.orchestratorKind ?? null,
        delegation_contract_address: input.delegationContractAddress ?? null,
        status:
          input.status ??
          (input.verificationSource === "manual"
            ? "linked_manual_review"
            : "verified"),
        verification_source: input.verificationSource,
        last_sync_error: input.lastSyncError ?? null,
        is_primary: true,
        last_verified_at: now,
        last_seen_at: now,
        updated_at: now,
      },
      {
        onConflict: "operator_id,provider,address,chain_namespace,chain_id",
      },
    )
    .select(
      "id, operator_id, provider, mode, label, provider_user_id, provider_wallet_id, wallet_client_type, address, chain_namespace, chain_id, orchestrator_address, orchestrator_kind, delegation_contract_address, status, verification_source, last_sync_error, is_primary, last_verified_at, last_seen_at, created_at, updated_at",
    )
    .single<TreasuryWalletAccountRecord>();

  if (walletError) {
    throw walletError;
  }

  const { error: profileError } = await client
    .from("operator_profiles")
    .update({
      wallet_address: normalizedAddress,
      preferred_treasury_mode: input.mode,
      preferred_wallet_provider: input.provider,
      onboarding_state: "complete",
      updated_at: now,
    })
    .eq("auth_user_id", input.userId);

  if (profileError) {
    throw profileError;
  }

  return wallet;
}
