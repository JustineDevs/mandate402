import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { processExecutionQueue } from "@/lib/modules/execution-worker";
import { requireWorkerRequest } from "@/lib/modules/worker-auth";

export async function POST(request: Request) {
  try {
    const worker = requireWorkerRequest(request);
    const result = await processExecutionQueue(10, worker.workerId);
    return jsonOk({ result });
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }
    throw error;
  }
}
