import { getDashboardData } from "@/lib/dashboard-data";
import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { requireOperator } from "@/lib/modules/auth";

export async function GET(request: Request) {
  try {
    const operator = await requireOperator(request);
    const dashboard = await getDashboardData();
    return jsonOk({ operator, dashboard });
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
