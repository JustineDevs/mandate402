import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { readFallbackGate } from "@/lib/infrastructure/fallback-gate";
import { requireOperator } from "@/lib/modules/auth";

export async function GET(request: Request) {
  try {
    await requireOperator(request);
    const fallbackGate = await readFallbackGate();
    return jsonOk({ fallbackGate });
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
