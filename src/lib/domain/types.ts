export type MandateStatus =
  | "draft"
  | "issued_active"
  | "issued_reserved"
  | "revoking"
  | "revoked"
  | "expired";

export type PaymentAttemptStatus =
  | "created"
  | "auth_validated"
  | "policy_denied"
  | "reserved"
  | "dispatch_queued"
  | "dispatching"
  | "execution_unknown"
  | "executed_charge_succeeded"
  | "executed_charge_failed"
  | "cancelled_released";

export type WorkerTaskKind = "dispatch_attempt" | "reconcile_attempt";
export type WorkerTaskStatus = "queued" | "leased" | "completed" | "failed";

export type ReceiptEvidenceStatus =
  | "not_required"
  | "required_pending"
  | "received_valid"
  | "received_invalid"
  | "missing_timeout";

export type VendorMode = "primary" | "fallback-only";
export type VendorStatus = "available" | "degraded" | "blocked" | "unknown";

export type Vendor = {
  id: string;
  name: string;
  mode: VendorMode;
  status: VendorStatus;
  morphNative: boolean;
  receiptCapability: boolean;
  adapterKey: string;
};

export type Agent = {
  id: string;
  name: string;
  status: "active" | "revoked";
  createdAt: string;
  updatedAt: string;
};

export type Mandate = {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  status: MandateStatus;
  budgetCapCents: number;
  reservedCents: number;
  consumedCents: number;
  requiresReceiptCapability: boolean;
  approvedVendorIds: string[];
  morphIssueTxId: string;
  morphRevokeTxId: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentAttempt = {
  id: string;
  mandateId: string;
  vendorId: string;
  amountCents: number;
  operatorId: string;
  status: PaymentAttemptStatus;
  financialOutcome: PaymentAttemptStatus;
  receiptEvidence: ReceiptEvidenceStatus;
  blockedReason: string | null;
  chargeReference: string | null;
  paymentIdentifier: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkerTask = {
  id: string;
  kind: WorkerTaskKind;
  attemptId: string;
  mandateId: string;
  operatorId: string | null;
  correlationId: string | null;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  availableAt: string;
  status: WorkerTaskStatus;
  attemptCount: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type AuditEntry = {
  id: string;
  mandateId: string;
  attemptId: string | null;
  type:
    | "auth_validated"
    | "mandate_issued"
    | "mandate_expired"
    | "mandate_revoked"
    | "policy_approved"
    | "attempt_blocked"
    | "attempt_reserved"
    | "attempt_queued"
    | "attempt_dispatched"
    | "attempt_reconciliation_started"
    | "attempt_reconciled"
    | "financial_outcome"
    | "receipt_updated";
  message: string;
  createdAt: string;
};

export type DomainEvent = {
  id: string;
  entityType: "mandate" | "payment_attempt" | "worker_task" | "system";
  entityId: string;
  eventType: string;
  correlationId: string | null;
  occurredAt: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type FallbackTarget = {
  name: string;
  vendor_type: string;
  expected_capabilities: string[];
  integration_owner: string;
  status: string;
};

export type FallbackAttempt = {
  target_name: string;
  attempted_at: string;
  channel_or_endpoint: string;
  result: string;
  blocker_type: string;
  blocker_summary: string;
  evidence_ref: string;
  next_action: string;
};

export type FallbackGate = {
  decision_status:
    | "primary_only"
    | "fallback_not_yet_allowed"
    | "fallback_approved"
    | "fallback_activated";
  reviewed_at: string;
  cutoff_date: string;
  primary_targets: FallbackTarget[];
  attempt_log: FallbackAttempt[];
  approval_rationale: string;
  review_owner: string;
  evidence_links: string[];
};

export type GroupedApprovalStatus =
  | "pending"
  | "ready_to_execute"
  | "executed"
  | "cancelled";

export type GroupedApproval = {
  id: string;
  actionType:
    | "high_value_payment"
    | "policy_change"
    | "vendor_allowlist_change";
  description: string;
  threshold: number;
  signatures: string[]; // Operator IDs
  status: GroupedApprovalStatus;
  entityId: string; // The ID of the mandate, payment, or vendor being approved
  correlationId: string | null;
  createdAt: string;
  updatedAt: string;
  executedAt: string | null;
  executedBy: string | null;
};

export type BridgeQuoteRequest = {
  fromChainId: number;
  toChainId: number;
  tokenAddress: string;
  amountCents: number;
};

export type BridgeQuoteResponse = {
  quoteId: string;
  estimatedFeesCents: number;
  estimatedTimeMinutes: number;
  exchangeRate: number;
  expiresAt: string;
};

export type FacilitatorRegistration = {
  name: string;
  address: string;
  endpoint: string;
  initialStakeCents: number;
};

export type SlashingProposal = {
  facilitatorAddress: string;
  reason: string;
  evidenceLink: string;
  penaltyCents: number;
};

export type GovernanceFacilitator = {
  id: string;
  name: string;
  address: string;
  endpoint: string;
  stakeCents: number;
  status: "active" | "slashed" | "jailed";
  riskScore: number; // 0 to 100
};

export type StoreData = {
  agents: Agent[];
  mandates: Mandate[];
  attempts: PaymentAttempt[];
  workerTasks: WorkerTask[];
  auditEntries: AuditEntry[];
  domainEvents: DomainEvent[];
  groupedApprovals: GroupedApproval[];
};
