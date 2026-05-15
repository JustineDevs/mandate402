import {
  availableBudgetCents,
  mandateCanReserve,
} from "@/lib/domain/state-machines";
import type { Mandate, Vendor } from "@/lib/domain/types";

type PolicyInput = {
  mandate: Mandate;
  vendor: Vendor | undefined;
  amountCents: number;
};

export type PolicyResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "mandate_not_active"
        | "mandate_not_reservable"
        | "vendor_not_allowlisted"
        | "vendor_not_found"
        | "receipt_capability_missing"
        | "budget_exceeded";
    };

export function evaluatePolicy({
  mandate,
  vendor,
  amountCents,
}: PolicyInput): PolicyResult {
  if (mandate.status !== "issued_active") {
    return { ok: false, reason: "mandate_not_active" };
  }

  const expiryMs = Date.parse(mandate.expiresAt);
  if (!Number.isFinite(expiryMs) || expiryMs <= Date.now()) {
    return { ok: false, reason: "mandate_not_active" };
  }

  if (!mandateCanReserve(mandate)) {
    return { ok: false, reason: "mandate_not_reservable" };
  }

  if (!vendor) {
    return { ok: false, reason: "vendor_not_found" };
  }

  if (!mandate.approvedVendorIds.includes(vendor.id)) {
    return { ok: false, reason: "vendor_not_allowlisted" };
  }

  if (mandate.requiresReceiptCapability && !vendor.receiptCapability) {
    return { ok: false, reason: "receipt_capability_missing" };
  }

  if (availableBudgetCents(mandate) < amountCents) {
    return { ok: false, reason: "budget_exceeded" };
  }

  return { ok: true };
}
