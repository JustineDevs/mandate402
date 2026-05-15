import { z } from "zod";

import { isFutureIsoTimestamp } from "@/lib/domain/time";
import { jsonCreated, jsonError, jsonOk } from "@/lib/infrastructure/api";
import { logEvent } from "@/lib/infrastructure/logger";
import { readCorrelationId } from "@/lib/infrastructure/observability";
import { AuthError, requireOperator } from "@/lib/modules/auth";
import { createMandate, listMandates } from "@/lib/modules/mandates";

const createMandateSchema = z.object({
  name: z.string().min(1),
  agentId: z.string().min(1),
  agentName: z.string().min(1),
  budgetCapCents: z.number().int().positive(),
  expiresAt: z.string().refine((value) => isFutureIsoTimestamp(value), {
    message: "expiresAt must be a future ISO timestamp.",
  }),
  approvedVendorIds: z.array(z.string()).min(1),
  requiresReceiptCapability: z.boolean(),
});

export async function GET() {
  const mandates = await listMandates();
  return jsonOk({ mandates });
}

export async function POST(request: Request) {
  try {
    requireOperator(request);
    const correlationId = readCorrelationId(request);
    const body = await request.json();
    const input = createMandateSchema.parse(body);
    const mandate = await createMandate({ ...input, correlationId });
    logEvent("info", "api.mandate.created", {
      correlationId,
      mandateId: mandate.id,
      agentId: mandate.agentId,
    });
    return jsonCreated({ mandate, correlationId });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonError(error.message, 401);
    }

    throw error;
  }
}
