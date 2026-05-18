import { jsonError, jsonOk } from "@/lib/infrastructure/api";
import { logEvent } from "@/lib/infrastructure/logger";
import { AuthError, requireOperator } from "@/lib/modules/auth";
import { revokeMandate } from "@/lib/modules/mandates";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ mandateId: string }> },
) {
  try {
    const operator = await requireOperator(request);
    const { mandateId } = await params;
    const mandate = await revokeMandate(mandateId);
    logEvent("info", "api.mandate.revoked", {
      mandateId,
      operatorId: operator.operatorId,
    });
    return jsonOk({ mandate });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonError(error.message, 401);
    }

    throw error;
  }
}
