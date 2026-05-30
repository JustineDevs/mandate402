import type { GroupedApproval } from "@/lib/domain/types";
import { nowIso } from "@/lib/infrastructure/clock";
import { createId } from "@/lib/infrastructure/id";

/**
 * Mock data for Grouped Approvals to unblock UI development.
 * This should be replaced by real fetch calls to /api/approvals once the backend is ready.
 */

const MOCK_APPROVALS: GroupedApproval[] = [
  {
    id: createId("gap"),
    actionType: "high_value_payment",
    description:
      "Approve $5,000 payment for quarterly server costs to Morph Infra Vendor.",
    threshold: 3,
    signatures: ["operator_1", "operator_2"],
    status: "pending",
    entityId: "att_mock_1",
    correlationId: "corr_mock_1",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    executedAt: null,
    executedBy: null,
  },
  {
    id: createId("gap"),
    actionType: "policy_change",
    description: "Update treasury velocity window to $20,000 / 24h.",
    threshold: 2,
    signatures: ["operator_1"],
    status: "pending",
    entityId: "pol_mock_1",
    correlationId: "corr_mock_2",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    executedAt: null,
    executedBy: null,
  },
  {
    id: createId("gap"),
    actionType: "vendor_allowlist_change",
    description: "Add 'Tavily Search API' to the verified merchant allowlist.",
    threshold: 2,
    signatures: ["operator_1", "operator_3"],
    status: "ready_to_execute",
    entityId: "ven_mock_1",
    correlationId: "corr_mock_3",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    executedAt: null,
    executedBy: null,
  },
];

export async function getPendingApprovals(): Promise<GroupedApproval[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_APPROVALS.filter(
    (a) => a.status !== "executed" && a.status !== "cancelled",
  );
}

export async function signApproval(
  approvalId: string,
  operatorId: string,
): Promise<GroupedApproval> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const approval = MOCK_APPROVALS.find((a) => a.id === approvalId);
  if (!approval) throw new Error("Approval not found");

  if (!approval.signatures.includes(operatorId)) {
    approval.signatures.push(operatorId);
    approval.updatedAt = nowIso();
    if (approval.signatures.length >= approval.threshold) {
      approval.status = "ready_to_execute";
    }
  }

  return { ...approval };
}

export async function executeApproval(
  approvalId: string,
  operatorId: string,
): Promise<GroupedApproval> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const approval = MOCK_APPROVALS.find((a) => a.id === approvalId);
  if (!approval) throw new Error("Approval not found");

  if (approval.status !== "ready_to_execute") {
    throw new Error("Threshold not met or already executed");
  }

  approval.status = "executed";
  approval.executedAt = nowIso();
  approval.executedBy = operatorId;
  approval.updatedAt = nowIso();

  return { ...approval };
}
