import { jsonOk } from "@/lib/infrastructure/api";
import { vendorRegistry } from "@/lib/vendor-registry";

export async function GET() {
  return jsonOk({ vendors: vendorRegistry });
}
