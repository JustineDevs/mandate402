import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { logEvent } from "@/lib/infrastructure/logger";
import { readCorrelationId } from "@/lib/infrastructure/observability";
import { requireOperator } from "@/lib/modules/auth";
import { ensureReconciliationQueued } from "@/lib/modules/execution-worker";

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
    const queued = await ensureReconciliationQueued({
      mandateId,
      attemptId,
      correlationId,
    });
    logEvent("info", "api.attempt.reconcile_queued", {
      correlationId,
      mandateId,
      attemptId,
      taskId: queued.task.id,
      status: queued.attempt.status,
    });
    return jsonOk(
      { attempt: queued.attempt, task: queued.task, correlationId },
      { status: 202 },
    );
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
