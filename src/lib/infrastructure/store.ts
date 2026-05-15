import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { StoreData } from "@/lib/domain/types";
import { nowIso } from "@/lib/infrastructure/clock";

const dataDir = path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "store.json");

const seedData: StoreData = {
  agents: [
    {
      id: "agent_research_alpha",
      name: "Research Alpha",
      status: "active",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ],
  mandates: [
    {
      id: "mdt_demo_001",
      name: "Research Agent Spend",
      agentId: "agent_research_alpha",
      agentName: "Research Alpha",
      status: "issued_active",
      budgetCapCents: 5000,
      reservedCents: 0,
      consumedCents: 1200,
      requiresReceiptCapability: true,
      approvedVendorIds: ["morph-market-data", "morph-research-net"],
      morphIssueTxId: "0xmorphissue001",
      morphRevokeTxId: null,
      expiresAt: "2026-05-29T23:59:00.000Z",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ],
  attempts: [
    {
      id: "att_demo_success",
      mandateId: "mdt_demo_001",
      vendorId: "morph-market-data",
      amountCents: 1200,
      operatorId: "operator_demo",
      status: "executed_charge_succeeded",
      financialOutcome: "executed_charge_succeeded",
      receiptEvidence: "received_valid",
      blockedReason: null,
      chargeReference: "charge_morph_001",
      paymentIdentifier: "pid_demo_success",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "att_demo_blocked",
      mandateId: "mdt_demo_001",
      vendorId: "rogue-vendor",
      amountCents: 1800,
      operatorId: "operator_demo",
      status: "policy_denied",
      financialOutcome: "policy_denied",
      receiptEvidence: "not_required",
      blockedReason: "vendor_not_allowlisted",
      chargeReference: null,
      paymentIdentifier: "pid_demo_blocked",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ],
  auditEntries: [
    {
      id: "audit_issue_demo",
      mandateId: "mdt_demo_001",
      attemptId: null,
      type: "mandate_issued",
      message: "Mandate anchored on Morph.",
      createdAt: nowIso(),
    },
  ],
  domainEvents: [
    {
      id: "evt_issue_demo",
      entityType: "mandate",
      entityId: "mdt_demo_001",
      eventType: "mandate_issued",
      correlationId: null,
      occurredAt: nowIso(),
      metadata: {
        morphIssueTxId: "0xmorphissue001",
        status: "issued_active",
      },
    },
  ],
};

export function createSeedStoreData(): StoreData {
  return structuredClone(seedData);
}

let lock = Promise.resolve();

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, JSON.stringify(seedData, null, 2), "utf8");
  }
}

export async function readStore(): Promise<StoreData> {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  return JSON.parse(raw) as StoreData;
}

export async function writeStore(data: StoreData) {
  await ensureStore();
  await writeFile(storePath, JSON.stringify(data, null, 2), "utf8");
}

export async function resetStoreForTests(
  data: StoreData = createSeedStoreData(),
) {
  await writeStore(data);
}

export async function withStoreLock<T>(work: (data: StoreData) => Promise<T>) {
  const previous = lock;
  let release!: () => void;
  lock = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    const data = await readStore();
    const result = await work(data);
    await writeStore(data);
    return result;
  } finally {
    release();
  }
}
