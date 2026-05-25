import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const mandates = pgTable("mandates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  agentId: text("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "restrict" }),
  agentName: text("agent_name").notNull(),
  status: text("status").notNull(),
  budgetCapCents: integer("budget_cap_cents").notNull(),
  reservedCents: integer("reserved_cents").notNull(),
  consumedCents: integer("consumed_cents").notNull(),
  requiresReceiptCapability: boolean("requires_receipt_capability").notNull(),
  morphIssueTxId: text("morph_issue_tx_id").notNull(),
  morphRevokeTxId: text("morph_revoke_tx_id"),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const mandateApprovedVendors = pgTable(
  "mandate_approved_vendors",
  {
    mandateId: text("mandate_id")
      .notNull()
      .references(() => mandates.id, { onDelete: "cascade" }),
    vendorId: text("vendor_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.mandateId, table.vendorId] }),
  }),
);

export const attempts = pgTable("attempts", {
  id: text("id").primaryKey(),
  mandateId: text("mandate_id")
    .notNull()
    .references(() => mandates.id, { onDelete: "cascade" }),
  vendorId: text("vendor_id").notNull(),
  amountCents: integer("amount_cents").notNull(),
  operatorId: text("operator_id").notNull(),
  status: text("status").notNull(),
  financialOutcome: text("financial_outcome").notNull(),
  receiptEvidence: text("receipt_evidence").notNull(),
  blockedReason: text("blocked_reason"),
  chargeReference: text("charge_reference"),
  paymentIdentifier: text("payment_identifier").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const workerTasks = pgTable("worker_tasks", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  mandateId: text("mandate_id")
    .notNull()
    .references(() => mandates.id, { onDelete: "cascade" }),
  operatorId: text("operator_id"),
  correlationId: text("correlation_id"),
  leaseOwner: text("lease_owner"),
  leaseExpiresAt: text("lease_expires_at"),
  availableAt: text("available_at").notNull(),
  status: text("status").notNull(),
  attemptCount: integer("attempt_count").notNull(),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
});

export const auditEntries = pgTable("audit_entries", {
  id: text("id").primaryKey(),
  mandateId: text("mandate_id")
    .notNull()
    .references(() => mandates.id, { onDelete: "cascade" }),
  attemptId: text("attempt_id"),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

export const domainEvents = pgTable("domain_events", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  eventType: text("event_type").notNull(),
  correlationId: text("correlation_id"),
  occurredAt: text("occurred_at").notNull(),
  metadataJson: text("metadata_json").notNull(),
});

export const operatorProfiles = pgTable("operator_profiles", {
  authUserId: uuid("auth_user_id").primaryKey(),
  role: text("role").notNull(),
  status: text("status").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  walletAddress: text("wallet_address"),
  primaryAuthProvider: text("primary_auth_provider"),
  onboardingState: text("onboarding_state").notNull(),
  preferredTreasuryMode: text("preferred_treasury_mode"),
  preferredWalletProvider: text("preferred_wallet_provider"),
  lastSignInAt: timestamp("last_sign_in_at", {
    withTimezone: true,
    mode: "string",
  }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
});

export const operatorAuthIdentities = pgTable(
  "operator_auth_identities",
  {
    id: uuid("id").primaryKey(),
    operatorId: uuid("operator_id")
      .notNull()
      .references(() => operatorProfiles.authUserId, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerSubject: text("provider_subject").notNull(),
    email: text("email"),
    walletAddress: text("wallet_address"),
    identityDataJson: text("identity_data_json").notNull(),
    lastSignInAt: timestamp("last_sign_in_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => ({
    providerIdentityUnique: uniqueIndex(
      "operator_auth_identities_provider_subject_idx",
    ).on(table.provider, table.providerSubject),
  }),
);

export const operatorTreasuryWalletAccounts = pgTable(
  "operator_treasury_wallet_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    operatorId: uuid("operator_id")
      .notNull()
      .references(() => operatorProfiles.authUserId, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    mode: text("mode").notNull(),
    label: text("label"),
    providerUserId: text("provider_user_id"),
    providerWalletId: text("provider_wallet_id"),
    walletClientType: text("wallet_client_type"),
    address: text("address").notNull(),
    chainNamespace: text("chain_namespace").notNull(),
    chainId: integer("chain_id").notNull(),
    orchestratorAddress: text("orchestrator_address"),
    orchestratorKind: text("orchestrator_kind"),
    delegationContractAddress: text("delegation_contract_address"),
    status: text("status").notNull(),
    verificationSource: text("verification_source").notNull(),
    lastSyncError: text("last_sync_error"),
    isPrimary: boolean("is_primary").notNull(),
    lastVerifiedAt: timestamp("last_verified_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastSeenAt: timestamp("last_seen_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => ({
    operatorWalletUnique: uniqueIndex(
      "operator_treasury_wallet_accounts_operator_wallet_idx",
    ).on(
      table.operatorId,
      table.provider,
      table.address,
      table.chainNamespace,
      table.chainId,
    ),
  }),
);
