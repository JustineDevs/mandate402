import { jsonOk } from "@/lib/infrastructure/api";
import { getSystemStatus } from "@/lib/infrastructure/system-status";

export async function GET() {
  const status = await getSystemStatus();
  return jsonOk(status);
}
