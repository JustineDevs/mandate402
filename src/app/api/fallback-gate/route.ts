import { jsonOk } from "@/lib/infrastructure/api";
import { readFallbackGate } from "@/lib/infrastructure/fallback-gate";

export async function GET() {
  const fallbackGate = await readFallbackGate();
  return jsonOk({ fallbackGate });
}
