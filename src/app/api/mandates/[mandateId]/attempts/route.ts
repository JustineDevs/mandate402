import { z } from "zod";

import { jsonCreated, jsonError } from "@/lib/infrastructure/api";
import { logEvent } from "@/lib/infrastructure/logger";
import { readCorrelationId } from "@/lib/infrastructure/observability";
import { AuthError, requireOperator } from "@/lib/modules/auth";
import { runAttempt } from "@/lib/modules/mandates";

const attemptSchema = z.object({
  vendorId: z.string().min(1),
  amountCents: z.number().int().positive(),
  paymentIdentifier: z.string().min(1).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ mandateId: string }> },
) {
  try {
    const operator = await requireOperator(request);
    const correlationId = readCorrelationId(request);
    const { mandateId } = await params;
    const body = await request.json();
    const input = attemptSchema.parse(body);
    const attempt = await runAttempt({
      mandateId,
      vendorId: input.vendorId,
      amountCents: input.amountCents,
      operatorId: operator.operatorId,
      paymentIdentifier: input.paymentIdentifier,
      correlationId,
    });
    logEvent("info", "api.attempt.created", {
      correlationId,
      mandateId,
      attemptId: attempt.id,
      status: attempt.status,
    });
    return jsonCreated({ attempt, correlationId });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonError(error.message, 401);
    }

    throw error;
  }
}
