import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { buildConsoleRuntimeChrome } from "@/lib/infrastructure/console-runtime";

export async function GET(request: Request) {
  try {
    const chrome = await buildConsoleRuntimeChrome(request);
    return jsonOk(chrome);
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
