import { jsonError, jsonOk } from "@/lib/infrastructure/api";
import { logEvent } from "@/lib/infrastructure/logger";
import { readCorrelationId } from "@/lib/infrastructure/observability";
import { AuthError, requireOperator } from "@/lib/modules/auth";
import { reconcileAttempt } from "@/lib/modules/mandates";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ mandateId: string; attemptId: string }>;
  },
) {
  try {
    await requireOperator(request);
    const correlationId = readCorrelationId(request);
    const { mandateId, attemptId } = await params;
    const attempt = await reconcileAttempt({
      mandateId,
      attemptId,
      correlationId,
    });
    logEvent("info", "api.attempt.reconciled", {
      correlationId,
      mandateId,
      attemptId,
      status: attempt.status,
    });
    return jsonOk({ attempt, correlationId });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonError(error.message, 401);
    }

    throw error;
  }
}
