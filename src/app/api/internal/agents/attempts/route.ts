import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";

/**
 * Reserved for signed/service-auth agent callers that POST governed payment attempts
 * under operator-created mandates. Not enabled in the current MVP.
 */
export async function POST() {
  try {
    return jsonOk(
      {
        enabled: false,
        surface: "agent_execution_api",
        message:
          "Agent execution API is not enabled. Agents remain governed identities in the mandate store until service-auth dispatch is implemented.",
        plannedRoute: "POST /api/internal/agents/attempts",
        delegatesTo: "POST /api/mandates/:mandateId/attempts",
      },
      { status: 501 },
    );
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
