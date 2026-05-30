import { z } from "zod";

import { UnauthorizedError } from "@/lib/domain/errors";
import { isFutureIsoTimestamp } from "@/lib/domain/time";
import { jsonCreated, jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { logEvent } from "@/lib/infrastructure/logger";
import { readCorrelationId } from "@/lib/infrastructure/observability";
import { requireOperator } from "@/lib/modules/auth";
import { createMandate, listMandates } from "@/lib/modules/mandates";
import { requireOperatorOnboardingComplete } from "@/lib/operator-access";

const createMandateSchema = z.object({
  name: z.string().min(1),
  agentId: z.string().min(1),
  agentName: z.string().min(1).optional(),
  budgetCapCents: z.number().int().positive(),
  expiresAt: z.string().refine((value) => isFutureIsoTimestamp(value), {
    message: "expiresAt must be a future ISO timestamp.",
  }),
  approvedVendorIds: z.array(z.string()).min(1),
  requiresReceiptCapability: z.boolean(),
});

export async function GET(request: Request) {
  try {
    await requireOperator(request);
    const mandates = await listMandates();
    return jsonOk({ mandates });
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const operator = await requireOperator(request);
    const bearer = request.headers.get("authorization");
    const accessToken = bearer?.startsWith("Bearer ")
      ? bearer.slice("Bearer ".length)
      : undefined;
    if (!accessToken) {
      throw new UnauthorizedError("Missing bearer token.");
    }
    await requireOperatorOnboardingComplete(accessToken, operator.operatorId);
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
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
