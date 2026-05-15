import type { Vendor } from "@/lib/domain/types";

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
    name: "Mandate402 Demo Wrapper",
    mode: "fallback-only",
    status: "degraded",
    morphNative: true,
    receiptCapability: true,
    adapterKey: "fallback-demo",
  },
];
