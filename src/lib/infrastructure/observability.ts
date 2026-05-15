import { createId } from "@/lib/infrastructure/id";

export function readCorrelationId(request?: Request) {
  return (
    request?.headers.get("x-correlation-id") ??
    request?.headers.get("x-request-id") ??
    createId("corr")
  );
}
