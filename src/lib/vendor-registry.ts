import type { FallbackGate, Vendor } from "@/lib/domain/types";
import type { VendorRuntimeEndpointSummary } from "@/lib/infrastructure/env";

export const vendorRegistry: Vendor[] = [
  {
    id: "morph-market-data",
    name: "Morph Market Data",
    mode: "primary",
    status: "unknown",
    morphNative: true,
    receiptCapability: true,
    adapterKey: "primary-sandbox",
  },
  {
    id: "morph-research-net",
    name: "Morph Research Net",
    mode: "primary",
    status: "unknown",
    morphNative: true,
    receiptCapability: true,
    adapterKey: "primary-sandbox",
  },
  {
    id: "mandate402-demo-wrapper",
    name: "Mandate402 Fallback Adapter",
    mode: "fallback-only",
    status: "degraded",
    morphNative: true,
    receiptCapability: true,
    adapterKey: "fallback-adapter",
  },
];

export function buildVendorRuntimeRegistry(input: {
  runtimeEndpoints: VendorRuntimeEndpointSummary[];
  fallbackGate: FallbackGate;
}) {
  const runtimeById = new Map(
    input.runtimeEndpoints.map((entry) => [entry.id, entry]),
  );

  return vendorRegistry.map((vendor) => {
    if (vendor.mode === "primary") {
      const runtime = runtimeById.get(vendor.id);
      const status = !runtime?.configured
        ? "blocked"
        : runtime.localOnly
          ? "degraded"
          : "available";

      return {
        ...vendor,
        status,
      } satisfies Vendor;
    }

    const fallbackStatus =
      input.fallbackGate.decision_status === "fallback_activated"
        ? "available"
        : input.fallbackGate.decision_status === "fallback_approved"
          ? "degraded"
          : "blocked";

    return {
      ...vendor,
      status: fallbackStatus,
    } satisfies Vendor;
  });
}
