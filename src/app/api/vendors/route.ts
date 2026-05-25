import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { getVendorRuntimeEndpointSummary } from "@/lib/infrastructure/env";
import { readFallbackGate } from "@/lib/infrastructure/fallback-gate";
import { requireOperator } from "@/lib/modules/auth";
import { buildVendorRuntimeRegistry } from "@/lib/vendor-registry";

export async function GET(request: Request) {
  try {
    await requireOperator(request);
    const fallbackGate = await readFallbackGate();
    return jsonOk({
      vendors: buildVendorRuntimeRegistry({
        runtimeEndpoints: getVendorRuntimeEndpointSummary(),
        fallbackGate,
      }),
    });
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
