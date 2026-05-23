import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { getSystemStatus } from "@/lib/infrastructure/system-status";
import { requireOperator } from "@/lib/modules/auth";

export async function GET(request: Request) {
  try {
    await requireOperator(request);
    const status = await getSystemStatus();
    return jsonOk(status);
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
