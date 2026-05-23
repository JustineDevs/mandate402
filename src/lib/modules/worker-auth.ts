import { UnauthorizedError } from "@/lib/domain/errors";
import { getWorkerToken } from "@/lib/infrastructure/env";

export class WorkerAuthError extends UnauthorizedError {
  constructor(message = "Unauthorized worker request.") {
    super(message);
    this.name = "WorkerAuthError";
  }
}

export function requireWorkerRequest(request: Request) {
  const expected = getWorkerToken();
  if (!expected) {
    throw new WorkerAuthError(
      "Worker auth is not configured. MANDATE402_WORKER_TOKEN is required.",
    );
  }

  const bearer = request.headers.get("authorization");
  const presented = bearer?.startsWith("Bearer ")
    ? bearer.slice("Bearer ".length)
    : request.headers.get("x-worker-token");

  if (!presented || presented !== expected) {
    throw new WorkerAuthError();
  }

  return {
    workerId: request.headers.get("x-worker-id") ?? "worker_runtime",
  };
}
